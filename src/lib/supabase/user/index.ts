import { Database } from "~/database.types";
import { createAdminClient } from "../server"

export async function findUserIdFromStripeCustomerId(stripeCustomerId: unknown){
    if(typeof stripeCustomerId !== 'string') return null;

    const supabase = createAdminClient()
    const {data: planData, error} = await supabase.from('user_plans').select('*').eq('stripe_customer_id', stripeCustomerId).single()

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Database error: ${error.message}`);
    }

    return planData?.user_id ?? null
}

export async function updateUserPlan(userId: string, plan: Database['public']['Enums']['app_plan'] = 'Premium'){
    const supabase = createAdminClient()
    const {error} = await supabase.from('user_plans').upsert({plan: plan, user_id: userId}).eq('user_id', userId)

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }
}