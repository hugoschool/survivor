import {
    ArrowLeft,
    BadgeCheck,
    BriefcaseBusiness,
    Heart,
    MapPin,
    Sparkles,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Footer } from "~/components/Footer";
import { HeadBar } from "~/components/Headbar";
import { API_URL } from "~/lib/auth";
import type { User } from "./recruit";

export default function RecruitProfile() {
    const { id } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState(false);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (!id) {
                setError(true);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/${id}`);
                if (!response.ok) {
                    setError(true);
                    return;
                }

                setUser((await response.json()) as User);
            } catch {
                setError(true);
            }
        };

        void loadUser();
    }, [id]);

    if (error) {
        return (
            <PageShell>
                <StatusMessage>
                    Ce profil n&apos;existe pas ou n&apos;est plus disponible.
                </StatusMessage>
            </PageShell>
        );
    }

    if (!user) {
        return (
            <PageShell>
                <StatusMessage>Chargement du profil…</StatusMessage>
            </PageShell>
        );
    }

    const fullName =
        `${user.first_name} ${user.last_name}`.trim() || "Profil anonyme";
    const locations = user.locations?.map(({ content }) => content) ?? [];
    const sectors = user.sectors?.map(({ content }) => content) ?? [];
    const skills = user.skills?.map(({ content }) => content) ?? [];
    const video =
        user.videos?.find(({ status }) => status === 1) ?? user.videos?.[0];
    const videoUrl = video
        ? `${API_URL}/videos/storage/${video.video_id}.mp4`
        : null;

    return (
        <PageShell>
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <Link
                    to="/recruit"
                    className="inline-flex items-center gap-2 text-sm font-bold text-institutionnel transition-opacity hover:opacity-70"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux profils
                </Link>

                <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
                    <section className="overflow-hidden rounded-2xl border border-institutionnel/10 bg-white shadow-[0_12px_36px_rgb(23,32,51,0.08)]">
                        <div className="h-1 bg-gradient-to-r from-institutionnel" />
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="font-main text-xs font-bold tracking-[0.16em] text-institutionnel uppercase">
                                        Profil candidat
                                    </p>
                                    <h1 className="mt-2 font-main text-3xl font-bold tracking-tight text-institutionnel sm:text-4xl">
                                        {fullName}
                                    </h1>
                                    <p className="mt-2 text-base text-[#526078]">
                                        {user.age
                                            ? `${user.age} ans`
                                            : "Âge non renseigné"}
                                    </p>
                                </div>
                                {user.survey_score !== null && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f3ed] px-3 py-1.5 text-sm font-bold text-[#17623a]">
                                        <BadgeCheck className="h-4 w-4" />
                                        Questionnaire complété
                                    </span>
                                )}
                            </div>

                            <dl className="mt-8 grid gap-5 border-y border-institutionnel/10 py-6 sm:grid-cols-2">
                                <ProfileDetail
                                    icon={<MapPin className="h-5 w-5" />}
                                    label="Localisation"
                                    value={
                                        locations.length
                                            ? locations.join(" · ")
                                            : "Non renseignée"
                                    }
                                />
                                <ProfileDetail
                                    icon={
                                        <BriefcaseBusiness className="h-5 w-5" />
                                    }
                                    label="Secteur"
                                    value={
                                        sectors.length
                                            ? sectors.join(" · ")
                                            : "Non renseigné"
                                    }
                                />
                            </dl>

                            <div className="mt-7">
                                <h2 className="flex items-center gap-2 font-main text-lg font-bold text-institutionnel">
                                    <Sparkles className="h-5 w-5" />
                                    Compétences
                                </h2>
                                {skills.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="rounded-md bg-[#edf3fb] px-3 py-1.5 text-sm font-medium text-institutionnel"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-[#667085]">
                                        Aucune compétence renseignée.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="overflow-hidden rounded-2xl border border-institutionnel/10 bg-[#172033] shadow-[0_12px_36px_rgb(23,32,51,0.16)]">
                        {videoUrl ? (
                            <video
                                controls
                                className="aspect-[9/16] max-h-[38rem] w-full bg-black object-contain"
                                src={videoUrl}
                            >
                                <track
                                    kind="captions"
                                    src="/captions.vtt"
                                    srcLang="fr"
                                    label="Français"
                                />
                                Votre navigateur ne prend pas en charge la
                                lecture vidéo.
                            </video>
                        ) : (
                            <div className="flex aspect-[9/16] items-center justify-center p-8 text-center text-sm text-white/70">
                                Aucune vidéo n&apos;est disponible pour ce
                                profil.
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-4 border-t border-white/10 p-4">
                            <p className="font-main text-sm font-bold text-white">
                                Vidéo de présentation
                            </p>
                            <button
                                type="button"
                                onClick={() => setLiked((current) => !current)}
                                aria-label={
                                    liked
                                        ? "Retirer le like"
                                        : "Aimer ce profil"
                                }
                                aria-pressed={liked}
                                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 px-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                            >
                                <Heart
                                    className={`h-4 w-4 ${liked ? "fill-[#f6c343] text-[#f6c343]" : ""}`}
                                />
                                {liked ? "Aimé" : "J'aime"}
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </PageShell>
    );
}

function ProfileDetail({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-3">
            <div className="mt-0.5 text-institutionnel">{icon}</div>
            <div>
                <dt className="text-sm font-medium text-[#667085]">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-[#172033]">
                    {value}
                </dd>
            </div>
        </div>
    );
}

function StatusMessage({ children }: { children: ReactNode }) {
    return (
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12">
            <p className="rounded-xl border border-institutionnel/10 bg-white px-6 py-5 text-[#526078] shadow-sm">
                {children}
            </p>
        </main>
    );
}

function PageShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] font-secondary text-[#172033]">
            <HeadBar />
            {children}
            <Footer />
        </div>
    );
}
