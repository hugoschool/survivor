import { useState } from "react";
import { NavLink } from "react-router";
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

// biome-ignore lint: params not used but is mandatory for func
export async function loader({ params }: Route.LoaderArgs) {
    return { message: "Register" };
}

export default function Register() {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        role: 1,
        age: "",
        mail: "",
        password: "",
    });
    // biome-ignore lint: usefull later
    const [error, setError] = useState(null);
    // biome-ignore lint: usefull later
    const [loading, setLoading] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    // biome-ignore lint: any type for the moment
    const handleConfirmPasswordChange = (e: any) => {
        setConfirmPassword(e.target.value);
    };

    // biome-ignore lint: any type for the moment
    const handleChange = async (e: any) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "age" || name === "role" ? Number(value) : value,
        }));
    };

    // biome-ignore lint: any type for the moment
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError(null);

        if (form.password !== confirmPassword) {
            alert("wrong pwd");
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
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Sign up</CardTitle>
                        <CardDescription className="flex items-center">
                            Fill All the information for registering a new
                            account
                        </CardDescription>
                        <CardAction>
                            <NavLink
                                to="/login"
                                className="hover:underline"
                                end
                            >
                                Log In
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
                                    <label htmlFor="mail" className="mt-4">
                                        role
                                    </label>
                                    <Input
                                        id="role"
                                        name="role"
                                        type="number"
                                        value={form.role}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <label htmlFor="password" className="mt-4">
                                        Password
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
                                        Confirm Password
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
                                <Button type="submit" className="w-full">
                                    Register
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
