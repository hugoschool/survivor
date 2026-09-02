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
        navigate("/login", { replace: true });
    };

    return (
        <header className="bg-white text-black px-4">
            <div className="flex mx-auto items-center justify-center">
                <div className="flex flex-1 mx-auto items-center justify-center gap-6 mt-4">
                    <div className="hidden flex-1 md:block" />
                    <nav>
                        <ul className="flex items-center gap-5 md:gap-20 text-sm font-medium">
                            <NavLink to="/" end>
                                <p className="text-gray-500 transition hover:text-gray-500/75 hover:underline">
                                    Home
                                </p>
                            </NavLink>
                            <NavLink to="/recruit" end>
                                <p className="text-gray-500 transition hover:text-gray-500/75 hover:underline">
                                    Recruit
                                </p>
                            </NavLink>
                            <NavLink to="/administration" end>
                                <p className="text-gray-500 transition hover:text-gray-500/75 hover:underNavLinkne">
                                    Administration
                                </p>
                            </NavLink>
                            <NavLink to="/survey" end>
                                <p className="text-gray-500 transition hover:text-gray-500/75 hover:underNavLinkne">
                                    Survey
                                </p>
                            </NavLink>
                        </ul>
                    </nav>

                    <div className="flex flex-1 mx-auto items-center justify-end gap-4 me-4">
                        <NavLink to="/login" end>
                            <p className="rounded-md bg-black text-white px-5 py-2.5 text-sm font-medium shadow-sm">
                                Log In
                            </p>
                        </NavLink>

                        {!loggedIn && (
                            <NavLink
                                to="/register"
                                className="hidden sm:flex"
                                end
                            >
                                <p className="rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-black">
                                    Register
                                </p>
                            </NavLink>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
