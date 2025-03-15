import { createClient } from "@/lib/supabase/server"
import RegisterPage from "./RegisterPage"
import RegisterAnonymePage from "./RegisterAnonymePage"

export default async function Page() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.is_anonymous) {
        return <RegisterAnonymePage />
    }
    return <RegisterPage />
}
