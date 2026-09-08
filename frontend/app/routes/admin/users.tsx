import { Search, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Pager } from "~/components/application/pager";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    fetchUsers,
    ROLE,
    USERS_PAGE_SIZE,
    type User,
    VIDEO_STATUS,
} from "~/lib/auth";

const ROLE_LABELS: Record<number, string> = {
    [ROLE.jobSeeker]: "Candidat",
    [ROLE.recruiter]: "Recruteur",
    [ROLE.admin]: "Admin",
};

function fullName(user: User) {
    return `${user.first_name} ${user.last_name}`.trim();
}

function scoreLabel(user: User) {
    return user.survey_score === null
        ? "Questionnaire non passé"
        : `${user.survey_score} %`;
}

function videosLabel(user: User) {
    const videos = user.videos ?? [];

    if (videos.length === 0) {
        return "Aucune vidéo";
    }

    const pending = videos.filter(
        (video) => video.status === VIDEO_STATUS.awaitingModeration,
    ).length;

    const total = `${videos.length} vidéo${videos.length > 1 ? "s" : ""}`;

    return pending > 0 ? `${total} · ${pending} à modérer` : total;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError(null);

        fetchUsers(page)
            .then((data) => {
                if (!cancelled) setUsers(data);
            })
            .catch(() => {
                if (!cancelled) {
                    setUsers([]);
                    setError(
                        "Impossible de joindre le backend. Vérifiez qu'il tourne sur le port 8080.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [page]);

    const filtered = users.filter((user) =>
        fullName(user).toLowerCase().includes(query.trim().toLowerCase()),
    );

    const hasNext = users.length === USERS_PAGE_SIZE;

    return (
        <>
            <header className="flex flex-col gap-1 border-border border-b pb-5">
                <h1 className="font-heading text-xl font-medium">Candidats</h1>
                <p className="text-sm text-muted-foreground">
                    Rechercher un candidat et consulter son résultat de
                    certification.
                </p>
            </header>

            <section className="flex flex-col gap-2">
                <Label htmlFor="user-search">Rechercher</Label>
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-10 ps-8"
                        id="user-search"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Nom ou prénom"
                        type="search"
                        value={query}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    La recherche porte sur la page affichée : le backend
                    n'expose pas encore de recherche globale.
                </p>
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-heading text-base font-medium">
                        Résultats
                    </h2>
                    <p className="text-xs text-muted-foreground tabular-nums">
                        {loading
                            ? "Chargement…"
                            : `${filtered.length} sur ${users.length} affiché${filtered.length > 1 ? "s" : ""}`}
                    </p>
                </div>

                {error ? (
                    <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                        <TriangleAlert className="size-4 shrink-0" />
                        {error}
                    </div>
                ) : loading ? (
                    <div className="rounded-xl border border-border">
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            Chargement des candidats…
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-xl border border-border">
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            {query
                                ? "Aucun candidat ne correspond à cette recherche sur cette page."
                                : "Aucun candidat sur cette page."}
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {filtered.map((user) => (
                            <li
                                key={user.model.ID}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
                            >
                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <p className="truncate text-sm font-medium">
                                        {fullName(user) || "Sans nom"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {ROLE_LABELS[user.role] ?? "Inconnu"} ·{" "}
                                        {user.age} ans · {videosLabel(user)}
                                    </p>
                                </div>
                                <p className="text-sm tabular-nums text-muted-foreground">
                                    {scoreLabel(user)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                <Pager
                    disabled={loading || Boolean(error)}
                    hasNext={hasNext}
                    onPageChange={setPage}
                    page={page}
                />
            </section>
        </>
    );
}
