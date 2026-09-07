import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { HeadBar } from "~/components/Headbar";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";

export function meta() {
    return [{ title: "Profile" }];
}

const AUTH_KEYS = {
    token: "token",
    user: "user",
};

type SessionUser = {
    firstName: string;
    lastName: string;
    email: string;
};

const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(AUTH_KEYS.token));
};

const getSessionUser = (): SessionUser | null => {
    if (typeof window === "undefined") return null;

    const rawUser = window.localStorage.getItem(AUTH_KEYS.user);
    if (!rawUser) return null;

    try {
        const parsed = JSON.parse(rawUser);
        return {
            firstName: (parsed.firstName ?? parsed.first_name ?? "").trim(),
            lastName: (parsed.lastName ?? parsed.last_name ?? "").trim(),
            email: (parsed.email ?? parsed.mail ?? "").trim(),
        };
    } catch {
        return null;
    }
};

const getDisplayName = (user: SessionUser | null) => {
    if (!user) return "Utilisateur connecté";

    const fullName = `${user.firstName} ${user.lastName}`.trim();
    if (fullName) return fullName;

    // peute etre a enlever -> quand le nom est vide on parse l'email
    const emailPart = user.email.split("@")[0];
    return emailPart
        .split(/[._-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

export default function Profile() {
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState<boolean>(isAuthenticated);
    const [user, setUser] = useState<SessionUser | null>(getSessionUser);

    useEffect(() => {
        if (!loggedIn) {
            navigate("/login", { replace: true });
        }
    }, [loggedIn, navigate]);

    useEffect(() => {
        const syncAuth = () => setLoggedIn(isAuthenticated());
        const syncUser = () => setUser(getSessionUser());

        syncAuth();
        syncUser();
        window.addEventListener("storage", syncAuth);
        window.addEventListener("storage", syncUser);

        return () => {
            window.removeEventListener("storage", syncAuth);
            window.removeEventListener("storage", syncUser);
        };
    }, []);

    if (!loggedIn) {
        return null;
    }

    const email = user?.email || "Utilisateur connecté";
    const displayName = getDisplayName(user);
    const likesCount = 0;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(27,58,107,0.08),transparent_42%),linear-gradient(to_bottom,#ffffff,#f7f9fc)]">
            <HeadBar />
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center px-4 py-10 sm:px-1 lg:px-8">
                <Card className="w-full overflow-hidden border-border/70 bg-white/90 shadow-lg backdrop-blur">
                    <CardHeader className="border-b border-border/60 bg-white/90">
                        <CardTitle className="text-4xl text-institutionnel sm:text-5xl">
                            Mon profil
                        </CardTitle>
                        <CardDescription className="mt-2 text-lg text-ink/70 sm:text-xl">
                            Vous retrouverez ci dessous les informations
                            relatives a votre profil.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/70 bg-white p-5">
                            <p className="text-base font-medium text-ink/60">
                                Nom prénom
                            </p>
                            <p className="mt-2 truncate text-2xl font-medium text-institutionnel">
                                {displayName}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-white p-5">
                            <p className="text-base font-medium text-ink/60">
                                Adresse email
                            </p>
                            <p className="mt-2 truncate text-2xl font-medium text-institutionnel">
                                {email}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-white p-5">
                            <p className="text-base font-medium text-ink/60">
                                Likes
                            </p>
                            <p className="mt-2 text-2xl font-medium text-institutionnel">
                                {likesCount}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-end gap-3 sm:col-span-2">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-11 border-red-900 bg-white px-4 font-[Marianne] font-bold text-red-900 hover:border-red-900 hover:border-b-4 hover:text-red-900"
                            >
                                Supprimer mon compte
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
