"use client";

import { Heart, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { VerticalFeed, type VideoItem } from "react-vertical-feed";
import { HeadBar } from "~/components/Headbar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import "@codegouvfr/react-dsfr/dsfr/fonts/index.css";
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
    sector: string;
    location: string;
    certified: boolean;
    likes: number;
};

const videos: CandidateVideo[] = [
    {
        id: "intro",
        src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        loop: true,
        candidateName: "Camille R.",
        role: "Développeuse front-end",
        sector: "Tech",
        location: "Lyon",
        certified: true,
        likes: 42,
    },
    {
        id: "demo",
        src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
        loop: true,
        candidateName: "Yanis B.",
        role: "Chef de projet",
        sector: "Tech",
        location: "Paris",
        certified: false,
        likes: 128,
    },
    {
        id: "design",
        src: "https://media.w3.org/2010/05/sintel/trailer.mp4",
        loop: true,
        candidateName: "Sarah M.",
        role: "Designer produit",
        sector: "Design",
        location: "Bordeaux",
        certified: true,
        likes: 7,
    },
    {
        id: "data",
        src: "https://media.w3.org/2010/05/bunny/trailer.mp4",
        loop: true,
        candidateName: "Lina D.",
        role: "Data analyst",
        sector: "Tech",
        location: "Lille",
        certified: true,
        likes: 63,
    },
    {
        id: "marketing",
        src: "https://media.w3.org/2010/05/video/movie_300.mp4",
        loop: true,
        candidateName: "Thomas G.",
        role: "Responsable marketing",
        sector: "Marketing",
        location: "Nantes",
        certified: false,
        likes: 31,
    },
];

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
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-transform active:scale-90"
        >
            <Heart
                className={
                    liked
                        ? "h-6 w-6 fill-rose-500 text-rose-500 transition-colors"
                        : "h-6 w-6 text-white transition-colors"
                }
            />
        </button>
    );
}

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

export default function Recruit() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() =>
        Object.fromEntries(videos.map((v) => [v.id, v.likes])),
    );
    const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] =
        useState<Filters>(EMPTY_FILTERS);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const sectors = useMemo(
        () => Array.from(new Set(videos.map((v) => v.sector))),
        [],
    );
    const locations = useMemo(
        () => Array.from(new Set(videos.map((v) => v.location))),
        [],
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
    }, [appliedFilters]);

    const currentVideo = visibleVideos[currentVideoIndex];
    const currentVideoId = currentVideo?.id;

    const toggleLike = (videoId: string) => {
        setLikedVideos((prev) => {
            const next = new Set(prev);
            const alreadyLiked = next.has(videoId);

            if (alreadyLiked) {
                next.delete(videoId);
            } else {
                next.add(videoId);
            }

            setLikeCounts((counts) => ({
                ...counts,
                [videoId]: (counts[videoId] ?? 0) + (alreadyLiked ? -1 : 1),
            }));

            return next;
        });
    };

    const currentLikeCount = currentVideoId
        ? (likeCounts[currentVideoId] ?? 0)
        : 0;

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
        <div className="flex h-dvh flex-col overflow-hidden bg-white font-[Spectral] text-black scheme-light">
            <HeadBar />

            <div className="relative flex shrink-0 items-center justify-center px-4 py-4">
                <h1 className="font-[Marianne] text-4xl font-bold">JibJob</h1>
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
                                className="absolute right-4 top-1/2 h-10 -translate-y-1/2 px-4"
                            />
                        }
                    >
                        Filtres
                        <SlidersHorizontal data-icon="inline-end" />
                    </DrawerTrigger>
                    <DrawerContent
                        className="w-full max-w-md rounded-none font-[Spectral]"
                        style={{
                            top: "0",
                            right: 0,
                            bottom: 0,
                            left: "auto",
                            height: "auto",
                            maxHeight: "none",
                        }}
                    >
                        <DrawerHeader>
                            <DrawerTitle className="font-[Marianne]">
                                Filtrer les profils
                            </DrawerTitle>
                            <DrawerDescription>
                                Affinez le feed par compétence, secteur,
                                localisation ou statut de certification.
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="flex flex-col gap-4 p-4">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="filter-query"
                                    className="font-[Marianne] text-sm font-medium"
                                >
                                    Compétence ou mot-clé
                                </label>
                                <Input
                                    id="filter-query"
                                    placeholder="Ex. React, gestion de projet…"
                                    value={draftFilters.query}
                                    className="bg-white text-black scheme-light"
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
                                    className="font-[Marianne] text-sm font-medium"
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
                                    className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black [color-scheme:light]"
                                >
                                    <option value="all">
                                        Tous les secteurs
                                    </option>
                                    {sectors.map((sector) => (
                                        <option key={sector} value={sector}>
                                            {sector}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="filter-location"
                                    className="font-[Marianne] text-sm font-medium"
                                >
                                    Localisation
                                </label>
                                <select
                                    id="filter-location"
                                    value={draftFilters.location}
                                    onChange={(event) =>
                                        setDraftFilters((f) => ({
                                            ...f,
                                            location: event.target.value,
                                        }))
                                    }
                                    className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black [color-scheme:light]"
                                >
                                    <option value="all">
                                        Toutes les villes
                                    </option>
                                    {locations.map((location) => (
                                        <option key={location} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={draftFilters.certifiedOnly}
                                    onChange={(e) =>
                                        setDraftFilters((f) => ({
                                            ...f,
                                            certifiedOnly: e.target.checked,
                                        }))
                                    }
                                    className="h-4 w-4"
                                />
                                Certifiés uniquement
                            </label>
                        </div>

                        <DrawerFooter>
                            <Button onClick={applyFilters}>Appliquer</Button>
                            <DrawerClose
                                render={
                                    <Button
                                        variant="outline"
                                        onClick={resetFilters}
                                    />
                                }
                            >
                                Réinitialiser
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>

            {visibleVideos.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
                    <h2 className="font-[Marianne] text-base font-medium text-neutral-200">
                        Aucun profil ne correspond à ces filtres
                    </h2>
                    <p className="text-sm text-neutral-500">
                        Essayez d'élargir votre recherche.
                    </p>
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 justify-center overflow-hidden px-4 pb-4">
                    <div className="relative aspect-9/16 h-full max-w-full overflow-hidden rounded-2xl bg-black">
                        <VerticalFeed
                            items={visibleVideos}
                            onCurrentItemChange={setCurrentVideoIndex}
                            style={{ height: "100%", width: "100%" }}
                        />

                        {currentVideo && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4 pr-16">
                                <h2 className="font-[Marianne] text-sm font-semibold text-white">
                                    {currentVideo.candidateName}
                                </h2>
                                <p className="text-xs text-neutral-200">
                                    {currentVideo.role}
                                </p>
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
                                    currentVideoId && toggleLike(currentVideoId)
                                }
                            />
                            <span className="text-xs font-medium text-white">
                                {currentLikeCount}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
