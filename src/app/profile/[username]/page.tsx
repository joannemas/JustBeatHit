import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import React from "react";
import ProfileEditForm from "../profilEditForm";
import '@/stylesheets/profil.scss';

export default async function Page({ params: { username } }: { params: { username: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser()
    console.log(user, "user")
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", username).single();

    if (error || !profile) {
        console.error("Error fetching profile:", error?.message || "Profile not found");
        return <div className="profile-container"><p>Profil introuvable.</p></div>;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const isOwner = session?.user?.id === profile.id;

    return (
        <div className="profile-container">
            <div className="header">
                <a href="/">
                    <button className="back-button">&#10094;</button>
                </a>
                <h1>Profil de {profile.username}</h1>
            </div>

            <div className="profile-card">
                <Image
                    src={profile.avatar_url ?? `https://api.dicebear.com/9.x/adventurer/png?seed=${profile.username}`}
                    width={128}
                    height={128}
                    alt="Profile picture"
                    className="avatar"
                />
                <h2>{profile.username}</h2>
                <p>Membre depuis {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>

            {isOwner && <div className="edit-profile"><ProfileEditForm profile={profile} /></div>}
        </div>
    );
}
