import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorContext } from './useActorContext';
import type { UserProfile, MaintenanceRecord, Complaint, Notice, VisitorRequest, Notification, Expenditure, SecretarySettings, FlatPaymentStatus } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, actorFetching } = useActorContext();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[Profile Bootstrap] Starting profile fetch...');
      try {
        const profile = await actor.getCallerUserProfile();
        console.log('[Profile Bootstrap] Success:', profile ? 'Profile exists' : 'No profile (new user)');
        return profile;
      } catch (error) {
        console.error('[Profile Bootstrap] Failed:', error instanceof Error ? error.message : String(error));
        throw error;
      }
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
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
      return profile;
    },
    onSuccess: () => {
      // Invalidate to trigger refetch - do not optimistically set
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useChangePassword() {
  const { actor } = useActorContext();

  return useMutation({
    mutationFn: async ({ userId, currentPassword, newPassword }: { userId: string; currentPassword: string; newPassword: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.changePassword(userId, currentPassword, newPassword);
    },
  });
}

export function useGetMaintenanceRecord(flatNumber: bigint, month: string, year: bigint) {
  const { actor, actorFetching } = useActorContext();

  return useQuery<MaintenanceRecord | null>({
    queryKey: ['maintenanceRecord', flatNumber.toString(), month, year.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMaintenanceRecord(flatNumber, month, year);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRecordPayment() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flatNumber, month, year, upiRef, timestamp }: { flatNumber: bigint; month: string; year: bigint; upiRef: string; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordPayment(flatNumber, month, year, upiRef, timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceRecord'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceRecords'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceStatusForAllFlats'] });
      queryClient.invalidateQueries({ queryKey: ['callerNotifications'] });
    },
  });
}

export function useGetOverdueFlats(month: string, year: bigint, enabled: boolean = true) {
  const { actor, actorFetching } = useActorContext();

  return useQuery<bigint[]>({
    queryKey: ['overdueFlats', month, year.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOverdueFlats(month, year);
      } catch (error) {
        console.error('[Overdue Flats] Query failed:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && enabled,
    retry: false,
  });
}

export function useGetAllMaintenanceRecords(month: string, year: bigint) {
  const { actor, actorFetching } = useActorContext();

  return useQuery<MaintenanceRecord[]>({
    queryKey: ['allMaintenanceRecords', month, year.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMaintenanceRecords(month, year);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMaintenanceStatusForAllFlats(month: string, year: bigint) {
  const { actor, actorFetching } = useActorContext();

  return useQuery<FlatPaymentStatus[]>({
    queryKey: ['maintenanceStatusForAllFlats', month, year.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMaintenanceStatusForAllFlats(month, year);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUpiId() {
  const { actor, actorFetching } = useActorContext();

  return useQuery<string>({
    queryKey: ['upiId'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getUpiId();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetUpiId() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUpiId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setUpiId(newUpiId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiId'] });
      queryClient.invalidateQueries({ queryKey: ['secretarySettings'] });
    },
  });
}

export function useGetWhatsappNumber() {
  const { actor, actorFetching } = useActorContext();

  return useQuery<string>({
    queryKey: ['whatsappNumber'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getWhatsappNumber();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetWhatsappNumber() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setWhatsappNumber(newNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappNumber'] });
      queryClient.invalidateQueries({ queryKey: ['secretarySettings'] });
    },
  });
}

export function useGetMaintenanceAmount() {
  const { actor, actorFetching } = useActorContext();

  return useQuery<bigint>({
    queryKey: ['maintenanceAmount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getMaintenanceAmount();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFlatMobileNumbers(flatNumber: bigint) {
  const { actor, actorFetching } = useActorContext();

  return useQuery<string[]>({
    queryKey: ['flatMobileNumbers', flatNumber.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFlatMobileNumbers(flatNumber);
    },
    enabled: !!actor && !actorFetching && flatNumber > BigInt(0),
  });
}

export function useUpdateFlatMobileNumbers() {
  const { actor } = useActorContext();
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
  const { actor } = useActorContext();
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
  const { actor, actorFetching } = useActorContext();

  return useQuery<Complaint[]>({
    queryKey: ['complaintsByFlat', flatNumber.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComplaintsByFlat(flatNumber);
    },
    enabled: !!actor && !actorFetching && flatNumber > BigInt(0),
  });
}

export function useGetAllComplaints() {
  const { actor, actorFetching } = useActorContext();

  return useQuery<Complaint[]>({
    queryKey: ['allComplaints'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllComplaints();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActorContext();
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

export function useGetAllNotices() {
  const { actor, actorFetching } = useActorContext();

  return useQuery<Notice[]>({
    queryKey: ['allNotices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotices();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateNotice() {
  const { actor } = useActorContext();
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

export function useCreateVisitorRequest() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitorName, purpose, flatNumber, mobileNumber }: { visitorName: string; purpose: string; flatNumber: bigint; mobileNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createVisitorRequest(visitorName, purpose, flatNumber, mobileNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitorRequestsByFlat'] });
      queryClient.invalidateQueries({ queryKey: ['allVisitorRequests'] });
    },
  });
}

export function useUpdateVisitorRequestStatus() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, newStatus }: { requestId: bigint; newStatus: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVisitorRequestStatus(requestId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitorRequestsByFlat'] });
      queryClient.invalidateQueries({ queryKey: ['allVisitorRequests'] });
      queryClient.invalidateQueries({ queryKey: ['callerNotifications'] });
    },
  });
}

export function useGetVisitorRequestsByFlat(flatNumber: bigint) {
  const { actor, actorFetching } = useActorContext();

  return useQuery<VisitorRequest[]>({
    queryKey: ['visitorRequestsByFlat', flatNumber.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVisitorRequestsByFlat(flatNumber);
    },
    enabled: !!actor && !actorFetching && flatNumber > BigInt(0),
  });
}

export function useGetAllVisitorRequests() {
  const { actor, actorFetching } = useActorContext();

  return useQuery<VisitorRequest[]>({
    queryKey: ['allVisitorRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVisitorRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCallerNotifications() {
  const { actor, actorFetching } = useActorContext();

  return useQuery<Notification[]>({
    queryKey: ['callerNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerNotifications();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActorContext();
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
  const { actor } = useActorContext();
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

export function useGetSecretarySettings() {
  const { actor, actorFetching } = useActorContext();

  return useQuery<SecretarySettings>({
    queryKey: ['secretarySettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSecretarySettings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateSecretarySettings() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSettings: SecretarySettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSecretarySettings(newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secretarySettings'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceAmount'] });
      queryClient.invalidateQueries({ queryKey: ['upiId'] });
      queryClient.invalidateQueries({ queryKey: ['whatsappNumber'] });
    },
  });
}

export function useGetExpenditures(month: string, year: bigint) {
  const { actor, actorFetching } = useActorContext();

  return useQuery<Expenditure | null>({
    queryKey: ['expenditures', month, year.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getExpenditures(month, year);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRecordExpenditure() {
  const { actor } = useActorContext();
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

export function useNotifyOverdueFlats() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, year }: { month: string; year: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.notifyOverdueFlats(month, year);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerNotifications'] });
    },
  });
}
