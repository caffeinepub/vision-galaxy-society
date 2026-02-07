import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type Time = bigint;
export interface Notification {
    id: bigint;
    recipient: Principal;
    isRead: boolean;
    message: string;
    timestamp: Time;
}
export interface MaintenanceRecord {
    paymentTimestamp?: Time;
    month: string;
    year: bigint;
    isPaid: boolean;
    upiRef?: string;
    flatNumber: bigint;
}
export interface Notice {
    id: bigint;
    title: string;
    expiryDate?: Time;
    message: string;
}
export interface FlatPaymentStatus {
    paymentTimestamp?: Time;
    isPaid: boolean;
    upiRef?: string;
    flatNumber: bigint;
}
export interface Complaint {
    id: bigint;
    status: string;
    resolutionNote?: string;
    description: string;
    category: string;
    priority?: string;
    flatNumber: bigint;
}
export interface Expenditure {
    month: string;
    year: bigint;
    totalAmount: bigint;
    notes?: string;
    items: Array<[string, bigint]>;
}
export interface SecretarySettings {
    guardMobileNumber: string;
    upiId: string;
    maintenanceAmount: bigint;
}
export interface UserProfile {
    userType: string;
    userId: string;
    name: string;
    flatNumber?: bigint;
}
export interface VisitorRequest {
    id: bigint;
    status: string;
    mobileNumber: string;
    visitorName: string;
    purpose: string;
    flatNumber: bigint;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    checkAndNotifyOverdueMaintenance(flatNumber: bigint, month: string, year: bigint): Promise<void>;
    createNotice(title: string, message: string, expiryDate: Time | null): Promise<bigint>;
    createVisitorRequest(visitorName: string, purpose: string, flatNumber: bigint, mobileNumber: string): Promise<bigint>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getAllMaintenanceRecords(month: string, year: bigint): Promise<Array<MaintenanceRecord>>;
    getAllNotices(): Promise<Array<Notice>>;
    getAllVisitorRequests(): Promise<Array<VisitorRequest>>;
    getCallerNotifications(): Promise<Array<Notification>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaintsByFlat(flatNumber: bigint): Promise<Array<Complaint>>;
    getExpenditures(month: string, year: bigint): Promise<Expenditure | null>;
    getFlatMobileNumbers(flatNumber: bigint): Promise<Array<string>>;
    getMaintenanceAmount(): Promise<bigint>;
    getMaintenanceRecord(flatNumber: bigint, month: string, year: bigint): Promise<MaintenanceRecord | null>;
    getMaintenanceStatusForAllFlats(month: string, year: bigint): Promise<Array<FlatPaymentStatus>>;
    getOverdueFlats(month: string, year: bigint): Promise<Array<bigint>>;
    getSecretarySettings(): Promise<SecretarySettings>;
    getUpiId(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorRequestsByFlat(flatNumber: bigint): Promise<Array<VisitorRequest>>;
    getWhatsappNumber(): Promise<string>;
    initializePassword(userId: string, password: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    lodgeComplaint(flatNumber: bigint, category: string, description: string, priority: string | null): Promise<bigint>;
    markAllNotificationsAsRead(): Promise<void>;
    markNotificationAsRead(notificationId: bigint): Promise<void>;
    notifyOverdueFlats(month: string, year: bigint): Promise<void>;
    promoteToSecretary(user: Principal): Promise<void>;
    recordExpenditure(month: string, year: bigint, items: Array<[string, bigint]>, totalAmount: bigint, notes: string | null): Promise<void>;
    recordPayment(flatNumber: bigint, month: string, year: bigint, upiRef: string, timestamp: Time): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setUpiId(newUpiId: string): Promise<void>;
    setWhatsappNumber(newNumber: string): Promise<void>;
    updateComplaintStatus(complaintId: bigint, newStatus: string, resolutionNote: string | null): Promise<void>;
    updateFlatMobileNumbers(flatNumber: bigint, numbers: Array<string>): Promise<void>;
    updateSecretarySettings(newSettings: SecretarySettings): Promise<void>;
    updateVisitorRequestStatus(requestId: bigint, newStatus: string): Promise<void>;
}
