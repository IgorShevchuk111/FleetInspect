"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export const useSignOut = () => {
    const supabase = createClient();
    const router = useRouter();

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (!error) {
            router.push("/login");
            router.refresh();
        }
    };

    return signOut;
};