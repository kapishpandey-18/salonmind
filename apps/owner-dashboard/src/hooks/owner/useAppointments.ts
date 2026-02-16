import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ownerAppointmentsService,
  AppointmentFilters,
  AppointmentPayload,
} from "../../services/owner/appointments.service";
const buildKey = (filters: AppointmentFilters) => [
  "owner-appointments",
  filters.branchId,
  filters.search,
  filters.status,
  filters.from,
  filters.to,
  filters.page,
  filters.limit,
];

export function useAppointments(filters: AppointmentFilters) {
  return useQuery({
    queryKey: buildKey(filters),
    queryFn: () => ownerAppointmentsService.list(filters),
    enabled: Boolean(filters.branchId),
    keepPreviousData: true,
  });
}

export function useAppointmentActions(branchId?: string | null) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["owner-appointments", branchId],
      exact: false,
    });

  const create = useMutation({
    mutationFn: (payload: AppointmentPayload) =>
      ownerAppointmentsService.create({
        ...payload,
        branchId: payload.branchId || branchId || undefined,
      }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AppointmentPayload>;
    }) => ownerAppointmentsService.update(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => ownerAppointmentsService.remove(id),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => ownerAppointmentsService.cancel(id, reason),
    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,
    cancel,
  };
}
