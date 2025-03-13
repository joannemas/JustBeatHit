import { type NextRequest, NextResponse  } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Public path regex
export const PUBLIC_PATH = [
    /^\/$/,                    // Allow "/"
    /^\/auth(\/.*)?$/,         // Allow "/auth" and all that follows "/auth/..."
]

export const ANON_PATH = [
    /^\/game\/[^/]+\/[^/]+$/   // Allow "/game/{gameName}/{gameId}"
]

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    console.log('middleware', pathname)

    // 🔒 Protection spécifique pour le cron
    if (pathname.startsWith('/api/cron')) {
        if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.next();
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|fonts/.*\\.(?:woff2?|ttf|otf|eot|svg)$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}