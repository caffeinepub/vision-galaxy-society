import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types for primary entities
  public type MaintenanceRecord = {
    flatNumber : Nat;
    month : Text;
    year : Nat;
    isPaid : Bool;
    upiRef : ?Text;
    paymentTimestamp : ?Time.Time;
  };

  public type Expenditure = {
    month : Text;
    year : Nat;
    items : [(Text, Nat)]; // (description, amount) tuples
    totalAmount : Nat;
    notes : ?Text;
  };

  public type Complaint = {
    id : Nat;
    flatNumber : Nat;
    category : Text;
    description : Text;
    priority : ?Text;
    status : Text; // Open, In Progress, Resolved, Rejected
    resolutionNote : ?Text;
  };

  public type Notice = {
    id : Nat;
    title : Text;
    message : Text;
    expiryDate : ?Time.Time;
  };

  public type VisitorRequest = {
    id : Nat;
    visitorName : Text;
    purpose : Text;
    flatNumber : Nat;
    mobileNumber : Text;
    status : Text;
  };

  public type UserProfile = {
    userId : Text;
    userType : Text; // "FlatOwner", "Secretary", "Guard"
    flatNumber : ?Nat; // Only for FlatOwner
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // State for primary features
  let maintenanceRecords = Map.empty<Text, MaintenanceRecord>(); // key: "flatNumber-month-year"
  let expenditures = Map.empty<Text, Expenditure>();
  let complaints = Map.empty<Nat, Complaint>();
  let notices = Map.empty<Nat, Notice>();
  let visitorRequests = Map.empty<Nat, VisitorRequest>();

  let flatMobileNumbers = Map.empty<Nat, [Text]>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let passwords = Map.empty<Text, Text>(); // userId -> password (in production use proper hashing)
  
  var upiId : Text = "";
  var whatsappNumber : Text = "";
  var noticeIdCounter = 0;
  var complaintIdCounter = 0;
  var visitorRequestIdCounter = 0;

  module Complaint {
    public func compare(a : Complaint, b : Complaint) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Notice {
    public func compare(a : Notice, b : Notice) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Helper function to check if caller is a flat owner for specific flat
  func isCallerFlatOwner(caller : Principal, flatNumber : Nat) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        profile.userType == "FlatOwner" and profile.flatNumber == ?flatNumber
      };
      case (null) { false };
    };
  };

  // Helper function to check if caller is guard
  func isCallerGuard(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.userType == "Guard" };
      case (null) { false };
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot save profiles");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Setup / config functions (Secretary/Admin only)
  public shared ({ caller }) func setUpiId(newUpiId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can update UPI ID");
    };
    upiId := newUpiId;
  };

  public shared ({ caller }) func setWhatsappNumber(newNumber : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can update WhatsApp Number");
    };
    whatsappNumber := newNumber;
  };

  public query ({ caller }) func getUpiId() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view UPI ID");
    };
    upiId;
  };

  public query ({ caller }) func getWhatsappNumber() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view WhatsApp number");
    };
    whatsappNumber;
  };

  // Flat mobile numbers management (Flat owner only for their flat, Secretary can view all)
  public query ({ caller }) func getFlatMobileNumbers(flatNumber : Nat) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view mobile numbers");
    };
    if (not (isCallerFlatOwner(caller, flatNumber) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own flat's mobile numbers");
    };
    switch (flatMobileNumbers.get(flatNumber)) {
      case (?numbers) { numbers };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func updateFlatMobileNumbers(flatNumber : Nat, numbers : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update mobile numbers");
    };
    if (not (isCallerFlatOwner(caller, flatNumber))) {
      Runtime.trap("Unauthorized: Can only update your own flat's mobile numbers");
    };
    if (numbers.size() > 4) {
      Runtime.trap("Cannot have more than 4 mobile numbers");
    };
    flatMobileNumbers.add(flatNumber, numbers);
  };

  // Maintenance (Flat owner for their flat, Secretary can view all)
  public query ({ caller }) func getMaintenanceRecord(flatNumber : Nat, month : Text, year : Nat) : async ?MaintenanceRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view maintenance records");
    };
    if (not (isCallerFlatOwner(caller, flatNumber) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own flat's maintenance records");
    };
    let key = flatNumber.toText() # "-" # month # "-" # year.toText();
    maintenanceRecords.get(key);
  };

  public shared ({ caller }) func recordPayment(flatNumber : Nat, month : Text, year : Nat, upiRef : Text, timestamp : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record payments");
    };
    if (not (isCallerFlatOwner(caller, flatNumber))) {
      Runtime.trap("Unauthorized: Can only record payment for your own flat");
    };
    let record : MaintenanceRecord = {
      flatNumber;
      month;
      year;
      isPaid = true;
      upiRef = ?upiRef;
      paymentTimestamp = ?timestamp;
    };
    let key = flatNumber.toText() # "-" # month # "-" # year.toText();
    maintenanceRecords.add(key, record);
  };

  public query ({ caller }) func getOverdueFlats(month : Text, year : Nat) : async [Nat] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can view overdue flats");
    };
    let overdue = List.empty<Nat>();
    for ((key, record) in maintenanceRecords.entries()) {
      if (not record.isPaid and record.month == month and record.year == year) {
        overdue.add(record.flatNumber);
      };
    };
    overdue.toArray();
  };

  public query ({ caller }) func getAllMaintenanceRecords(month : Text, year : Nat) : async [MaintenanceRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can view all maintenance records");
    };
    let records = List.empty<MaintenanceRecord>();
    for ((key, record) in maintenanceRecords.entries()) {
      if (record.month == month and record.year == year) {
        records.add(record);
      };
    };
    records.toArray();
  };

  // Expenditures (Secretary creates, all authenticated users can view)
  public shared ({ caller }) func recordExpenditure(month : Text, year : Nat, items : [(Text, Nat)], totalAmount : Nat, notes : ?Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can record expenditures");
    };
    let expenditure : Expenditure = {
      month;
      year;
      items;
      totalAmount;
      notes;
    };
    expenditures.add(month # "." # year.toText(), expenditure);
  };

  public query ({ caller }) func getExpenditures(month : Text, year : Nat) : async ?Expenditure {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view expenditures");
    };
    expenditures.get(month # "." # year.toText());
  };

  // Complaints (Flat owner lodges for their flat, Secretary can view/update all)
  public shared ({ caller }) func lodgeComplaint(flatNumber : Nat, category : Text, description : Text, priority : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can lodge complaints");
    };
    if (not (isCallerFlatOwner(caller, flatNumber))) {
      Runtime.trap("Unauthorized: Can only lodge complaint for your own flat");
    };
    let complaint : Complaint = {
      id = complaintIdCounter;
      flatNumber;
      category;
      description;
      priority;
      status = "Open";
      resolutionNote = null;
    };
    complaints.add(complaintIdCounter, complaint);
    complaintIdCounter += 1;
    complaintIdCounter - 1;
  };

  public shared ({ caller }) func updateComplaintStatus(complaintId : Nat, newStatus : Text, resolutionNote : ?Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can update complaints");
    };
    switch (complaints.get(complaintId)) {
      case (?complaint) {
        let updatedComplaint = {
          complaint with
          status = newStatus;
          resolutionNote;
        };
        complaints.add(complaintId, updatedComplaint);
      };
      case (null) {
        Runtime.trap("Complaint not found");
      };
    };
  };

  public query ({ caller }) func getComplaintsByFlat(flatNumber : Nat) : async [Complaint] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view complaints");
    };
    if (not (isCallerFlatOwner(caller, flatNumber) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own flat's complaints");
    };
    let byFlat = complaints.values().toArray().filter(
      func(c) { c.flatNumber == flatNumber }
    );
    byFlat.sort<Complaint>();
  };

  public query ({ caller }) func getAllComplaints() : async [Complaint] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can view all complaints");
    };
    let allComplaints = complaints.values().toArray();
    allComplaints.sort<Complaint>();
  };

  // Notices (Secretary creates, all authenticated users can view)
  public shared ({ caller }) func createNotice(title : Text, message : Text, expiryDate : ?Time.Time) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Secretary can create notices");
    };
    let newNotice : Notice = {
      id = noticeIdCounter;
      title;
      message;
      expiryDate;
    };
    notices.add(noticeIdCounter, newNotice);
    noticeIdCounter += 1;
    noticeIdCounter - 1;
  };

  public query ({ caller }) func getAllNotices() : async [Notice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notices");
    };
    let currentTime = Time.now();
    let validNotices = notices.values().toArray().filter(
      func(n) {
        switch (n.expiryDate) {
          case (?date) { date > currentTime };
          case (null) { true };
        };
      }
    );
    validNotices.sort<Notice>();
  };

  // Visitor requests (Guard creates, Flat owner approves/declines for their flat, Guard/Secretary can view all)
  public shared ({ caller }) func createVisitorRequest(visitorName : Text, purpose : Text, flatNumber : Nat, mobileNumber : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create visitor requests");
    };
    if (not (isCallerGuard(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Guard can create visitor requests");
    };
    let request : VisitorRequest = {
      id = visitorRequestIdCounter;
      visitorName;
      purpose;
      flatNumber;
      mobileNumber;
      status = "Pending";
    };
    visitorRequests.add(visitorRequestIdCounter, request);
    visitorRequestIdCounter += 1;
    visitorRequestIdCounter - 1;
  };

  public shared ({ caller }) func updateVisitorRequestStatus(requestId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update visitor requests");
    };
    switch (visitorRequests.get(requestId)) {
      case (?request) {
        // Only the flat owner of the target flat can approve/decline
        if (not (isCallerFlatOwner(caller, request.flatNumber) or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Can only update visitor requests for your own flat");
        };
        let updatedRequest = {
          request with
          status;
        };
        visitorRequests.add(requestId, updatedRequest);
      };
      case (null) {
        Runtime.trap("Visitor request not found");
      };
    };
  };

  public query ({ caller }) func getAllVisitorRequests() : async [VisitorRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view visitor requests");
    };
    if (not (isCallerGuard(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Guard or Secretary can view all visitor requests");
    };
    visitorRequests.values().toArray();
  };

  public query ({ caller }) func getVisitorRequestsForFlat(flatNumber : Nat) : async [VisitorRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view visitor requests");
    };
    if (not (isCallerFlatOwner(caller, flatNumber))) {
      Runtime.trap("Unauthorized: Can only view visitor requests for your own flat");
    };
    let forFlat = visitorRequests.values().toArray().filter(
      func(r) { r.flatNumber == flatNumber }
    );
    forFlat;
  };

  // Password management (authenticated users can change their own password)
  public shared ({ caller }) func changePassword(userId : Text, currentPassword : Text, newPassword : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot change password");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can change password");
    };
    
    // Verify the caller's userId matches
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userId != userId) {
          Runtime.trap("Unauthorized: Can only change your own password");
        };
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };

    if (newPassword == "") {
      Runtime.trap("New password cannot be empty");
    };
    if (currentPassword == newPassword) {
      Runtime.trap("New password must be different from current password");
    };

    // Verify current password
    switch (passwords.get(userId)) {
      case (?storedPassword) {
        if (storedPassword != currentPassword) {
          Runtime.trap("Incorrect current password");
        };
      };
      case (null) {
        Runtime.trap("User not found");
      };
    };

    // Update password
    passwords.add(userId, newPassword);
  };

  // Admin function to initialize passwords (for seeding default accounts)
  public shared ({ caller }) func initializePassword(userId : Text, password : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can initialize passwords");
    };
    passwords.add(userId, password);
  };
};
