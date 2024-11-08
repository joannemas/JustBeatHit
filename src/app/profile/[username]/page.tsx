import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import React from 'react'

export default async function Page({ params }: { params: { username: string } }) {
    const supabase = createClient()
    const { data: { username, avatar_url }, data, error } = await supabase.from('profiles').select('*').eq('username', params.username).single()

    console.debug(data)

    return (
        <>
            <div className="header">
                <Image src={avatar_url ?? `https://api.dicebear.com/9.x/adventurer/png?seed=${username}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9&size=128`} width={128} height={128} alt='Profile picture' />
                <div className="userdata">
                    <span>{username}</span>
                </div>
            </div>
            <div className="party-history">

            </div>
        </>
    )
}
