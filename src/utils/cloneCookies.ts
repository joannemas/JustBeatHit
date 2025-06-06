import { NextResponse } from 'next/server';

export default function cloneCookies(from: NextResponse, to: NextResponse) {
    for (const cookie of from.cookies.getAll()) {
      to.cookies.set(cookie)
    }
}