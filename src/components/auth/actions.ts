"use server"

import { AuthState } from "./auth";
import { loginSchema, passwordSchema, registerAnonymeSchema, registerSchema } from "./validations";
import { redirect } from "next/navigation";

import { revalidatePath } from 'next/cache'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { AuthError } from "@supabase/supabase-js";
import { headers } from "next/headers";

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
    const supabaseAdmin = createAdminClient()
    const {data: {user}} = await supabase.auth.getUser()

    const parse = loginSchema.safeParse({
        email: formData.get("email") as string,
        password: formData.get("password") as string
    });

    if (!parse.success) {
        return { errors: parse.error.flatten().fieldErrors }
    }

    const { error, data } = await supabase.auth.signInWithPassword({...parse.data, options: {captchaToken: formData.get("h-captcha-response")?.toString()}})

    if (error) {
        console.error(error)
        if(error.code === 'email_not_confirmed'){
            return { message: error.message + ', veuillez vérifier vos emails' }
        }
        return { message: error.message }
    }

    /** Add game played by anonymous to his permanent account */
    if(user?.is_anonymous){
        await supabaseAdmin.from('games').update({user_id: data.user.id}).eq('user_id', user.id)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function loginAnonymously(prevState: AuthState, captchaToken: string) {
    const supabase = createClient()
    const {data, error} = await supabase.auth.signInAnonymously({options: {captchaToken}})

    if (error) {
        console.error(error)
        return { message: error.message }
    }
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

    const { username, ...fields } = parse.data
    const avatar_url = `https://api.dicebear.com/9.x/adventurer/png?seed=${username}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9&size=128`

    /* Check if the username is already used or not (we have exception in db function for this, but it doesn't return the error to front ) */
    const { data } = await supabase.from('profiles').select('username').eq('username', username).maybeSingle()
    if(data){
        return { message: 'Nom d\'utilisateur déjà utilisé' }
    }

    const {error} = await supabase.auth.signUp({ ...fields, options: { data: { username, avatar_url }, captchaToken: formData.get("h-captcha-response")?.toString(), emailRedirectTo: '/' } })

    if (error) {
        console.error(error)
        if(error.code === 'email_not_confirmed'){
            return { message: error.message + ', veuillez vérifier vos emails' }
        }
        return { message: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/auth/confirmation')
}

export async function registerAnonyme(prevState: AuthState | undefined, formData: FormData) {
    const supabase = createClient()

    const parse = registerAnonymeSchema.safeParse({
        email: formData.get("email") as string,
        username: formData.get("username") as string,
    });

    if (!parse.success) {
        return { errors: parse.error.flatten().fieldErrors }
    }

    const { username, ...fields } = parse.data
    const avatar_url = `https://api.dicebear.com/9.x/adventurer/png?seed=${username}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9&size=128`

    /* Check if the username is already used or not (we have exception in db function for this, but it doesn't return the error to front ) */
    const { data } = await supabase.from('profiles').select('username').eq('username', username).maybeSingle()
    if(data){
        return { message: 'Nom d\'utilisateur déjà utilisé' }
    }

    const {error} = await supabase.auth.updateUser({email: fields.email, data: {username, avatar_url, needPassword: true}})

    if (error) {
        console.error(error)
        if(error.code === 'email_not_confirmed'){
            return { message: error.message + ', veuillez vérifier vos emails' }
        }
        return { message: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/auth/confirmation')
}

export async function createPassword(prevState: AuthState | undefined, formData: FormData){
    const supabase = createClient()

    const parse = passwordSchema.safeParse({
        password: formData.get("password") as string,
        repeatPassword: formData.get("repeatPassword") as string
    });

    if (!parse.success) {
        return { errors: parse.error.flatten().fieldErrors }
    }

    const { password } = parse.data
    const { error } = await supabase.auth.updateUser({password, data: {needPassword: false}})

    if (error) {
        console.error(error)
        return { message: error.message }
    }
    redirect('/')
}