import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerService } from "../services/ownerService";

export function useSetActiveBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchId: string) => ownerService.setActiveBranch(branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-context"] });
    },
  });
}
