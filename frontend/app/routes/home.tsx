import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router";
import { useAuth } from "~/lib/authContext";
import { Carousel } from "../components/application/carousel/carousel-base";
import { HeadBar } from "../components/Headbar";

export function meta() {
    return [{ title: "JibJob" }, { name: "description", content: "Accueil" }];
}

export const CarouselLg = () => {
    return (
        <Carousel.Root className="relative aspect-[1.6] w-full max-w-160">
            <Carousel.PrevTrigger className="absolute top-1/2 left-5 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-alpha-white/90 p-2 text-fg-secondary outline-focus-ring backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <ChevronLeft className="size-6" />
            </Carousel.PrevTrigger>
            <Carousel.NextTrigger className="absolute top-1/2 right-5 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-alpha-white/90 p-2 text-fg-secondary outline-focus-ring backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <ChevronRight className="size-6" />
            </Carousel.NextTrigger>

            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
                <Carousel.IndicatorGroup className="flex gap-2">
                    {({ index }) => (
                        <Carousel.Indicator
                            index={index}
                            className={({ isSelected }) =>
                                `h-2 rounded-full transition-all ${
                                    isSelected
                                        ? "w-6 bg-white"
                                        : "w-2 bg-white/60"
                                }`
                            }
                        />
                    )}
                </Carousel.IndicatorGroup>
            </div>

            <Carousel.Content className="gap-2">
                <Carousel.Item className="overflow-hidden rounded-xl">
                    <img
                        alt="Example Illustration"
                        src="https://www.enseignementsup-recherche.gouv.fr/sites/default/files/2026-06/esr_orientation_concours_emploi_rh_esr_orientation_concours_emploi_rh_2_1.svg"
                        className="size-full object-cover"
                    />
                </Carousel.Item>
                <Carousel.Item className="overflow-hidden rounded-xl">
                    <img
                        alt="Example Illustration"
                        src="https://www.enseignementsup-recherche.gouv.fr/sites/default/files/2026-07/esr_bleu_illustration_vie_etudiante_recherche_femme_0.svg"
                        className="size-full object-cover"
                    />
                </Carousel.Item>
                <Carousel.Item className="overflow-hidden rounded-xl">
                    <img
                        alt="Example Illustration"
                        src="https://www.enseignementsup-recherche.gouv.fr/sites/default/files/2026-07/esr_illustration_recherche_science_enseignement_sup_statistique.svg"
                        className="size-full object-cover"
                    />
                </Carousel.Item>
            </Carousel.Content>
        </Carousel.Root>
    );
};

export default function Home() {
    const user = useAuth();

    return (
        <div>
            <HeadBar />
            <div className="mx-6 my-16 sm:mx-10 sm:my-20 lg:mx-16 lg:my-24 xl:mx-20 min-h-[70vh]">
                <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-12 xl:gap-16">
                    <div className="lg:flex-1 max-w-2xl">
                        <div className="font-marianne font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-institutionnel">
                            JibJob
                        </div>
                        <div className="font-spectral text-lg sm:text-xl lg:text-2xl text-institutionnel">
                            <p className="pt-3">
                                La plateforme de référence pour la recherche
                                d'emploi basée sur la publication de vidéos
                                propulsée par le ministère du Job et du Bonheur.
                            </p>
                        </div>
                        <div className="font-marianne font-bold text-2xl sm:text-3xl lg:text-4xl text-institutionnel pt-8 sm:pt-10">
                            Montrez votre talent en une vidéo :
                        </div>
                        <div className="flex flex-wrap gap-4 pt-4">
                            {!user.user ? (
                                <>
                                    <NavLink to="/login" end>
                                        <p className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-institutionnel border-institutionnel border-2 hover:bg-institutionnel/15 font-marianne">
                                            Connexion
                                        </p>
                                    </NavLink>
                                    <NavLink to="/register" end>
                                        <p className="rounded-md bg-institutionnel/50 px-5 py-2.5 text-white font-marianne font-medium hover:bg-institutionnel/15 hover:text-institutionnel">
                                            Inscription
                                        </p>
                                    </NavLink>
                                </>
                            ) : (
                                <NavLink to="/profile" end>
                                    <p className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-institutionnel border-institutionnel border-2 hover:bg-institutionnel/15 font-marianne">
                                        Votre profil
                                    </p>
                                </NavLink>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 flex justify-center lg:justify-end">
                        <CarouselLg />
                    </div>
                </div>
            </div>
        </div>
    );
}
