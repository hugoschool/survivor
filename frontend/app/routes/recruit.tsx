import { HeadBar } from "~/components/Headbar";
import type { Route } from "../+types/root";

// biome-ignore lint: params not used but is mandatory for func
export async function loader({ params }: Route.LoaderArgs) {
    return { message: "recruit" };
}

export default function Recruit() {
    return (
        <div>
            <HeadBar />
            <div className="flex mx-auto items-center justify-center min-h-screen text-gray-500 font-medium">
                <p>Recruit Pages under construction...</p>
            </div>
        </div>
    );
}
