import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ownerStaffService,
  StaffFilters,
  StaffPayload,
} from "../../services/owner/staff.service";

const buildKey = (filters: StaffFilters) => [
  "owner-staff",
  filters.branchId,
  filters.search,
  filters.page,
  filters.limit,
];

export function useStaff(filters: StaffFilters) {
  return useQuery({
    queryKey: buildKey(filters),
    queryFn: () => ownerStaffService.list(filters),
    enabled: Boolean(filters.branchId),
    keepPreviousData: true,
  });
}

export function useStaffActions(branchId?: string | null) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["owner-staff", branchId],
      exact: false,
    });

  const create = useMutation({
    mutationFn: (payload: StaffPayload) =>
      ownerStaffService.create({
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
      data: Partial<StaffPayload>;
    }) => ownerStaffService.update(id, data),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => ownerStaffService.updateStatus(id, isActive),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => ownerStaffService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, updateStatus, remove };
}
