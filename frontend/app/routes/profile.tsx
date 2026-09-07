import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { HeadBar } from "~/components/Headbar";
import { clearSession } from "~/lib/auth";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { useAuth } from "~/lib/authContext";

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

export default function Profile() {
    const { user, refetch } = useAuth();
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState<boolean>(isAuthenticated);

    useEffect(() => {
        if (!loggedIn) {
            navigate("/login", { replace: true });
        }
    }, [loggedIn, navigate]);

    useEffect(() => {
        const syncAuth = () => setLoggedIn(isAuthenticated());

        syncAuth();
        window.addEventListener("storage", syncAuth);

        return () => {
            window.removeEventListener("storage", syncAuth);
        };
    }, []);

    useEffect(() => {
        if (!loggedIn) return;

        void refetch();
        const intervalId = window.setInterval(() => {
            void refetch();
        }, 15000);

        const handleFocus = () => {
            void refetch();
        };
        window.addEventListener("focus", handleFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleFocus);
        };
    }, [loggedIn, refetch]);

    if (!loggedIn) {
        return null;
    }

    const survey_score = user?.survey_score ?? 0;
    const displayName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "Utilisateur connecté";
    const likesCount = 0;
    const handleDeleteAccountClick = () => {
        clearSession();
        setLoggedIn(false);
        navigate("/login", { replace: true });
    };

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
                                Utilisateur
                            </p>
                            <p className="mt-2 truncate text-2xl font-medium text-institutionnel">
                                {displayName}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-white p-5">
                            <p className="text-base font-medium text-ink/60">
                                Score au questionnaire
                            </p>
                            <p className="mt-2 truncate text-2xl font-medium text-institutionnel">
                                {survey_score}
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
                        <div className="rounded-2xl border border-border/70 bg-white p-5">
                            <p className="text-base font-medium text-ink/60">
                                Ma video
                            </p>
                            <p className="mt-2 text-2xl font-medium text-institutionnel">

                            <button
                                type="button"
                                onClick={() => navigate("/upload")}
                                className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-institutionnel border-institutionnel border-2 hover:bg-institutionnel/15"
                            >
                                Mettre a jour ma vidéo
                            </button>

                            </p>
                        </div>
                        <div className="flex flex-wrap items-end gap-3 sm:col-span-2">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-11 border-red-900 bg-white px-4 font-[Marianne] font-bold text-red-900 hover:border-red-900 hover:border-b-4 hover:text-red-900"
                                onClick={handleDeleteAccountClick}
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
