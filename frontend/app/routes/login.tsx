import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { Footer } from "~/components/Footer";
import { HeadBar } from "~/components/Headbar";
import { API_URL } from "~/lib/auth";
import { useAuth } from "~/lib/authContext";
import { Button } from "../components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const LOGIN_ERRORS: Record<string, string> = {
    "Incorrect body": "Adresse e-mail ou mot de passe incorrect.",
};

const AUTH_KEYS = {
    token: "token",
};

export function meta() {
    return [{ title: "Connexion" }];
}

const persistSession = (token: string) => {
    if (typeof window === "undefined") return;

    const safeToken = token || `local-${Date.now()}`;
    window.localStorage.setItem(AUTH_KEYS.token, safeToken);
};

export default function Login() {
    const navigate = useNavigate();
    const { user, refetch } = useAuth();
    const [form, setForm] = useState({
        mail: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/account/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    LOGIN_ERRORS[data?.message] ??
                        data?.message ??
                        "Connexion impossible, réessayez plus tard.",
                );
            }

            const token = data?.token || `local-${Date.now()}`;
            persistSession(token);

            await refetch();

            navigate("/", { replace: true });
            // biome-ignore lint: any type for the moment
        } catch (err: any) {
            setError(
                err.message || "Connexion impossible, réessayez plus tard.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <HeadBar />
            <div className="flex min-h-screen items-center justify-center p-4 font-main">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-institutionnel">
                            Connexion
                        </CardTitle>
                        <CardDescription className="flex items-center font-secondary">
                            Entre ton email pour te connecter a ton compte
                        </CardDescription>
                        <CardAction className="text-institutionnel">
                            <NavLink to="/register" className="hover:underline">
                                Inscription
                            </NavLink>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label
                                        className="text-institutionnel"
                                        htmlFor="mail"
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        id="mail"
                                        type="email"
                                        name="mail"
                                        value={form.mail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label
                                            htmlFor="password"
                                            className="text-institutionnel"
                                        >
                                            Mot de passe
                                        </Label>
                                        {/* <button
                                            type="button"
                                            onClick={Alert}
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        >
                                            Mot de passe oublié ?
                                        </button> */}
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            {error && (
                                <p className="mt-4 text-sm text-red-600">
                                    {error}
                                </p>
                            )}
                            <CardFooter className="mt-5 flex-col gap-2">
                                <Button
                                    type="submit"
                                    className="w-full bg-white text-institutionnel border-2 border-institutionnel hover:bg-institutionnel/15"
                                    disabled={loading}
                                >
                                    {loading ? "Connexion..." : "Connexion"}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
}
