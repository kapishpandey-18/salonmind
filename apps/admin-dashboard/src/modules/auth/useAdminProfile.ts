import { useQuery } from "@tanstack/react-query";
import { fetchAdminProfile } from "../../lib/api";
import { useAuth } from "./AuthProvider";

const profileQueryKey = ["admin", "profile"] as const;

export const useAdminProfile = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchAdminProfile,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
};
