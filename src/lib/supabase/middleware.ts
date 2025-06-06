import { ANON_PATH, PUBLIC_PATH } from '@/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './server'
import { isBotRequest } from "@/utils/isBotRequest"
import cloneCookies from '@/utils/cloneCookies'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createClient()
    let { data: { user } } = await supabase.auth.getUser()
    const isBot = isBotRequest(request);

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const pathname = request.nextUrl.pathname
    const isPublicPath = PUBLIC_PATH.some((pattern) => pattern.test(pathname))
    const isAnonymPath = ANON_PATH.some((pattern) => pattern.test(pathname))

    if(isBot){
        const response = NextResponse.next({request})
        response.headers.set('x-is-bot', 'true')
        return response
    }

    // If no user and is anonym access path, we redirect the user to captcha if it's valid, we create an anonym user
    if(!user && isAnonymPath){
        const url = request.nextUrl.clone()
        const returnTo = url.pathname + url.search
    
        const captchaUrl = new URL("/auth/verify-captcha", request.url)
        captchaUrl.searchParams.set("returnTo", returnTo)
        
        const redirectRes = NextResponse.redirect(captchaUrl);
        cloneCookies(supabaseResponse, redirectRes)
        return redirectRes
    }

    if (!isPublicPath) {
        if (!user) {
            // Pas d'utilisateur, redirection vers la page de connexion
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            const redirectRes = NextResponse.redirect(url);
            cloneCookies(supabaseResponse, redirectRes)
            return redirectRes
        }
    
        if (user?.is_anonymous && !isAnonymPath) {
            // Utilisateur anonyme tentant d'accéder à une page non anonyme
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            const redirectRes = NextResponse.redirect(url);
            cloneCookies(supabaseResponse, redirectRes)
            return redirectRes
        }
    }
    
    if(user && !user?.is_anonymous && (pathname === '/auth/login' || pathname === '/auth/register')){
        const url = request.nextUrl.clone();
        url.pathname = '/';
        const redirectRes = NextResponse.redirect(url);
        cloneCookies(supabaseResponse, redirectRes)
        return redirectRes
    }

    if(isAnonymPath && user?.is_anonymous){
        const game_id = pathname.split('/')[3]
        const {data} = await supabase.from('games').select().eq('id', game_id).single()
        const { count } = await supabase.from('games').select('*', { count: 'exact', head: true }).in('status', ['abandoned', 'finished']).eq('user_id', user?.id ?? '')
        if ((count == null || count >= 2) && data?.status !== 'finished') {
            const url = request.nextUrl.clone();
                url.pathname = '/auth/login';
                const redirectRes = NextResponse.redirect(url);
                cloneCookies(supabaseResponse, redirectRes)
                return redirectRes
        }
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