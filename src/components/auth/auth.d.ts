import { loginSchema, registerSchema } from "./validations";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type AuthState = { message?: string, code?: string, errors?: { [K in keyof RegisterInput]?: RegisterInput[K][] } | { [K in keyof LoginInput]?: LoginInput[K][] } }