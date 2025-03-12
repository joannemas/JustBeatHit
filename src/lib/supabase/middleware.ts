import { ANON_PATH, PUBLIC_PATH } from '@/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createClient()
    let { data: { user } } = await supabase.auth.getUser()

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.


    const pathname = request.nextUrl.pathname
    const isPublicPath = PUBLIC_PATH.some((pattern) => pattern.test(pathname))
    const isAnonymPath = ANON_PATH.some((pattern) => pattern.test(pathname))

    // If no user and is anonym access path, we redirect the user to captcha if it's valid, we create an anonym user
    if(!user && isAnonymPath){
        const url = request.nextUrl.clone()
        const returnTo = url.pathname + url.search
    
        const captchaUrl = new URL("/auth/verify-captcha", request.url)
        captchaUrl.searchParams.set("returnTo", returnTo)
        
        return NextResponse.redirect(captchaUrl)
    }

    if (
        !user &&
        !isPublicPath
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}