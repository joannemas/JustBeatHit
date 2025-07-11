import { z } from "zod";

export const registerSchema = z.object({
    email: z.string({ required_error: "L'email ne peut pas être vide" }).email({ message: "L'email doit être une adresse e-mail valide." }),
    username: z.string({ required_error: "Le nom d'utilisateur ne peut pas être vide" }).min(3, "Le nom d'utilisateur doit comporter au moins 3 caractères."),
    password: z.string({ required_error: "Le mot de passe ne peut pas être vide" }).min(8, "Le mot de passe doit comporter au moins 8 caractères.").regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule.").regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule.").regex(/\d/, "Le mot de passe doit contenir au moins un chiffre.").regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial."),
    repeatPassword: z.string({ required_error: "La confirmation du mot de passe ne peut pas être vide" })
}).superRefine(({ repeatPassword, password }, ctx) => {
    if (repeatPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "Les mots de passe ne correspondent pas",
            path: ['repeatPassword']
        });
    }
});

export const registerAnonymeSchema = z.object({
    email: z.string({ required_error: "L'email ne peut pas être vide" }).email({ message: "L'email doit être une adresse e-mail valide." }),
    username: z.string({ required_error: "Le nom d'utilisateur ne peut pas être vide" }).min(3, "Le nom d'utilisateur doit comporter au moins 3 caractères.")
})

export const passwordSchema = z.object({
    password: z.string({ required_error: "Le mot de passe ne peut pas être vide" }).min(8, "Le mot de passe doit comporter au moins 8 caractères.").regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule.").regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule.").regex(/\d/, "Le mot de passe doit contenir au moins un chiffre.").regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial."),
    repeatPassword: z.string({ required_error: "La confirmation du mot de passe ne peut pas être vide" })
}).superRefine(({ repeatPassword, password }, ctx) => {
    if (repeatPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "Les mots de passe ne correspondent pas",
            path: ['repeatPassword']
        });
    }
});

export const loginSchema = z.object({
    email: z.string().email("L'email doit être une adresse e-mail valide"),
    password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères").regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule").regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule").regex(/\d/, "Le mot de passe doit contenir au moins un chiffre").regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
})

export const sendPasswordResetRequestSchema = z.object({
    email: z.string().email("L'email doit être une adresse e-mail valide")
})

export const sendConfirmationSchema = z.object({
    email: z.string().email("L'email doit être une adresse e-mail valide")
})