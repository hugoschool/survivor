import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
    BadgeCheck,
    BriefcaseBusiness,
    Eye,
    MapPin,
    PlayCircle,
    ShieldCheck,
    Sparkles,
    UserRound,
} from "lucide-react";
import { Footer } from "~/components/Footer";
import { HeadBar } from "~/components/Headbar";
import { API_URL, clearSession } from "~/lib/auth";
import { useAuth } from "~/lib/authContext";
import { Button } from "../components/ui/button";

export function meta() {
    return [{ title: "Profile" }];
}

const AUTH_KEYS = {
    token: "token",
    user: "user",
};

export type NullTime = {
    time: string;
    valid: boolean;
};

export type Model = {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: NullTime;
};

interface VideoStatus {
  model: Model;
  status: number;
  status_reason: string;
  user_id: number;
  video_id: string;
}

export interface videoURLType {
    "id": string,
    "link": string,
}

const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(AUTH_KEYS.token));
};

function StatCard({
    icon,
    label,
    value,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    accent: "green" | "blue" | "yellow" | "purple";
}) {
    const accents = {
        green: "bg-[#e8f3ed] text-[#17623a]",
        blue: "bg-[#edf3fb] text-institutionnel",
        yellow: "bg-[#fff5d8] text-[#8a6500]",
        purple: "bg-[#f1edfb] text-[#5b438c]",
    };

    return (
        <div className="rounded-2xl border border-[#dbe3ee] bg-white p-5 shadow-[0_8px_24px_rgb(23,32,51,0.05)]">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}>
                {icon}
            </div>
            <p className="mt-4 text-sm font-medium text-[#667085]">{label}</p>
            <p className="mt-1 truncate text-2xl font-bold text-[#172033]">{value}</p>
        </div>
    );
}

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-3 rounded-xl bg-[#f7f9fc] p-4">
            <div className="mt-0.5 text-institutionnel">{icon}</div>
            <div className="min-w-0">
                <p className="text-xs font-bold tracking-[0.12em] text-[#7a8598] uppercase">{label}</p>
                <p className="mt-1 wrap-break-word text-sm font-semibold text-[#172033]">{value}</p>
            </div>
        </div>
    );
}

