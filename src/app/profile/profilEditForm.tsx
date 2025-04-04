"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import '@/stylesheets/profil-form.scss';

interface ProfileData {
    avatar_url?: string;
    username?: string;
    email?: string;
}

export default function ProfileEditForm({ profile }: { profile: ProfileData }) {
    const router = useRouter();
    const [formData, setFormData] = useState<ProfileData>(profile);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: "", type: "" });

        try {
            let avatarUrl = profile.avatar_url;

            if (avatarFile) {
                const fileExt = avatarFile.name.split(".").pop();
                const filePath = `${formData.username}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(filePath, avatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = await supabase.storage
                    .from("avatars")
                    .getPublicUrl(filePath);

                avatarUrl = urlData.publicUrl;
            }

            const { error } = await supabase
                .from("profiles")
                .update({
                    avatar_url: avatarUrl,
                    username: formData.username,
                    updated_at: new Date().toISOString(),
                })
                .eq("username", profile.username);

            if (error) throw error;
            
            setMessage({ text: "Profil mis à jour avec succès!", type: "success" });
            router.refresh();
            // router.push(`/profile/${formData.username}`);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            setMessage({ text: "Erreur lors de la mise à jour du profil", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="profile-form-container">
            <h2>Modifier votre profil</h2>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSubmit}>
                <div className="avatar-section">
                    <Image
                        src={avatarPreview || `https://api.dicebear.com/9.x/adventurer/png?seed=${profile.username}&radius=50`}
                        alt="Avatar"
                        width={128}
                        height={128}
                        className="avatar"
                    />
                    <label className="upload-label">
                        Changer l'avatar
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                </div>

                <div className="user-info">
                    <label>
                        Nom d'utilisateur
                        <input
                            type="text"
                            name="username"
                            value={formData.username || ""}
                            onChange={handleInputChange}
                            className="username-input"
                        />
                    </label>
                </div>

                <div className="buttons">
                    <button type="button" onClick={() => router.back()} className="cancel">
                        Annuler
                    </button>
                    <button type="submit" disabled={isLoading} className="save">
                        {isLoading ? "Mise à jour..." : "Enregistrer"}
                    </button>
                </div>
            </form>
        </div>
    );
}