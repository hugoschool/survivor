import { Award, CircleAlert, TrendingUp, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAllUsers, fetchSurvey, ROLE, type User } from "~/lib/auth";

const SCORE_BUCKETS = [
    { label: "0 – 19 %", min: 0, max: 19 },
    { label: "20 – 39 %", min: 20, max: 39 },
    { label: "40 – 59 %", min: 40, max: 59 },
    { label: "60 – 79 %", min: 60, max: 79 },
    { label: "80 – 100 %", min: 80, max: 100 },
] as const;

const EMPTY = "—";

function formatCount(value: number) {
    return value.toLocaleString("fr-FR");
}

export default function AdminOverview() {
    const [users, setUsers] = useState<User[]>([]);
    const [obtentionRate, setObtentionRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        Promise.all([fetchAllUsers(), fetchSurvey().catch(() => null)])
            .then(([allUsers, survey]) => {
                if (cancelled) {
                    return;
                }

                setUsers(allUsers);
                setObtentionRate(survey?.obtention_rate ?? null);
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Impossible de charger les données.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const candidates = users.filter((user) => user.role === ROLE.jobSeeker);
    const scores = candidates
        .map((user) => user.survey_score)
        .filter((score): score is number => score !== null);
    const certified =
        obtentionRate === null
            ? null
            : scores.filter((score) => score >= obtentionRate).length;
    const averageScore =
        scores.length === 0
            ? null
            : Math.round(
                  scores.reduce((total, score) => total + score, 0) /
                      scores.length,
              );
    const certificationRate =
        certified === null || scores.length === 0
            ? null
            : Math.round((100 * certified) / scores.length);

    const stats = [
        {
            label: "Candidats inscrits",
            value: formatCount(candidates.length),
            hint: "comptes créés sur la plateforme",
            icon: Users,
        },
        {
            label: "Certifiés",
            value: certified === null ? EMPTY : formatCount(certified),
            hint:
                obtentionRate === null
                    ? "aucun questionnaire publié"
                    : `ont atteint le seuil de ${obtentionRate} %`,
            icon: Award,
        },
        {
            label: "Taux de certification",
            value:
                certificationRate === null ? EMPTY : `${certificationRate} %`,
            hint: "certifiés / questionnaires soumis",
            icon: TrendingUp,
        },
        {
            label: "Score moyen",
            value: averageScore === null ? EMPTY : `${averageScore} %`,
            hint: `sur ${formatCount(scores.length)} soumission${scores.length > 1 ? "s" : ""}`,
            icon: UserCheck,
        },
    ];

    const distribution = SCORE_BUCKETS.map((bucket) => ({
        ...bucket,
        count: scores.filter(
            (score) => score >= bucket.min && score <= bucket.max,
        ).length,
    }));
    const highestCount = Math.max(...distribution.map((row) => row.count), 1);

    return (
        <>
            <header className="flex flex-col gap-1 border-border border-b pb-5">
                <h1 className="font-heading text-xl font-medium">
                    Vue d'ensemble
                </h1>
            </header>

            {error !== null && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                    <CircleAlert className="size-4 shrink-0" />
                    {error}
                </div>
            )}

            <section className="grid gap-4 sm:grid-cols-2">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex flex-col gap-1 rounded-xl border border-border p-4"
                    >
                        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            <stat.icon className="size-3.5" />
                            {stat.label}
                        </p>
                        <p className="font-heading text-2xl tabular-nums">
                            {loading ? EMPTY : stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {stat.hint}
                        </p>
                    </div>
                ))}
            </section>

            <section className="flex flex-col gap-4 rounded-xl border border-border p-5">
                <div className="flex flex-col gap-1">
                    <h2 className="font-heading text-base font-medium">
                        Répartition des scores
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Nombre de candidats par tranche de score obtenu au
                        questionnaire.
                    </p>
                </div>

                {loading ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Chargement des données…
                    </p>
                ) : scores.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Aucun questionnaire soumis pour l'instant.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-2.5">
                        {distribution.map((row) => (
                            <li
                                key={row.label}
                                className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-3"
                                title={`${row.label} : ${row.count} candidat${row.count > 1 ? "s" : ""}`}
                            >
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {row.label}
                                </span>
                                <span className="h-2.5 w-full rounded-[4px] bg-muted">
                                    <span
                                        className="block h-full rounded-[4px] bg-primary dark:bg-[oklch(0.75_0.09_255)]"
                                        style={{
                                            width: `${(100 * row.count) / highestCount}%`,
                                        }}
                                    />
                                </span>
                                <span className="text-right text-xs tabular-nums">
                                    {formatCount(row.count)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
