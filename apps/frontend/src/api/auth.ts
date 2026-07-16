import { api } from "./client";
import { LoginInput, LoginResponseDto } from "@devotion/shared";

export const authApi = {
  login: (input: LoginInput) => api.post<LoginResponseDto>("/auth/login", input),
  me: () => api.get<{ id: string; email: string }>("/auth/me"),
};
