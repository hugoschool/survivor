import { useCallback, useEffect, useState } from "react";
import {
    fetchCurrentUser,
    getToken,
    readSavedUser,
    type User,
} from "~/lib/auth";

export function useUser() {
    const [user, setUser] = useState<User | null>(() => readSavedUser());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const token = getToken();

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const freshUser = await fetchCurrentUser(token);
            setUser(freshUser);
            setError(null);
        } catch (err) {
            setUser(null);
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        window.addEventListener("auth-change", load);
        return () => window.removeEventListener("auth-change", load);
    }, [load]);

    return { user, loading, error, refetch: load };
}
