import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client';
import { jwtDecode } from 'jwt-decode';
import { CustomClaims } from '../supabase/types';

export default function useClaims() {
    const [userClaims, setUserClaims] = useState<{role: null | string, plan: null | string}>({role: null, plan: null});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if(session) {
                const jwt = jwtDecode(session.access_token) as CustomClaims
                setUserClaims({ role: jwt.user_role, plan: jwt.user_plan });
            } else {
                setUserClaims({ role: null, plan: null });
            }
            setIsLoading(false);
        })
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

  return {userClaims, isLoading}
}
