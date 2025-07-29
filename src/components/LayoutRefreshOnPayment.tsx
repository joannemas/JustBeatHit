"use client"

import { supabase } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function LayoutRefreshOnPayment() {
    const searchParams = useSearchParams()
    const payment = searchParams.get('payment')

    useEffect(()=>{
        if(payment === "success"){
            supabase.auth.refreshSession()
        }
    }, [payment])

    return null
}
