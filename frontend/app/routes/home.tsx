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
            <div className="flex mx-auto items-center justify-center font-medium text-gray-500 min-h-screen">
                <a>
                    Welcome to ProfilsActif. Try Searching for new employee...
                </a>
            </div>
        </div>
    );
}
