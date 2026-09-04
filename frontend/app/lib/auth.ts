export const API_URL =
    typeof window === "undefined"
        ? "http://localhost:8080"
        : `${window.location.protocol}//${window.location.hostname}:8080`;

export const AUTH_KEYS = {
    token: "token",
    user: "user",
} as const;

export type ProfileItem = {
    id: number;
    content: string;
};

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    role: number;
    age: number;
    views: number;
    survey_score: number | null;
    skills: ProfileItem[];
    locations: ProfileItem[];
    sectors: ProfileItem[];
    videos: ProfileItem[];
};

export function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(AUTH_KEYS.token);
}

export function saveUser(user: User) {
    window.localStorage.setItem(AUTH_KEYS.user, JSON.stringify(user));
}

export function readSavedUser(): User | null {
    if (typeof window === "undefined") return null;

    try {
        const saved = window.localStorage.getItem(AUTH_KEYS.user);
        return saved ? (JSON.parse(saved) as User) : null;
    } catch {
        return null;
    }
}

export async function fetchCurrentUser(token = getToken()) {
    if (!token) {
        return null;
    }

    const response = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 404) clearSession();
        throw new Error("Impossible de récupérer le profil");
    }

    const user = (await response.json()) as User;
    saveUser(user);
    return user;
}
export function clearSession() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUTH_KEYS.token);
    window.localStorage.removeItem(AUTH_KEYS.user);
    window.dispatchEvent(new Event("auth-change"));
}
