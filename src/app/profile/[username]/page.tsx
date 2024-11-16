import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import React from 'react'

export default async function Page({ params: { username } }: { params: { username: string } }) {
    const supabase = createClient()
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('username', username).single()

    if (error || !profile) {
        console.error("Error fetching profile:", error?.message || "Profile not found");
        return (
            <div>
                <p>Profile not found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="header">
                <Image src={profile.avatar_url ?? `https://api.dicebear.com/9.x/adventurer/png?seed=${profile.username}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9&size=128`} width={128} height={128} alt='Profile picture' />
                <div className="userdata">
                    <span>{profile.username}</span>
                </div>
            </div>
            <div className="party-history">

            </div>
        </>
    )
}
