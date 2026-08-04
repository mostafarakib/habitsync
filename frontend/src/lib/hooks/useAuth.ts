import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { authApi } from "../api/auth";
import { useRouter } from "next/navigation";
import { LoginPayload, RegisterPayload } from "@/types";
import { toast } from "sonner";
import { getErrorMessage } from "../errors/errorUtils";
import { useTabStore } from "@/store/tabStore";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: authApi.getCurrentUser,
    retry: false, // don't retry on failure (e.g., 401 Unauthorized)
    staleTime: Infinity, // user data doesn't change unless they log out
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),

    onSuccess: (user) => {
      // cache the user data
      queryClient.setQueryData(queryKeys.auth.currentUser, user);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),

    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.currentUser, user);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSuccess: () => {
      queryClient.clear();
      useTabStore.getState().reset();
      router.push("/login");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
