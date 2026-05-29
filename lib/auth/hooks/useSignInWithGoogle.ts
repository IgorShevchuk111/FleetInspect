"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const useSignInWithGoogle = () => {
    const supabase = createClient();

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const signInWithGoogle = async () => {
        try {
            setError(null);
            setIsLoading(true);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
                    queryParams: {
                        prompt: "select_account",
                    },
                },
            });

            if (error) {
                setError(error.message);
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        signInWithGoogle,
        error,
        isLoading,
    };
};