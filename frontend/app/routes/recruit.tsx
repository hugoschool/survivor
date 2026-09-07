"use client";

import { BadgeCheck, Heart, MapPin, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { VerticalFeed, type VideoItem } from "react-vertical-feed";
import { HeadBar } from "~/components/Headbar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { API_URL } from "~/lib/auth";
import "@codegouvfr/react-dsfr/dsfr/fonts/index.css";
import { Footer } from "~/components/Footer";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../components/ui/drawer";

type CandidateVideo = VideoItem & {
    candidateName: string;
    role: string;
    sector?: string;
    location?: string;
    certified: boolean;
};

type VideosResponse = {
    video: { id: string; link: string };
    user: {
        first_name: string;
        last_name: string;
        survey_score: number | null;
    };
};

type Filters = {
    query: string;
    sector: string;
    location: string;
    certifiedOnly: boolean;
};

const EMPTY_FILTERS: Filters = {
    query: "",
    sector: "all",
    location: "all",
    certifiedOnly: false,
};

export function meta() {
    return [{ title: "Recrutement" }];
}

function LikeButton({
    liked,
    onClick,
}: {
    liked: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={liked}
            aria-label={liked ? "Retirer le like" : "Aimer cette vidéo"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/15 backdrop-blur-sm transition-transform hover:bg-white/25 active:scale-90"
        >
            <Heart
                className={
                    liked
                        ? "h-6 w-6 fill-[#F6C343] text-[#F6C343] transition-colors"
                        : "h-6 w-6 text-white transition-colors"
                }
            />
        </button>
    );
}

export default function Recruit() {
    const [videos, setVideos] = useState<CandidateVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
    const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] =
        useState<Filters>(EMPTY_FILTERS);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const loadVideos = async () => {
            try {
                const response = await fetch(`${API_URL}/videos?page=0`);
                if (!response.ok) {
                    throw new Error("Impossible de charger les vidéos.");
                }

                const payload = (await response.json()) as VideosResponse[];
                setVideos(
                    payload.map(({ video, user }) => ({
                        id: video.id,
                        src: video.link,
                        loop: true,
                        candidateName:
                            `${user.first_name} ${user.last_name}`.trim() ||
                            "Candidat",
                        role: "Candidat",
                        certified: user.survey_score !== null,
                    })),
                );
            } catch {
                setLoadError(
                    "Impossible de charger les vidéos pour le moment.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadVideos();
    }, []);

    const sectors = useMemo(
        () => [...new Set(videos.map((v) => v.sector).filter(Boolean))],
        [videos],
    );
    const locations = useMemo(
        () => [...new Set(videos.map((v) => v.location).filter(Boolean))],
        [videos],
    );

    const visibleVideos = useMemo(() => {
        return videos.filter((v) => {
            const matchesQuery = appliedFilters.query
                ? `${v.candidateName} ${v.role}`
                      .toLowerCase()
                      .includes(appliedFilters.query.toLowerCase())
                : true;
            const matchesSector =
                appliedFilters.sector === "all" ||
                v.sector === appliedFilters.sector;
            const matchesLocation =
                appliedFilters.location === "all" ||
                v.location === appliedFilters.location;
            const matchesCertified = appliedFilters.certifiedOnly
                ? v.certified
                : true;
            return (
                matchesQuery &&
                matchesSector &&
                matchesLocation &&
                matchesCertified
            );
        });
    }, [videos, appliedFilters]);

    const currentVideo = visibleVideos[currentVideoIndex];
    const currentVideoId = currentVideo?.id;

    const toggleLike = (videoId: string) => {
        setLikedVideos((prev) => {
            const next = new Set(prev);
            next.has(videoId) ? next.delete(videoId) : next.add(videoId);
            return next;
        });
    };

    const applyFilters = () => {
        setAppliedFilters(draftFilters);
        setCurrentVideoIndex(0);
        setDrawerOpen(false);
    };

    const resetFilters = () => {
        setDraftFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
    };

    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-[#F7F9FC] font-secondary text-[#172033] scheme-light">
            <HeadBar />

            <main className="flex min-h-0 flex-1 flex-col">
                <div className="border-y border-institutionnel/15 bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div>
                            <p className="mb-1 font-main text-xs font-bold tracking-[0.16em] text-institutionnel uppercase">
                                Espace recruteur
                            </p>
                            <h1 className="font-main text-2xl font-bold tracking-tight text-institutionnel sm:text-3xl">
                                Découvrez les talents
                            </h1>
                        </div>
                        <Drawer
                            direction="right"
                            open={drawerOpen}
                            onOpenChange={setDrawerOpen}
                        >
                            <DrawerTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-11 border-institutionnel bg-white px-4 font-main font-bold text-institutionnel hover:bg-institutionnel/5 hover:text-institutionnel"
                                    />
                                }
                            >
                                Filtres
                                <SlidersHorizontal data-icon="inline-end" />
                            </DrawerTrigger>
                            <DrawerContent
                                className="w-full max-w-md rounded-none border-l border-institutionnel/20 bg-[#F7F9FC] font-secondary text-[#172033]"
                                style={{
                                    top: "0",
                                    right: 0,
                                    bottom: 0,
                                    left: "auto",
                                    height: "auto",
                                    maxHeight: "none",
                                }}
                            >
                                <DrawerHeader className="border-b border-institutionnel/15 bg-white">
                                    <DrawerTitle className="font-main text-xl font-bold text-institutionnel">
                                        Filtrer les profils
                                    </DrawerTitle>
                                    <DrawerDescription>
                                        Affinez le feed par compétence, secteur,
                                        localisation ou statut de certification.
                                    </DrawerDescription>
                                </DrawerHeader>

                                <div className="flex flex-col gap-5 p-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            htmlFor="filter-query"
                                            className="font-main text-sm font-bold text-institutionnel"
                                        >
                                            Compétence ou mot-clé
                                        </label>
                                        <Input
                                            id="filter-query"
                                            placeholder="Ex. React, gestion de projet…"
                                            value={draftFilters.query}
                                            className="h-11 rounded-none border-institutionnel/35 bg-white text-[#172033] shadow-none focus-visible:border-institutionnel focus-visible:ring-institutionnel/25 scheme-light"
                                            onChange={(e) =>
                                                setDraftFilters((f) => ({
                                                    ...f,
                                                    query: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            htmlFor="filter-sector"
                                            className="font-main text-sm font-bold text-institutionnel"
                                        >
                                            Secteur
                                        </label>
                                        <select
                                            id="filter-sector"
                                            value={draftFilters.sector}
                                            onChange={(event) =>
                                                setDraftFilters((f) => ({
                                                    ...f,
                                                    sector: event.target.value,
                                                }))
                                            }
                                            className="h-11 rounded-none border border-institutionnel/35 bg-white px-3 text-sm text-[#172033] outline-none focus:border-institutionnel focus:ring-2 focus:ring-institutionnel/20 scheme-light"
                                        >
                                            <option value="all">
                                                Tous les secteurs
                                            </option>
                                            {sectors.map((sector) => (
                                                <option
                                                    key={sector}
                                                    value={sector}
                                                >
                                                    {sector}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            htmlFor="filter-location"
                                            className="font-main text-sm font-bold text-institutionnel"
                                        >
                                            Localisation
                                        </label>
                                        <select
                                            id="filter-location"
                                            value={draftFilters.location}
                                            onChange={(event) =>
                                                setDraftFilters((f) => ({
                                                    ...f,
                                                    location:
                                                        event.target.value,
                                                }))
                                            }
                                            className="h-11 rounded-none border border-institutionnel/35 bg-white px-3 text-sm text-[#172033] outline-none focus:border-institutionnel focus:ring-2 focus:ring-institutionnel/20 scheme-light"
                                        >
                                            <option value="all">
                                                Toutes les villes
                                            </option>
                                            {locations.map((location) => (
                                                <option
                                                    key={location}
                                                    value={location}
                                                >
                                                    {location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <label className="flex items-center gap-3 text-sm font-medium text-[#172033]">
                                        <input
                                            type="checkbox"
                                            checked={draftFilters.certifiedOnly}
                                            onChange={(e) =>
                                                setDraftFilters((f) => ({
                                                    ...f,
                                                    certifiedOnly:
                                                        e.target.checked,
                                                }))
                                            }
                                            className="h-4 w-4 accent-institutionnel"
                                        />
                                        Certifiés uniquement
                                    </label>
                                </div>

                                <DrawerFooter className="border-t border-institutionnel/15 bg-white">
                                    <Button
                                        onClick={applyFilters}
                                        className="h-11 rounded-none border-institutionnel bg-[#ffffff] font-main font-bold text-institutionnel hover:bg-institutionnel/5"
                                    >
                                        Appliquer
                                    </Button>
                                    <DrawerClose
                                        render={
                                            <Button
                                                variant="outline"
                                                onClick={resetFilters}
                                                className="h-11 rounded-none border-institutionnel font-main font-bold text-institutionnel hover:bg-institutionnel/5 hover:text-institutionnel"
                                            />
                                        }
                                    >
                                        Réinitialiser
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center px-8 text-center">
                        <p className="text-base text-[#52627b]">
                            Chargement des vidéos…
                        </p>
                    </div>
                ) : loadError ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                        <h2 className="font-[Marianne] text-xl font-bold text-institutionnel">
                            Les vidéos sont indisponibles
                        </h2>
                        <p className="text-base text-[#52627b]">{loadError}</p>
                    </div>
                ) : visibleVideos.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                        <h2 className="font-[Marianne] text-xl font-bold text-institutionnel">
                            Aucun profil ne correspond à ces filtres
                        </h2>
                        <p className="text-base text-[#52627b]">
                            Essayez d'élargir votre recherche.
                        </p>
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 justify-center overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
                        <div className="relative aspect-9/16 h-full max-w-full overflow-hidden rounded-none border-4 border-white bg-black shadow-[0_12px_32px_rgba(27,58,107,0.22)]">
                            <VerticalFeed
                                items={visibleVideos}
                                onCurrentItemChange={setCurrentVideoIndex}
                                style={{ height: "100%", width: "100%" }}
                            />

                            {currentVideo && (
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#07142a]/95 via-[#07142a]/65 to-transparent p-5 pr-18">
                                    <div className="mb-2 flex items-center gap-2">
                                        <h2 className="font-main text-lg font-bold text-white">
                                            {currentVideo.candidateName}
                                        </h2>
                                        {currentVideo.certified && (
                                            <BadgeCheck
                                                className="h-5 w-5 shrink-0 text-[#F6C343]"
                                                aria-label="Profil certifié"
                                            />
                                        )}
                                    </div>
                                    <p className="text-sm text-white/95">
                                        {currentVideo.role}
                                    </p>
                                    {(currentVideo.sector ||
                                        currentVideo.location) && (
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                                            {currentVideo.sector && (
                                                <span className="bg-white px-2.5 py-1 text-institutionnel">
                                                    {currentVideo.sector}
                                                </span>
                                            )}
                                            {currentVideo.location && (
                                                <span className="flex items-center gap-1 border border-white/50 px-2.5 py-1 text-white">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {currentVideo.location}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="absolute bottom-6 right-3 z-10 flex flex-col items-center gap-1">
                                <LikeButton
                                    liked={
                                        currentVideoId
                                            ? likedVideos.has(currentVideoId)
                                            : false
                                    }
                                    onClick={() =>
                                        currentVideoId &&
                                        toggleLike(currentVideoId)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
