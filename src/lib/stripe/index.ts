"use server"

import { User } from "@supabase/supabase-js";
import { createAdminClient, createClient } from "../supabase/server";
import { stripe } from "./server";
import { redirect } from "next/navigation";

export async function createCustomer(userId: string){
    const supabase = createAdminClient()
    const {data: {user}} = await supabase.auth.getUser()

    if(!user) return;

    const stripeCustomer = await stripe.customers.create({
        email: user?.email
    })
    
    await supabase.from('user_plans').insert({ plan: 'Freemium', stripe_customer_id: stripeCustomer.id, user_id: userId})
    
    return stripeCustomer.id
}

/**
 * Retrieve Stripe customer id of an user,
 * or create one if his not exist
 * @param user L'objet utilisateur authentifié de Supabase.
 * @returns L'ID du client Stripe (ex: 'cus_...').
 */
async function getOrCreateStripeCustomerId(user: User): Promise<string> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('user_plans')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

    if (data?.stripe_customer_id) {
        return data.stripe_customer_id;
    }

    // Handle database error except 'no row(s) return'
    if (error && error.code !== 'PGRST116') {
        throw new Error(`Database error: ${error.message}`);
    }

    // Stripe customer id doesn't exist, we create one
    const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
            user_id: user.id,
        },
    });

    const { error: upsertError } = await supabase
        .from('user_plans')
        .upsert({ stripe_customer_id: customer.id, plan: 'Freemium', user_id: user.id });

    if (upsertError) {
        throw new Error(`Unable to save Stripe customer ID: ${upsertError.message}`);
    }

    return customer.id;
}

/**
 * Create payment session for Stripe subscription
 * @param priceId The Stripe price ID (e.g. ‘price_...’), obtained from Stripe
 * @param success_url Redirection URL in case of success.
 * @param cancel_url Redirection URL in case of cancellation.
 */
export async function createSubscription(priceId: string, success_url: string, cancel_url: string) {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            throw new Error("Authentication required")
        }

        const stripeCustomerId = await getOrCreateStripeCustomerId(user)

        // Create Stripe payment session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url,
            cancel_url,
        })

        if (!session.url) {
            throw new Error("Unable to create the payment session URL");
        }
        
    // Redirect the user to the Stripe payment page 
    redirect(session.url);
}