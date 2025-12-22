import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ownerClientsService,
  ClientFilters,
  ClientPayload,
} from "../../services/owner/clients.service";

const buildKey = (filters: ClientFilters) => [
  "owner-clients",
  filters.branchId,
  filters.search,
  filters.page,
  filters.limit,
];

export function useClients(filters: ClientFilters) {
  return useQuery({
    queryKey: buildKey(filters),
    queryFn: () => ownerClientsService.list(filters),
    enabled: Boolean(filters.branchId),
    keepPreviousData: true,
  });
}

export function useClientActions(branchId?: string | null) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["owner-clients", branchId],
      exact: false,
    });

  const create = useMutation({
    mutationFn: (payload: ClientPayload) =>
      ownerClientsService.create({
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
      data: Partial<ClientPayload>;
    }) => ownerClientsService.update(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => ownerClientsService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
