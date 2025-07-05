import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { Database } from "~/database.types"
import jwt from "jsonwebtoken"
import { CustomClaims } from "./types"

export function createClient() {
    const cookieStore = cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

export function createAdminClient() {
    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
        }
    )
}

export async function getSessionWithClaims() {
    const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session?.access_token) {
    return {
      session: null,
      claims: null,
      error,
    }
  }

  const claims = jwt.decode(session.access_token) as CustomClaims | null

  return {
    session,
    claims,
    error: null,
  }
}
