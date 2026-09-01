import { HeadBar } from "~/components/Headbar";
import type { Route } from "../+types/root";

// biome-ignore lint: params not used but is mandatory for func
export async function loader({ params }: Route.LoaderArgs) {
    return { message: "login" };
}

export default function Login() {
    return (
        <div>
            <HeadBar />
            <div className="flex mx-auto items-center justify-center min-h-screen text-gray-500 font-medium">
                <p>Login pages under construction...</p>
            </div>
        </div>
    );
}
