import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ownerServicesService,
  ServiceFilters,
  ServicePayload,
} from "../../services/owner/services.service";

const buildKey = (filters: ServiceFilters) => [
  "owner-services",
  filters.branchId,
  filters.search,
  filters.page,
  filters.limit,
];

export function useServices(filters: ServiceFilters) {
  return useQuery({
    queryKey: buildKey(filters),
    queryFn: () => ownerServicesService.list(filters),
    enabled: Boolean(filters.branchId),
    keepPreviousData: true,
  });
}

export function useServiceActions(branchId?: string | null) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["owner-services", branchId],
      exact: false,
    });

  const create = useMutation({
    mutationFn: (payload: ServicePayload) =>
      ownerServicesService.create({
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
      data: Partial<ServicePayload>;
    }) => ownerServicesService.update(id, data),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => ownerServicesService.updateStatus(id, isActive),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => ownerServicesService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, updateStatus, remove };
}