export default function Profile() {
    const { user, refetch } = useAuth();
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState<boolean>(isAuthenticated);
    const [error, setError] = useState<string | null>(null);
    const [videoData, setVideoData] = useState<VideoStatus[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [videoURL, setVideoURL] = useState<videoURLType>();

    useEffect(() => {
        if (!loggedIn) {
            navigate("/login", { replace: true });
        }
    }, [loggedIn, navigate]);


    useEffect(() => {
        const getVideoLink = async () => {
            const video = videoData.find(({ status }) => status === 1);
            if (!video) {
                setVideoURL(undefined);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/videos/${video.video_id}`, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                    }
                });

                if (!res.ok) {
                    throw new Error("Connection error");
                }
                const data = await res.json().catch(() => ({})) as videoURLType;
                setVideoURL(data);
            } catch (err: any) {
                setError(err.message || "Connection error");
            }
        };
        getVideoLink();
    }, [videoData]);
    useEffect(() => {
        if (!showConfirm) return;

        setCountdown(5);
        const intervalId = window.setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    window.clearInterval(intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [showConfirm]);

    useEffect(() => {
        const getVideoId = async () => {
            try {
                const res = await fetch(`${API_URL}/videos/me`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    throw new Error("Connection error");
                }

                const data = await res.json().catch(() => null) as VideoStatus[] | null;
                setVideoData(data ?? []);
            } catch (err: any) {
                setError(err.message || "Connection error");
            }
        };
        getVideoId();
    },[])

    useEffect(() => {
        const syncAuth = () => setLoggedIn(isAuthenticated());

        syncAuth();
        window.addEventListener("storage", syncAuth);

        return () => {
            window.removeEventListener("storage", syncAuth);
        };
    }, []);

    useEffect(() => {
        if (!loggedIn) return;

        void refetch();
        const intervalId = window.setInterval(() => {
            void refetch();
        }, 15000);

        const handleFocus = () => {
            void refetch();
        };
        window.addEventListener("focus", handleFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleFocus);
        };
    }, [loggedIn, refetch]);

    if (!loggedIn) {
        return null;
    }

    const surveyScore = user?.survey_score;
    const displayName =
        `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
        "Utilisateur connecté";
    const locations = user?.locations?.map(({ content }) => content) ?? [];
    const sectors = user?.sectors?.map(({ content }) => content) ?? [];
    const skills = user?.skills?.map(({ content }) => content) ?? [];
    const hasValidatedVideo = videoData.some(({ status }) => status === 1);
    const profileFields = [
        Boolean(user?.first_name),
        Boolean(user?.last_name),
        Boolean(user?.age),
        locations.length > 0,
        sectors.length > 0,
        skills.length > 0,
        surveyScore !== null && surveyScore !== undefined,
        hasValidatedVideo,
    ];
    const profileCompletion = Math.round(
        (profileFields.filter(Boolean).length / profileFields.length) * 100,
    );

    const handleDeleteAccountClick = async () => {
        try {
            const res = await fetch(`http://localhost:8080/users/${user?.model.ID}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.error || "Connection error");
            }

            clearSession();
            window.localStorage.removeItem("token");
            window.localStorage.removeItem("user");
            setLoggedIn(false);
            window.dispatchEvent(new Event("auth-change"));
            navigate("/", { replace: true });
        } catch (err: any) {
            setError(err.message || "Connection error");
        }
    };
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(27,58,107,0.12),transparent_38%),linear-gradient(to_bottom,#f8fafc,#eef3f8)]">
            <HeadBar />
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <section className="overflow-hidden rounded-3xl bg-white text-institutionnel shadow-[0_20px_50px_rgb(23,32,51,0.18)]">
                    <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
                        <div>
                            <div className="flex items-center gap-3 text-institutionnel">
                                <UserRound className="h-5 w-5" />
                                <span className="text-sm font-bold tracking-[0.16em] uppercase">
                                    Espace candidat
                                </span>
                            </div>
                            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                                {displayName}
                            </h1>
                            <p className="mt-3 max-w-xl text-base text-institutionnel/70 sm:text-lg">
                                Votre profil est votre première présentation auprès des recruteurs.
                                Gardez-le complet et à jour.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="h-12 shrink-0 bg-white px-5 font-bold text-institutionnel hover:bg-institutionnel/15 border-institutionnel border-2"
                            onClick={() => navigate("/upload")}
                        >
                            <PlayCircle className="mr-2 h-5 w-5" />
                            Mettre à jour ma vidéo
                        </Button>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={<BadgeCheck className="h-5 w-5" />}
                        label="Questionnaire"
                        value={surveyScore !== null && surveyScore !== undefined ? `${surveyScore}%` : "À compléter"}
                        accent="green"
                    />
                    <StatCard
                        icon={<Eye className="h-5 w-5" />}
                        label="Vues du profil"
                        value={`${user?.views ?? 0}`}
                        accent="blue"
                    />
                    <StatCard
                        icon={<Sparkles className="h-5 w-5" />}
                        label="Compétences"
                        value={`${skills.length}`}
                        accent="yellow"
                    />
                    <StatCard
                        icon={<ShieldCheck className="h-5 w-5" />}
                        label="Vidéo"
                        value={hasValidatedVideo ? "Publiée" : videoData.length ? "En validation" : "À ajouter"}
                        accent="purple"
                    />
                </section>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
                    <section className="rounded-2xl border border-[#dbe3ee] bg-white p-6 shadow-[0_10px_30px_rgb(23,32,51,0.06)] sm:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold tracking-[0.14em] text-institutionnel uppercase">
                                    Votre profil
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-[#172033]">
                                    Informations visibles
                                </h2>
                            </div>
                            <ShieldCheck className="h-7 w-7 text-[#17623a]" />
                        </div>

                        <div className="mt-7 grid gap-5 sm:grid-cols-2">
                            <InfoItem
                                icon={<UserRound className="h-5 w-5" />}
                                label="Identité"
                                value={displayName}
                            />
                            <InfoItem
                                icon={<UserRound className="h-5 w-5" />}
                                label="Âge"
                                value={user?.age ? `${user.age} ans` : "Non renseigné"}
                            />
                            <InfoItem
                                icon={<MapPin className="h-5 w-5" />}
                                label="Localisation"
                                value={locations.length ? locations.join(" · ") : "Non renseignée"}
                            />
                            <InfoItem
                                icon={<BriefcaseBusiness className="h-5 w-5" />}
                                label="Secteur recherché"
                                value={sectors.length ? sectors.join(" · ") : "Non renseigné"}
                            />
                        </div>

                        <div className="mt-8 border-t border-[#e5eaf1] pt-6">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-institutionnel" />
                                <h3 className="font-bold text-[#172033]">Compétences</h3>
                            </div>
                            {skills.length ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="rounded-md bg-[#edf3fb] px-3 py-1.5 text-sm font-semibold text-institutionnel"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-[#667085]">
                                    Ajoutez vos compétences pour aider les recruteurs à mieux vous trouver.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-[#dbe3ee] bg-white shadow-[0_12px_36px_rgb(23,32,51,0.16)]">
                        <div className="flex items-center justify-between gap-4 p-6 pb-4">
                            <div>
                                <p className="text-xs font-bold tracking-[0.14em] text-[#b8c8e6] uppercase">
                                    Présentation
                                </p>
                                <h2 className="mt-1 text-xl font-bold text-institutionnel">Votre vidéo</h2>
                            </div>
                            <PlayCircle className="h-7 w-7 text-[#f6c343]" />
                        </div>
                        <div className="px-6">
                            {videoURL ? (
                                <video
                                    src={videoURL.link}
                                    controls
                                    muted
                                    loop
                                    className="aspect-video w-full rounded-xl bg-black object-contain"
                                />
                            ) : (
                                <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-institutionnel/60">
                                    Votre vidéo validée apparaîtra ici.
                                </div>
                            )}
                        </div>
                        <div className="p-6 pt-4">
                            <p className="text-sm leading-6 text-institutionnel/65">
                                Une vidéo claire permet aux recruteurs de découvrir votre personnalité avant le premier échange.
                            </p>
                        </div>
                    </section>
                </div>

                <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#f0d4d4] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        variant="outline"
                        size="lg"
                        className="border-red-900 bg-white font-bold text-red-900 hover:border-red-900 hover:bg-red-50 hover:text-red-900"
                        onClick={() => setShowConfirm(true)}
                    >
                        Supprimer mon compte
                    </Button>
                </section>
                {error && (
                    <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}
            </main>
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-institutionnel">
                            Confirmer la suppression
                        </h2>
                        <p className="mt-2 text-sm text-ink/70">
                            Cette action est irréversible. Toutes vos données seront
                            supprimées définitivement.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirm(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="outline"
                                disabled={countdown > 0}
                                className="border-red-900 bg-white font-bold text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => {
                                    setShowConfirm(false);
                                    handleDeleteAccountClick();
                                }}
                            >
                                {countdown > 0
                                    ? `Confirmer (${countdown}s)`
                                    : "Confirmer la suppression"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
