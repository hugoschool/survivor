import { HeadBar } from "../components/Headbar";

export function meta() {
    return [
        { title: "Home" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    return (
        <div>
            <HeadBar />
            <div className="flex mx-auto items-center justify-center font-medium text-institutionnel min-h-screen">
                <p>Bienvenue sur JibJob !</p>
            </div>
        </div>
    );
}
