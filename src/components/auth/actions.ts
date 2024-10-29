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
    const avatar_url = `https://api.dicebear.com/9.x/adventurer/png?seed=${username}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9&size=128`

    const { data: { user } } = await supabase.auth.signUp({ ...data, options: { data: { username, avatar_url } } })

    /** Signup with currently existing email give a fake user without role
     * So we check the role to check if the user already exist or not
     */
    if (!user?.role) {
        return { message: 'Email already exist' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}