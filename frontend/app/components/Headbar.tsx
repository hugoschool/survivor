export function HeadBar() {
    return (
        <header className="bg-white text-black">
            <div className="flex mx-auto items-center justify-center">
                <div className="flex flex-1 mx-auto items-center justify-center gap-6 mt-4">
                    <div className="flex-1" />
                    <nav>
                        <ul className="flex items-center gap-20 text-sm font-medium">
                            <li>
                                <a className="text-gray-500 transition hover:text-gray-500/75 hover:underline">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a className="text-gray-500 transition hover:text-gray-500/75 hover:underline">
                                    Recruit
                                </a>
                            </li>
                            <li>
                                <a className="text-gray-500 transition hover:text-gray-500/75 hover:underline">
                                    Administration
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <div className="flex flex-1 mx-auto items-center justify-end gap-4 me-4">
                        <div className="sm:flex sm:gap-4">
                            <a className="rounded-md bg-black text-white px-5 py-2.5 text-sm font-medium shadow-sm">
                                Log In
                            </a>
                        </div>

                        <div className="hidden sm:flex">
                            <a className="rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-black">
                                Register
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
