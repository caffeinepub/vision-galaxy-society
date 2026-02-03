import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Complaint {
    id: bigint;
    status: string;
    resolutionNote?: string;
    description: string;
    category: string;
    priority?: string;
    flatNumber: bigint;
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
export interface Expenditure {
    month: string;
    year: bigint;
    totalAmount: bigint;
    notes?: string;
    items: Array<[string, bigint]>;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    createNotice(title: string, message: string, expiryDate: Time | null): Promise<bigint>;
    createVisitorRequest(visitorName: string, purpose: string, flatNumber: bigint, mobileNumber: string): Promise<bigint>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getAllMaintenanceRecords(month: string, year: bigint): Promise<Array<MaintenanceRecord>>;
    getAllNotices(): Promise<Array<Notice>>;
    getAllVisitorRequests(): Promise<Array<VisitorRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaintsByFlat(flatNumber: bigint): Promise<Array<Complaint>>;
    getExpenditures(month: string, year: bigint): Promise<Expenditure | null>;
    getFlatMobileNumbers(flatNumber: bigint): Promise<Array<string>>;
    getMaintenanceRecord(flatNumber: bigint, month: string, year: bigint): Promise<MaintenanceRecord | null>;
    getOverdueFlats(month: string, year: bigint): Promise<Array<bigint>>;
    getUpiId(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorRequestsForFlat(flatNumber: bigint): Promise<Array<VisitorRequest>>;
    getWhatsappNumber(): Promise<string>;
    initializePassword(userId: string, password: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    lodgeComplaint(flatNumber: bigint, category: string, description: string, priority: string | null): Promise<bigint>;
    recordExpenditure(month: string, year: bigint, items: Array<[string, bigint]>, totalAmount: bigint, notes: string | null): Promise<void>;
    recordPayment(flatNumber: bigint, month: string, year: bigint, upiRef: string, timestamp: Time): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUpiId(newUpiId: string): Promise<void>;
    setWhatsappNumber(newNumber: string): Promise<void>;
    updateComplaintStatus(complaintId: bigint, newStatus: string, resolutionNote: string | null): Promise<void>;
    updateFlatMobileNumbers(flatNumber: bigint, numbers: Array<string>): Promise<void>;
    updateVisitorRequestStatus(requestId: bigint, status: string): Promise<void>;
}
