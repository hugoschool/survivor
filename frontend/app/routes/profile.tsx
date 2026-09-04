import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { HeadBar } from "~/components/Headbar";
import type { Route } from "../+types/root";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";

// biome-ignore lint: params not used but is mandatory for func
export async function loader({ params }: Route.LoaderArgs) {
    return { message: "Administration" };
}

const AUTH_KEYS = {
    token: "token",
    legacyToken: "jwt-token",
    user: "user",
};

type SessionUser = {
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    email?: string;
    mail?: string;
    connectedAt?: string;
};

const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    return Boolean(
        window.localStorage.getItem(AUTH_KEYS.token) ||
            window.localStorage.getItem(AUTH_KEYS.legacyToken),
    );
};

const getSessionUser = (): SessionUser | null => {
    if (typeof window === "undefined") return null;

    const rawUser = window.localStorage.getItem(AUTH_KEYS.user);
    if (!rawUser) return null;

    try {
        return JSON.parse(rawUser) as SessionUser;
    } catch {
        return null;
    }
};

const formatDate = (value?: string) => {
    if (!value) return "Information indisponible";

    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(new Date(value));
};

const getDisplayName = (user: SessionUser | null, email?: string) => {
    const firstName = (user?.firstName ?? user?.first_name ?? "").trim();
    const lastName = (user?.lastName ?? user?.last_name ?? "").trim();
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
        return fullName;
    }

    // temporaire -> parse juste l'email
    const emailPart = (email || user?.email || user?.mail || "").split("@")[0];
    if (emailPart) {
        return emailPart
            .split(/[._-]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    }

    return "Utilisateur connecté";
};

export default function Profile() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState<boolean>(isAuthenticated);
    const [user, setUser] = useState<SessionUser | null>(getSessionUser);

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

    const email = user?.email || user?.mail || "Utilisateur connecté";
    const displayName = getDisplayName(user, email);
    const connectedAt = formatDate(user?.connectedAt);
    const likesCount = 0;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(27,58,107,0.08),transparent_42%),linear-gradient(to_bottom,#ffffff,#f7f9fc)]">
            <HeadBar />
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center px-4 py-10 sm:px-1 lg:px-8">
                {loggedIn ? (
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
                ) : (
                    <NavLink to="/login" end onClick={() => setMenuOpen(false)}>
                        <p className="rounded-md bg-white px-5 py-2.5 flex align-middle text-sm font-medium text-institutionnel border-institutionnel border-2 hover:bg-institutionnel/15">
                            Connexion
                        </p>
                    </NavLink>
                )}
            </div>
        </div>
    );
}
