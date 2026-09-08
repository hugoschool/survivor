"use client";

import {
    ArrowRight,
    BadgeCheck,
    BriefcaseBusiness,
    MapPin,
    SlidersHorizontal,
    Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
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

export type User = {
    first_name: string;
    last_name: string;
    age: number;
    role: number;
    locations: ProfileItem[] | null;
    sectors: ProfileItem[] | null;
    skills: ProfileItem[] | null;
    survey_score: number | null;
    views: number;
    videos: UserVideo[] | null;
    model: {
        ID: number;
    };
};

export type UserVideo = {
    video_id: string;
    status: number;
};

export type ProfileItem = {
    id: number;
    content: string;
};

type VideosResponse = {
    user: User;
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

const profileValues = (items: ProfileItem[] | null) =>
    items?.map(({ content }) => content) ?? [];

export function meta() {
    return [{ title: "Recrutement" }];
}

function ProfileCard({ user }: { user: User }) {
    const fullName =
        `${user.first_name} ${user.last_name}`.trim() || "Profil anonyme";
    const locations = user.locations?.map(({ content }) => content) ?? [];
    const sectors = user.sectors?.map(({ content }) => content) ?? [];
    const skills = user.skills?.map(({ content }) => content) ?? [];
    const score = user.survey_score;

    return (
        <article className="group relative flex min-h-80 flex-col overflow-hidden rounded-2xl border border-institutionnel/10 bg-white p-5 shadow-[0_8px_30px_rgb(23,32,51,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-institutionnel/25 hover:shadow-[0_16px_36px_rgb(23,32,51,0.12)] sm:p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-institutionnel" />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate font-main text-lg font-bold text-institutionnel">
                        {fullName}
                    </h2>
                    <p className="mt-0.5 text-sm text-[#526078]">
                        {user.age ? `${user.age} ans` : "Âge non renseigné"}
                    </p>
                </div>
                {score !== null && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#e8f3ed] px-2.5 py-1 text-xs font-bold text-[#17623a]">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Questionnaire complété
                    </span>
                )}
            </div>

            <div className="mt-5 space-y-3 border-y border-institutionnel/10 py-4 text-sm">
                <div className="flex items-start gap-2.5 text-[#526078]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-institutionnel" />
                    <span className="line-clamp-2">
                        {locations.length
                            ? locations.join(" · ")
                            : "Localisation non renseignée"}
                    </span>
                </div>
                <div className="flex items-start gap-2.5 text-[#526078]">
                    <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-institutionnel" />
                    <span className="line-clamp-2">
                        {sectors.length
                            ? sectors.join(" · ")
                            : "Secteur non renseigné"}
                    </span>
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-institutionnel uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Compétences
                </div>
                {skills.length ? (
                    <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 3).map((skill) => (
                            <span
                                key={skill}
                                className="rounded-md bg-[#edf3fb] px-2.5 py-1 text-xs font-medium text-institutionnel"
                            >
                                {skill}
                            </span>
                        ))}
                        {skills.length > 3 && (
                            <span className="rounded-md bg-[#f1f3f6] px-2.5 py-1 text-xs font-medium text-[#526078]">
                                +{skills.length - 3}
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-[#7a8598]">Non renseignées</p>
                )}
            </div>

            <Link
                to={`/recruit/${user.model.ID}`}
                className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-institutionnel bg-white px-4 font-main text-sm font-bold text-institutionnel transition-colors hover:bg-institutionnel hover:text-white"
            >
                Voir le profil
                <ArrowRight className="h-4 w-4" />
            </Link>
        </article>
    );
}

export default function Recruit() {
    const [users, setUsers] = useState<User[]>([]);
    const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] =
        useState<Filters>(EMPTY_FILTERS);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const loadProfiles = async () => {
            try {
                const response = await fetch(`${API_URL}/videos?page=0`);
                if (!response.ok) {
                    throw new Error("Impossible de charger les vidéos.");
                }
                const payload = (await response.json()) as VideosResponse[];
                const usersMap = new Map(
                    payload.map(({ user }) => [user.model.ID, user]),
                );
                setUsers(Array.from(usersMap.values()));
            } catch {
                setUsers([]);
            }
        };

        void loadProfiles();
    }, []);

    const sectors = useMemo(
        () => [
            ...new Set(users.flatMap((user) => profileValues(user.sectors))),
        ],
        [users],
    );
    const locations = useMemo(
        () => [
            ...new Set(users.flatMap((user) => profileValues(user.locations))),
        ],
        [users],
    );

    const visibleUsers = useMemo(() => {
        return users.filter((user) => {
            const profileSearchText = [
                user.first_name,
                user.last_name,
                ...profileValues(user.skills),
                ...profileValues(user.sectors),
                ...profileValues(user.locations),
            ]
                .join(" ")
                .toLowerCase();
            const matchesQuery =
                !appliedFilters.query ||
                profileSearchText.includes(appliedFilters.query.toLowerCase());
            const matchesSector =
                appliedFilters.sector === "all" ||
                profileValues(user.sectors).includes(appliedFilters.sector);
            const matchesLocation =
                appliedFilters.location === "all" ||
                profileValues(user.locations).includes(appliedFilters.location);
            const matchesCertified = appliedFilters.certifiedOnly
                ? user.survey_score !== null
                : true;
            return (
                matchesQuery &&
                matchesSector &&
                matchesLocation &&
                matchesCertified
            );
        });
    }, [users, appliedFilters]);

    const applyFilters = () => {
        setAppliedFilters(draftFilters);
        setDrawerOpen(false);
    };

    const resetFilters = () => {
        setDraftFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
    };

    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-[#F7F9FC] font-secondary text-[#172033] scheme-light">
            <HeadBar />

            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
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
                <section className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="font-main text-xl font-bold text-institutionnel">
                                Profils disponibles
                            </h2>
                            <p className="mt-1 text-sm text-[#526078]">
                                Consultez les informations essentielles avant de
                                prendre contact.
                            </p>
                        </div>
                        <span className="hidden rounded-full bg-institutionnel/8 px-3 py-1.5 text-sm font-bold text-institutionnel sm:block">
                            {visibleUsers.length} profil
                            {visibleUsers.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleUsers.map((user) => (
                            <ProfileCard key={user.model.ID} user={user} />
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
