"use server"

import { AuthState } from "./auth";
import { loginSchema, registerSchema } from "./validations";
import { redirect } from "next/navigation";

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function logout() {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error(error)
    }

    revalidatePath('/', 'layout')
    redirect('/auth/login')
}

export async function login(prevState: AuthState | undefined, formData: FormData) {
    const supabase = createClient()

    const parse = loginSchema.safeParse({
        email: formData.get("email") as string,
        password: formData.get("password") as string
    });

    if (!parse.success) {
        return { errors: parse.error.flatten().fieldErrors }
    }

    const data = parse.data

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error(error)
        return { message: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function register(prevState: AuthState | undefined, formData: FormData) {
    const supabase = createClient()

    const parse = registerSchema.safeParse({
        email: formData.get("email") as string,
        username: formData.get("username") as string,
        password: formData.get("password") as string,
        repeatPassword: formData.get("repeatPassword") as string
    });

    if (!parse.success) {
        return { errors: parse.error.flatten().fieldErrors }
    }

    const { username, ...data } = parse.data

    const { data: { user } } = await supabase.auth.signUp({ ...data, options: { data: { username } } })

    /** Signup with currently existing email give a fake user without role
     * So we check the role to check if the user already exist or not
     */
    if (!user?.role) {
        return { message: 'Email already exist' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}