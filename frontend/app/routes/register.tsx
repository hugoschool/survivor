import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { HeadBar } from "~/components/Headbar";
import { useAuth } from "~/lib/authContext";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";

const MIN_AGE = 16;

const AUTH_KEYS = {
    token: "token",
};

const persistSession = (token: string) => {
    if (typeof window === "undefined") return;

    const safeToken = token || `local-${Date.now()}`;
    window.localStorage.setItem(AUTH_KEYS.token, safeToken);
};

// biome-ignore lint: params not used but is mandatory for func
export async function loader({ params }: Route.LoaderArgs) {
    return { message: "Register" };
}

export default function Register() {
    const navigate = useNavigate();
    const { user, refetch } = useAuth();

    const roleOptions = [
        { value: 0, label: "Chercheur d'emploi" },
        { value: 1, label: "Recruteur" },
    ];

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        role: 0,
        age: "",
        mail: "",
        password: "",
    });

    // biome-ignore lint: usefull later
    const [error, setError] = useState(null);
    // biome-ignore lint: usefull later
    const [loading, setLoading] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (user) {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    // biome-ignore lint: any type for the moment
    const handleConfirmPasswordChange = (e: any) => {
        setConfirmPassword(e.target.value);
    };

    // biome-ignore lint: any type for the moment
    const handleChange = async (e: any) => {
        const { name, value } = e.target;

        if (name === "age") {
            setForm((prev) => ({
                ...prev,
                age: value === "" ? "" : value,
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: name === "role" ? Number(value) : value,
        }));
    };

    // biome-ignore lint: any type for the moment
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError(null);

        if (form.password !== confirmPassword) {
            alert("Mot de passe incorrect");
            return;
        }

        if (Number(form.age) < MIN_AGE) {
            alert(`Tu dois avoir au moins ${MIN_AGE} ans pour t'inscrire.`);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:8080/account/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || "Inscription error");
            }

            const loginForm = {
                mail: form.mail,
                password: form.password,
            };
            const resLog = await fetch("http://localhost:8080/account/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm),
            });
            const loginData = await resLog.json().catch(() => ({}));

            if (!resLog.ok) {
                throw new Error(loginData?.error || "Connection error");
            }

            const token = loginData?.token || `local-${Date.now()}`;
            persistSession(token);

            await refetch();

            navigate("/", { replace: true });
            // biome-ignore lint: any type for the moment
        } catch (err: any) {
            alert("failed");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <HeadBar />
            <div className="flex min-h-screen items-center justify-center p-4 font-marianne">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Inscription</CardTitle>
                        <CardDescription className="flex items-center font-spectral">
                            Remplissez les informations pour créer un compte
                        </CardDescription>
                        <CardAction>
                            <NavLink
                                to="/login"
                                className="hover:underline"
                                end
                            >
                                Connexion
                            </NavLink>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2 ">
                                    <label
                                        htmlFor="first_name"
                                        className="mt-4"
                                    >
                                        Prénom
                                    </label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        value={form.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <label htmlFor="last_name" className="mt-4">
                                        Nom
                                    </label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        type="text"
                                        value={form.last_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <label htmlFor="age" className="mt-4">
                                        Age
                                    </label>
                                    <Input
                                        id="age"
                                        name="age"
                                        type="number"
                                        value={form.age}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <label htmlFor="mail" className="mt-4">
                                        Email
                                    </label>
                                    <Input
                                        id="mail"
                                        name="mail"
                                        type="text"
                                        value={form.mail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <div className="mt-4">Rôle</div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-between"
                                            >
                                                {roleOptions.find(
                                                    (option) =>
                                                        option.value ===
                                                        form.role,
                                                )?.label ??
                                                    "Chercheur d'emploi"}
                                                <span aria-hidden="true">
                                                    ▾
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-(--anchor-width)">
                                            {roleOptions.map((option) => (
                                                <DropdownMenuItem
                                                    key={option.value}
                                                    onClick={() =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            role: option.value,
                                                        }))
                                                    }
                                                >
                                                    {option.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <label htmlFor="password" className="mt-4">
                                        Mot de passe
                                    </label>
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
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="mt-4"
                                    >
                                        Confirmez le mot de passe
                                    </label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        required
                                    />
                                </div>
                            </div>
                            <CardFooter className="flex-col gap-2 mt-5">
                                <Button
                                    type="submit"
                                    className="w-full bg-white text-institutionnel border-2 border-institutionnel hover:bg-institutionnel/15"
                                >
                                    S'inscrire
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
