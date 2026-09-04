import { createContext, useContext } from "react";
import { useUser } from "./useUser";

const AuthContext = createContext<ReturnType<typeof useUser> | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useUser();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
    return ctx;
}
