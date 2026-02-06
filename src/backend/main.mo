import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";

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
    items : [(Text, Nat)];
    totalAmount : Nat;
    notes : ?Text;
  };

  public type Complaint = {
    id : Nat;
    flatNumber : Nat;
    category : Text;
    description : Text;
    priority : ?Text;
    status : Text;
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
    userType : Text;
    flatNumber : ?Nat;
    name : Text;
  };

  public type Notification = {
    id : Nat;
    recipient : Principal;
    message : Text;
    isRead : Bool;
    timestamp : Time.Time;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  let maintenanceRecords = Map.empty<Text, MaintenanceRecord>();
  let expenditures = Map.empty<Text, Expenditure>();
  let complaints = Map.empty<Nat, Complaint>();
  let notices = Map.empty<Nat, Notice>();
  let visitorRequests = Map.empty<Nat, VisitorRequest>();
  let flatMobileNumbers = Map.empty<Nat, [Text]>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let passwords = Map.empty<Text, Text>();
  let notifications = Map.empty<Nat, Notification>();

  var upiId : Text = "";
  var whatsappNumber : Text = "";
  var noticeIdCounter = 0;
  var complaintIdCounter = 0;
  var visitorRequestIdCounter = 0;
  var notificationIdCounter = 0;

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

  /* ==================== Required Approval Functions ==================== */

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // ==================== Helper Functions ====================

  func isValidFlatNumber(flatNumber : Nat) : Bool {
    flatNumber >= 101 and flatNumber <= 523 and
    flatNumber % 100 >= 1 and flatNumber % 100 <= 23
  };

  func isCallerFlatOwner(caller : Principal, flatNumber : Nat) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        profile.userType == "FlatOwner" and profile.flatNumber == ?flatNumber
      };
      case (null) { false };
    };
  };

  func isCallerGuard(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.userType == "Guard" };
      case (null) { false };
    };
  };

  func getAllFlatOwnerPrincipals() : [Principal] {
    let flatOwners = List.empty<Principal>();
    for ((principal, profile) in userProfiles.entries()) {
      if (profile.userType == "FlatOwner") {
        flatOwners.add(principal);
      };
    };
    flatOwners.toArray();
  };

  func getFlatOwnerPrincipal(flatNumber : Nat) : ?Principal {
    for ((principal, profile) in userProfiles.entries()) {
      if (profile.userType == "FlatOwner" and profile.flatNumber == ?flatNumber) {
        return ?principal;
      };
    };
    null;
  };

  public query ({ caller }) func getCallerNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    notifications.values().toArray().filter(
      func(n) { n.recipient == caller }
    );
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    switch (notifications.get(notificationId)) {
      case (?notification) {
        if (notification.recipient != caller) {
          Runtime.trap("Unauthorized: Cannot modify another user's notification");
        };
        let updated = { notification with isRead = true };
        notifications.add(notificationId, updated);
      };
      case (null) {
        Runtime.trap("Notification not found");
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsAsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    let userNotifications = notifications.filter(
      func(_id, n) { n.recipient == caller }
    );
    userNotifications.forEach(
      func(id, n) {
        let updated = { n with isRead = true };
        notifications.add(id, updated);
      }
    );
  };

  func createNotification(recipient : Principal, message : Text) : () {
    let notification : Notification = {
      id = notificationIdCounter;
      recipient;
      message;
      isRead = false;
      timestamp = Time.now();
    };
    notifications.add(notificationIdCounter, notification);
    notificationIdCounter += 1;
  };

  func notifyAllFlatOwnersAboutNotice(noticeTitle : Text) : () {
    let flatOwners = getAllFlatOwnerPrincipals();
    for (owner in flatOwners.vals()) {
      createNotification(owner, "New society notice: " # noticeTitle);
    };
  };

  public func checkAndNotifyOverdueMaintenance(flatNumber : Nat, month : Text, year : Nat) : () {
    let key = flatNumber.toText() # "-" # month # "-" # year.toText();
    switch (maintenanceRecords.get(key)) {
      case (?record) {
        if (not record.isPaid) {
          switch (getFlatOwnerPrincipal(flatNumber)) {
            case (?owner) {
              createNotification(owner, "Reminder: Maintenance overdue for " # month # "/" # year.toText());
            };
            case (null) {};
          };
        };
      };
      case (null) {};
    };
  };

  // ==================== User Profile Management ====================

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (profile.flatNumber) {
      case (?flatNumber) {
        if (not isValidFlatNumber(flatNumber)) {
          Runtime.trap("Invalid flat number: Must be within valid range (e.g., 101-523)");
        };
      };
      case (null) {};
    };
    userProfiles.add(caller, profile);
  };

  // ==================== Setup / Config ====================

  public shared ({ caller }) func setUpiId(newUpiId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set UPI ID");
    };
    upiId := newUpiId;
  };

  public shared ({ caller }) func setWhatsappNumber(newNumber : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set WhatsApp number");
    };
    whatsappNumber := newNumber;
  };

  public query ({ caller }) func getUpiId() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view UPI ID");
    };
    upiId;
  };

  public query ({ caller }) func getWhatsappNumber() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view WhatsApp number");
    };
    whatsappNumber;
  };

  // ==================== Flat Mobile Numbers ====================

  public query ({ caller }) func getFlatMobileNumbers(flatNumber : Nat) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mobile numbers");
    };
    if (not (isCallerFlatOwner(caller, flatNumber) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own flat's mobile numbers");
    };
    if (not isValidFlatNumber(flatNumber)) {
      Runtime.trap("Invalid flat number: Must be within valid range (e.g., 101-523)");
    };
    switch (flatMobileNumbers.get(flatNumber)) {
      case (?numbers) { numbers };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func updateFlatMobileNumbers(flatNumber : Nat, numbers : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mobile numbers");
    };
    if (not (isCallerFlatOwner(caller, flatNumber))) {
      Runtime.trap("Unauthorized: Can only update your own flat's mobile numbers");
    };
    if (not isValidFlatNumber(flatNumber)) {
      Runtime.trap("Invalid flat number: Must be within valid range (e.g., 101-523)");
    };
    flatMobileNumbers.add(flatNumber, numbers);
  };

  // ==================== Maintenance ====================

  public query ({ caller }) func getMaintenanceRecord(flatNumber : Nat, month : Text, year : Nat) : async ?MaintenanceRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view maintenance records");
    };
    if (
      not (
        isCallerFlatOwner(caller, flatNumber) or
        AccessControl.isAdmin(accessControlState, caller)
      )
    ) {
      Runtime.trap("Unauthorized: Can only view your own flat's maintenance records");
    };
    if (not isValidFlatNumber(flatNumber)) {
      Runtime.trap("Invalid flat number: Must be within valid range (e.g., 101-523)");
    };
    let key = flatNumber.toText() # "-" # month # "-" # year.toText();
    maintenanceRecords.get(key);
  };

  public shared ({ caller }) func recordPayment(flatNumber : Nat, month : Text, year : Nat, upiRef : Text, timestamp : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record payments");
    };
    if (not (isCallerFlatOwner(caller, flatNumber))) {
      Runtime.trap("Unauthorized: Can only record payment for your own flat");
    };
    if (not isValidFlatNumber(flatNumber)) {
      Runtime.trap("Invalid flat number: Must be within valid range (e.g., 101-523)");
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
    createNotification(caller, "Maintenance payment recorded for " # month # "/" # year.toText());
  };

  public query ({ caller }) func getOverdueFlats(month : Text, year : Nat) : async [Nat] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view overdue flats");
    };
    let overdue = List.empty<Nat>();
    for ((key, record) in maintenanceRecords.entries()) {
      if (not record.isPaid and record.month == month and record.year == year) {
        overdue.add(record.flatNumber);
      };
    };
    overdue.toArray();
  };

  public shared ({ caller }) func notifyOverdueFlats(month : Text, year : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can send overdue notifications");
    };
    for ((key, record) in maintenanceRecords.entries()) {
      if (not record.isPaid and record.month == month and record.year == year) {
        checkAndNotifyOverdueMaintenance(record.flatNumber, month, year);
      };
    };
  };

  // ==================== Complaints ====================

  public shared ({ caller }) func lodgeComplaint(flatNumber : Nat, category : Text, description : Text, priority : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can lodge complaints");
    };
    if (not (isCallerFlatOwner(caller, flatNumber))) {
      Runtime.trap("Unauthorized: Can only lodge complaint for your own flat");
    };
    if (not isValidFlatNumber(flatNumber)) {
      Runtime.trap("Invalid flat number: Must be within valid range (e.g., 101-523)");
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
      Runtime.trap("Unauthorized: Only admins can update complaint status");
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
      Runtime.trap("Unauthorized: Only users can view complaints");
    };
    if (
      not (
        isCallerFlatOwner(caller, flatNumber) or
        AccessControl.isAdmin(accessControlState, caller)
      )
    ) {
      Runtime.trap("Unauthorized: Can only view your own flat's complaints");
    };
    let byFlat = complaints.values().toArray().filter(
      func(c) { c.flatNumber == flatNumber }
    );
    byFlat.sort<Complaint>();
  };

  // ==================== Notices ====================

  public shared ({ caller }) func createNotice(title : Text, message : Text, expiryDate : ?Time.Time) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create notices");
    };
    let newNotice : Notice = {
      id = noticeIdCounter;
      title;
      message;
      expiryDate;
    };
    notices.add(noticeIdCounter, newNotice);
    noticeIdCounter += 1;

    notifyAllFlatOwnersAboutNotice(title);

    noticeIdCounter - 1;
  };

  public query ({ caller }) func getAllNotices() : async [Notice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notices");
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

  // ==================== Visitor Requests ====================

  public shared ({ caller }) func createVisitorRequest(visitorName : Text, purpose : Text, flatNumber : Nat, mobileNumber : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create visitor requests");
    };
    if (not (isCallerFlatOwner(caller, flatNumber) or isCallerGuard(caller))) {
      Runtime.trap("Unauthorized: Only flat owners or guards can create visitor requests");
    };
    if (not isValidFlatNumber(flatNumber)) {
      Runtime.trap("Invalid flat number: Must be within valid range (e.g., 101-523)");
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

  public shared ({ caller }) func updateVisitorRequestStatus(requestId : Nat, newStatus : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update visitor request status");
    };
    switch (visitorRequests.get(requestId)) {
      case (?request) {
        if (not (isCallerGuard(caller) or isCallerFlatOwner(caller, request.flatNumber))) {
          Runtime.trap("Unauthorized: Can only update visitor requests for your own flat");
        };
        let updatedRequest = {
          request with status = newStatus;
        };
        visitorRequests.add(requestId, updatedRequest);

        switch (getFlatOwnerPrincipal(request.flatNumber)) {
          case (?owner) {
            createNotification(owner, "Visitor request status changed to: " # newStatus);
          };
          case (null) {};
        };

        if (isCallerFlatOwner(caller, request.flatNumber)) {
          for ((principal, profile) in userProfiles.entries()) {
            if (profile.userType == "Guard") {
              createNotification(principal, "Visitor request status updated for flat " # request.flatNumber.toText());
            };
          };
        };
      };
      case (null) {
        Runtime.trap("Visitor request not found");
      };
    };
  };

  public query ({ caller }) func getVisitorRequestsByFlat(flatNumber : Nat) : async [VisitorRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view visitor requests");
    };
    if (not (isCallerFlatOwner(caller, flatNumber) or isCallerGuard(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view visitor requests for your own flat");
    };
    visitorRequests.values().toArray().filter(
      func(r) { r.flatNumber == flatNumber }
    );
  };

  public query ({ caller }) func getAllVisitorRequests() : async [VisitorRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view visitor requests");
    };
    if (not (isCallerGuard(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only guards and admins can view all visitor requests");
    };
    visitorRequests.values().toArray();
  };

  // ==================== Password Management ====================

  public shared ({ caller }) func changePassword(userId : Text, currentPassword : Text, newPassword : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can change passwords");
    };
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

    passwords.add(userId, newPassword);
  };

  public shared ({ caller }) func initializePassword(userId : Text, password : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can initialize passwords");
    };
    passwords.add(userId, password);
  };

  // ==================== Secretary Reporting ====================

  public query ({ caller }) func getAllMaintenanceRecords(month : Text, year : Nat) : async [MaintenanceRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access maintenance records");
    };

    let records = maintenanceRecords.values().toArray();
    records.filter(
      func(record) {
        record.month == month and record.year == year
      }
    );
  };

  public query ({ caller }) func getAllComplaints() : async [Complaint] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access complaints");
    };
    complaints.values().toArray();
  };

  public query ({ caller }) func getExpenditures(month : Text, year : Nat) : async ?Expenditure {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access expenditures");
    };

    let key = month # "-" # year.toText();
    expenditures.get(key);
  };

  public shared ({ caller }) func recordExpenditure(month : Text, year : Nat, items : [(Text, Nat)], totalAmount : Nat, notes : ?Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can record expenditures");
    };

    let expenditure : Expenditure = {
      month;
      year;
      items;
      totalAmount;
      notes;
    };

    let key = month # "-" # year.toText();
    expenditures.add(key, expenditure);
  };
};
