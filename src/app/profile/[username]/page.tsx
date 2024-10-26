import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import React from 'react'

export default async function Page({ params }: { params: { username: string } }) {
    const supabase = createClient()
    const { data: { username }, error } = await supabase.from('profiles').select('*').eq('username', params.username).single()

    return (
        <>
            <div className="header">
                <Image src={''} width={512} height={512} alt='Profile picture' />
                <div className="userdata">
                    <span>{username}</span>
                </div>
            </div>
            <div className="party-history">

            </div>
        </>
    )
}
