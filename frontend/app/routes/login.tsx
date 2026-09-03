import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { HeadBar } from "~/components/Headbar";
import type { Route } from "../+types/root";
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

const AUTH_KEYS = {
    token: "token",
    legacyToken: "jwt-token",
    user: "user",
    fist_name: "first_name",
};

const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    return Boolean(
        window.localStorage.getItem(AUTH_KEYS.token) ||
            window.localStorage.getItem(AUTH_KEYS.legacyToken),
    );
};

const persistSession = (token: string, email: string) => {
    if (typeof window === "undefined") return;

    const safeToken = token || `local-${Date.now()}`;
    window.localStorage.setItem(AUTH_KEYS.token, safeToken);
    window.localStorage.setItem(AUTH_KEYS.legacyToken, safeToken);
    window.localStorage.setItem(
        AUTH_KEYS.user,
        JSON.stringify({ email, connectedAt: new Date().toISOString() }),
    );
};

// biome-ignore lint: params not used but is mandatory for func
export async function loader({ params }: Route.LoaderArgs) {
    return { message: "login" };
}

function Alert() {
    return alert("This Functionnality is currently not supported");
}

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        mail: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

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
            const res = await fetch("http://localhost:8080/account/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.error || "Connection error");
            }

            const token = data?.token || `local-${Date.now()}`;
            persistSession(token, form.mail.trim());
            navigate("/", { replace: true });
            // biome-ignore lint: any type for the moment
        } catch (err: any) {
            setError(err.message || "Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <HeadBar />
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Connection</CardTitle>
                        <CardDescription className="flex items-center">
                            Entre ton email pour te connecter a ton compte
                        </CardDescription>
                        <CardAction>
                            <NavLink to="/register" className="hover:underline">
                                Inscription
                            </NavLink>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="mail">Email</Label>
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
                                        <Label htmlFor="password">
                                            Mot de passe
                                        </Label>
                                        <button
                                            type="button"
                                            onClick={Alert}
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        >
                                            Mot de passe oublié ?
                                        </button>
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
        </div>
    );
}
