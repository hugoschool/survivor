import { useState } from "react";
import { data } from "react-router";
import { HeadBar } from "../components/Headbar";
import type { Route } from "./+types/home";
export function meta() {
    return [
        { title: "Home" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export async function loader() {
    const pingRawRes = await fetch(`${process.env.BACKEND_URL}/ping`);

    if (!pingRawRes.ok) {
        return data({});
    }

    const pingRes = await pingRawRes.json();
    return pingRes;
}

export default function Home({ loaderData }: Route.ComponentProps) {
    const [ping, _setPing] = useState(JSON.stringify(loaderData));

    return (
        <div>
            <HeadBar />
            <div className="flex mx-auto items-center justify-center font-medium text-gray-500 min-h-screen">
                <p>
                    Welcome to ProfilsActif. Try Searching for new employee...
                </p>
                <h2>{ping}</h2>
            </div>
        </div>
    );
}
