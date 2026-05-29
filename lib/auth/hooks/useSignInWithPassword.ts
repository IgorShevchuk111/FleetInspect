"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const useSignInWithPassword = () => {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            setError(null);

            const formData = new FormData(e.currentTarget);

            const email = String(formData.get("email"));
            const password = String(formData.get("password"));

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            router.push("/");
            router.refresh();
        } catch (err: unknown) {
            console.error(err);
            setError("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleSubmit,
        isLoading,
        error,
    };
};