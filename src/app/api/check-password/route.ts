import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    const { email, password } = await request.json()

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log(process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        console.error('Mot de passe incorrect :', error.message)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
}
