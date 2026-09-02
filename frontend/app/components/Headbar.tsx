import { NavLink } from "react-router";

export function HeadBar() {
    return (
        <header className="bg-white text-black">
            <div className="flex mx-auto items-center justify-center">
                <div className="flex flex-1 mx-auto items-center justify-center gap-6 mt-4">
                    <div className="flex-1" />
                    <nav>
                        <ul className="flex items-center gap-20 text-sm font-medium">
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
                        <NavLink to="/login" className="sm:flex sm:gap-4" end>
                            <p className="rounded-md bg-black text-white px-5 py-2.5 text-sm font-medium shadow-sm">
                                Log In
                            </p>
                        </NavLink>

                        <NavLink to="/login" className="hidden sm:flex" end>
                            <p className="rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-black">
                                Register
                            </p>
                        </NavLink>
                    </div>
                </div>
            </div>
        </header>
    );
}
