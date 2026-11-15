import { api } from "./client";
import type { LoginResponse, MeResponse, SignupRequest, SignupResponse } from "./types";

// 인증·내 정보 API. 화면은 fetch를 직접 쓰지 않고 이 함수들을 부른다.

export const authApi = {
  login: (loginId: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { loginId, password }, false),

  signup: (body: SignupRequest) => api.post<SignupResponse>("/auth/signup", body, false),

  me: () => api.get<MeResponse>("/me"),
};
