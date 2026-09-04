import {
    ClipboardList,
    LayoutDashboard,
    ShieldCheck,
    Users,
} from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { HeadBar } from "~/components/Headbar";

const NAV_ITEMS = [
    {
        to: "/administration",
        label: "Vue d'ensemble",
        icon: LayoutDashboard,
        end: true,
    },
    {
        to: "/administration/questionnaire",
        label: "Questionnaire",
        icon: ClipboardList,
        end: false,
    },
    {
        to: "/administration/users",
        label: "Candidats",
        icon: Users,
        end: false,
    },
] as const;

export default function Administration() {
    return (
        <div>
            <HeadBar />
            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
                <aside className="shrink-0 md:w-56">
                    <p className="flex items-center gap-1.5 px-3 pb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        <ShieldCheck className="size-3.5" />
                        Administration
                    </p>
                    <nav className="flex gap-1 overflow-x-auto md:flex-col">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    isActive
                                        ? "flex shrink-0 items-center gap-2.5 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground"
                                        : "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                                }
                            >
                                <item.icon className="size-4 shrink-0" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <main className="flex min-w-0 flex-1 flex-col gap-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
