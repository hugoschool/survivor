import { Award, TrendingUp, UserCheck, Users } from "lucide-react";

const STATS = [
    {
        label: "Candidats inscrits",
        value: "—",
        hint: "comptes créés sur la plateforme",
        icon: Users,
    },
    {
        label: "Certifiés",
        value: "—",
        hint: "ont atteint le seuil d'obtention",
        icon: Award,
    },
    {
        label: "Taux de certification",
        value: "—",
        hint: "certifiés / questionnaires soumis",
        icon: TrendingUp,
    },
    {
        label: "Score moyen",
        value: "—",
        hint: "sur l'ensemble des soumissions",
        icon: UserCheck,
    },
] as const;

export default function AdminOverview() {
    return (
        <>
            <header className="flex flex-col gap-1 border-border border-b pb-5">
                <h1 className="font-heading text-xl font-medium">
                    Vue d'ensemble
                </h1>
                <p className="text-sm text-muted-foreground">
                    Activité de la plateforme et résultats de certification.
                </p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2">
                {STATS.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex flex-col gap-1 rounded-xl border border-border p-4"
                    >
                        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            <stat.icon className="size-3.5" />
                            {stat.label}
                        </p>
                        <p className="font-heading text-2xl tabular-nums">
                            {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {stat.hint}
                        </p>
                    </div>
                ))}
            </section>

            <section className="rounded-xl border border-border p-5">
                <h2 className="font-heading text-base font-medium">
                    Répartition des scores
                </h2>
                <p className="pt-1 text-sm text-muted-foreground">
                    Le graphique s'affichera lorsque les données seront
                    branchées.
                </p>
            </section>
        </>
    );
}
