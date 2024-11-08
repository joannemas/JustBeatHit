import { z } from "zod";

export const registerSchema = z.object({
    email: z.string({ required_error: "Email can't be empty" }).email({ message: "String must be a valid e-mail adress." }),
    username: z.string({ required_error: "Username can't be empty" }).min(3, "Username must be at least 3 characters."),
    password: z.string({ required_error: "Password can't be empty" }).min(8, "Password must be at least 8 characters.").regex(/[A-Z]/, "Password must contain at least one uppercase letter.").regex(/[a-z]/, "Password must contain at least one lowercase letter.").regex(/\d/, "Password must contain at least one digit.").regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
    repeatPassword: z.string({ required_error: "Repeat password can't be empty" })
}).superRefine(({ repeatPassword, password }, ctx) => {
    if (repeatPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "The passwords did not match",
            path: ['repeatPassword']
        });
    }
});

export const loginSchema = z.object({
    email: z.string().email('Email must be a valid email adress'),
    password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/\d/, "Password must contain at least one digit").regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})