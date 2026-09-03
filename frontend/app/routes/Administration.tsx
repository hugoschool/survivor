import { HeadBar } from "~/components/Headbar";
import type { Route } from "../+types/root";

// biome-ignore lint: params not used but is mandatory for func
export async function loader({ params }: Route.LoaderArgs) {
    return { message: "Administration" };
}

export default function Administration() {
    return (
        <div>
            <HeadBar />
            <div className="flex mx-auto items-center justify-center font-medium text-institutionnel min-h-screen">
                <p>Administration Pages under construction...</p>
            </div>
        </div>
    );
}
