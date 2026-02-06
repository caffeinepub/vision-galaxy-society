import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, MaintenanceRecord, Complaint, Notice, VisitorRequest, Notification, Expenditure } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useChangePassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ userId, currentPassword, newPassword }: { userId: string; currentPassword: string; newPassword: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.changePassword(userId, currentPassword, newPassword);
    },
  });
}

export function useGetMaintenanceRecord(flatNumber: bigint, month: string, year: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<MaintenanceRecord | null>({
    queryKey: ['maintenanceRecord', flatNumber.toString(), month, year.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMaintenanceRecord(flatNumber, month, year);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flatNumber, month, year, upiRef, timestamp }: { flatNumber: bigint; month: string; year: bigint; upiRef: string; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordPayment(flatNumber, month, year, upiRef, timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceRecord'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceRecords'] });
      queryClient.invalidateQueries({ queryKey: ['callerNotifications'] });
    },
  });
}

export function useGetOverdueFlats(month: string, year: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['overdueFlats', month, year.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOverdueFlats(month, year);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMaintenanceRecords(month: string, year: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<MaintenanceRecord[]>({
    queryKey: ['allMaintenanceRecords', month, year.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMaintenanceRecords(month, year);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUpiId() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['upiId'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getUpiId();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetUpiId() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUpiId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setUpiId(newUpiId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiId'] });
    },
  });
}

export function useGetWhatsappNumber() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['whatsappNumber'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getWhatsappNumber();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetWhatsappNumber() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setWhatsappNumber(newNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappNumber'] });
    },
  });
}

export function useGetFlatMobileNumbers(flatNumber: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['flatMobileNumbers', flatNumber.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFlatMobileNumbers(flatNumber);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateFlatMobileNumbers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flatNumber, numbers }: { flatNumber: bigint; numbers: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFlatMobileNumbers(flatNumber, numbers);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flatMobileNumbers', variables.flatNumber.toString()] });
    },
  });
}

export function useLodgeComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flatNumber, category, description, priority }: { flatNumber: bigint; category: string; description: string; priority: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.lodgeComplaint(flatNumber, category, description, priority);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaintsByFlat'] });
      queryClient.invalidateQueries({ queryKey: ['allComplaints'] });
    },
  });
}

export function useGetComplaintsByFlat(flatNumber: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ['complaintsByFlat', flatNumber.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComplaintsByFlat(flatNumber);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllComplaints() {
  const { actor, isFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ['allComplaints'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllComplaints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ complaintId, newStatus, resolutionNote }: { complaintId: bigint; newStatus: string; resolutionNote: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateComplaintStatus(complaintId, newStatus, resolutionNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaintsByFlat'] });
      queryClient.invalidateQueries({ queryKey: ['allComplaints'] });
    },
  });
}

export function useCreateNotice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, message, expiryDate }: { title: string; message: string; expiryDate: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNotice(title, message, expiryDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotices'] });
      queryClient.invalidateQueries({ queryKey: ['callerNotifications'] });
    },
  });
}

export function useGetAllNotices() {
  const { actor, isFetching } = useActor();

  return useQuery<Notice[]>({
    queryKey: ['allNotices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateVisitorRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitorName, purpose, flatNumber, mobileNumber }: { visitorName: string; purpose: string; flatNumber: bigint; mobileNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createVisitorRequest(visitorName, purpose, flatNumber, mobileNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVisitorRequests'] });
      queryClient.invalidateQueries({ queryKey: ['visitorRequestsByFlat'] });
    },
  });
}

export function useGetAllVisitorRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<VisitorRequest[]>({
    queryKey: ['allVisitorRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVisitorRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVisitorRequestsByFlat(flatNumber: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<VisitorRequest[]>({
    queryKey: ['visitorRequestsByFlat', flatNumber.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVisitorRequestsByFlat(flatNumber);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateVisitorRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVisitorRequestStatus(requestId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVisitorRequests'] });
      queryClient.invalidateQueries({ queryKey: ['visitorRequestsByFlat'] });
      queryClient.invalidateQueries({ queryKey: ['callerNotifications'] });
    },
  });
}

export function useGetCallerNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['callerNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerNotifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerNotifications'] });
    },
  });
}

export function useGetExpenditures(month: string, year: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Expenditure | null>({
    queryKey: ['expenditures', month, year.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getExpenditures(month, year);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordExpenditure() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, year, items, totalAmount, notes }: { month: string; year: bigint; items: Array<[string, bigint]>; totalAmount: bigint; notes: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordExpenditure(month, year, items, totalAmount, notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenditures', variables.month, variables.year.toString()] });
    },
  });
}
