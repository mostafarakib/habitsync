import { AuthUser, LoginPayload, RegisterPayload } from "@/types";
import { apiFetch } from "./client";

export const authApi = {
  register: async (data: RegisterPayload) => {
    const form = new FormData();
    form.append("fullName", data.fullName);
    form.append("email", data.email);
    form.append("password", data.password);
    if (data.avatar) {
      form.append("avatar", data.avatar);
    }

    return await apiFetch<AuthUser>("/auth/register", {
      method: "POST",
      body: form,
    });
  },
  login: async (data: LoginPayload) => {
    return apiFetch<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  logout: async () => {
    return apiFetch<AuthUser>("/auth/logout", {
      method: "POST",
    });
  },
  getCurrentUser: async () => {
    return apiFetch<AuthUser>("/auth/current-user", {
      method: "GET",
    });
  },
};
