import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";

const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    return Boolean(
        window.localStorage.getItem("token") ||
            window.localStorage.getItem("jwt-token"),
    );
};

export function HeadBar() {
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState<boolean>(isAuthenticated);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const syncAuth = () => setLoggedIn(isAuthenticated());
        syncAuth();
        window.addEventListener("storage", syncAuth);

        return () => window.removeEventListener("storage", syncAuth);
    }, []);

    const handleLogout = () => {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("jwt-token");
        window.localStorage.removeItem("user");
        setLoggedIn(false);
        setMenuOpen(false);
        navigate("/login", { replace: true });
    };

    return (
        <header className="relative bg-white text-black font-marianne">
            <div className="mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6">
                <div className="relative flex w-full items-center py-4 sm:grid sm:grid-cols-3">
                    <div className="flex w-full items-center justify-between sm:w-auto sm:justify-self-start">
                        <NavLink to="/" end>
                            <p className="text-2xl font-medium sm:text-left text-institutionnel">
                                JibJob
                            </p>
                        </NavLink>
                        <button
                            type="button"
                            className="relative h-10 w-10 rounded-md p-2 text-ink transition-colors hover:bg-gray-100 sm:hidden"
                            aria-expanded={menuOpen}
                            aria-controls="headbar-menu"
                            aria-label={
                                menuOpen ? "Fermer le menu" : "Ouvrir le menu"
                            }
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <span
                                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${menuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                            >
                                <Menu size={22} aria-hidden="true" />
                            </span>
                            <span
                                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${menuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                            >
                                <X size={22} aria-hidden="true" />
                            </span>
                        </button>
                    </div>

                    <div
                        id="headbar-menu"
                        className={`absolute left-0 top-full z-10 flex w-full flex-col items-center gap-5 overflow-hidden border-t border-gray-100 bg-white p-5 shadow-md transition-all duration-300 ease-out sm:static sm:contents sm:overflow-visible sm:border-0 sm:bg-transparent sm:p-0 sm:opacity-100 sm:shadow-none sm:transition-none ${menuOpen ? "max-h-96 translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-2 opacity-0 sm:pointer-events-auto sm:max-h-none"}`}
                    >
                        <nav className="sm:col-start-2 sm:justify-self-center">
                            <ul className="flex flex-col items-center gap-4 text-sm font-medium sm:flex-row sm:gap-8 lg:gap-20">
                                <NavLink
                                    to="/recruit"
                                    end
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <p className="text-institutionnel transition hover:text-institutionnel/75 hover:underline">
                                        Recrutement
                                    </p>
                                </NavLink>
                                {/* <NavLink
                                    to="/administration"
                                    end
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <p className="text-institutionnel transition hover:text-institutionnel/75 hover:underline">
                                        Administration
                                    </p>
                                </NavLink> */}
                                <NavLink
                                    to="/survey"
                                    end
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <p className="text-institutionnel transition hover:text-institutionnel/75 hover:underline">
                                        Questionnaire
                                    </p>
                                </NavLink>
                            </ul>
                        </nav>

                        <div className="flex items-center justify-center gap-2 sm:col-start-3 sm:gap-4 sm:justify-self-end">
                            {loggedIn ? (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-institutionnel border-institutionnel border-2 hover:bg-institutionnel/15"
                                >
                                    Déconnexion
                                </button>
                            ) : (
                                <NavLink
                                    to="/login"
                                    end
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <p className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-institutionnel border-institutionnel border-2 hover:bg-institutionnel/15">
                                        Connexion
                                    </p>
                                </NavLink>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
