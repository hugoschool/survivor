export const API_URL =
    typeof window === "undefined"
        ? "http://localhost:8080"
        : `${window.location.protocol}//${window.location.hostname}:8080`;

export const AUTH_KEYS = {
    token: "token",
    user: "user",
} as const;

// Le backend embarque gorm.Model sans tag json sur Skill/Location/Sector :
// ses champs sont donc remontés à plat, d'où le "ID" en majuscules.
export type ProfileItem = {
    ID: number;
    content: string;
};

export const VIDEO_STATUS = {
    missing: 0,
    validated: 1,
    inTreatment: 2,
    awaitingModeration: 3,
    refused: 4,
} as const;

export type VideoStatus = (typeof VIDEO_STATUS)[keyof typeof VIDEO_STATUS];

// Sur User et Video, gorm.Model est tagué `json:"model"` : l'id est imbriqué.
export type Video = {
    model: { ID: number };
    user_id: number;
    video_id: string;
    status: VideoStatus;
};

export type User = {
    model: { ID: number };
    first_name: string;
    last_name: string;
    role: number;
    age: number;
    views: number;
    survey_score: number | null;
    skills: ProfileItem[] | null;
    locations: ProfileItem[] | null;
    sectors: ProfileItem[] | null;
    videos: Video[] | null;
};

export const ROLE = {
    jobSeeker: 0,
    recruiter: 1,
    admin: 2,
} as const;

// Doit rester aligné sur UsersPageSize côté backend (routes/user.go).
export const USERS_PAGE_SIZE = 20;

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

export async function fetchUsers(page: number): Promise<User[]> {
    const token = getToken();

    const response = await fetch(`${API_URL}/users?page=${page}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
        throw new Error("Impossible de récupérer les candidats");
    }

    // Go serialise une slice vide en null, pas en [].
    return ((await response.json()) as User[] | null) ?? [];
}

export type ApiAnswer = {
    model: { ID: number };
    question_id: number;
    answer: string;
    correct: boolean;
};

export type ApiQuestion = {
    model: { ID: number };
    survey_id: number;
    question: string;
    weight: number;
    answers: ApiAnswer[] | null;
};

export type ApiSurvey = {
    obtention_rate: number;
    questions: ApiQuestion[] | null;
};

export type SurveyPayload = {
    obtention_rate: number;
    questions: {
        question: string;
        weight: number;
        answers: { answer: string; correct: boolean }[];
    }[];
};

function authHeaders(): Record<string, string> {
    const token = getToken();

    if (!token) {
        throw new Error("Vous devez être connecté pour accéder à cette page.");
    }

    return { Authorization: `Bearer ${token}` };
}

export async function fetchSurvey(): Promise<ApiSurvey | null> {
    const response = await fetch(`${API_URL}/survey`, {
        method: "GET",
        headers: authHeaders(),
    });

    if (response.status === 404) {
        return null;
    }

    if (response.status === 401) {
        throw new Error("Session expirée, reconnectez-vous.");
    }

    if (!response.ok) {
        throw new Error("Impossible de récupérer le questionnaire.");
    }

    return (await response.json()) as ApiSurvey;
}

export async function saveSurvey(payload: SurveyPayload, exists: boolean) {
    const response = await fetch(`${API_URL}/survey`, {
        method: exists ? "PUT" : "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (response.status === 401) {
        throw new Error(
            "Enregistrement refusé : compte administrateur requis, ou session expirée.",
        );
    }

    if (!response.ok) {
        throw new Error("Impossible d'enregistrer le questionnaire.");
    }
}

const MAX_USER_PAGES = 50;

export async function fetchAllUsers(): Promise<User[]> {
    const byId = new Map<number, User>();

    for (let page = 1; page <= MAX_USER_PAGES; page += 1) {
        const batch = await fetchUsers(page);

        for (const user of batch) {
            byId.set(user.model.ID, user);
        }

        if (batch.length < USERS_PAGE_SIZE) {
            break;
        }
    }

    return [...byId.values()];
}

export type VideoReviewItem = {
    video: { id: string; link: string };
    user: User;
};

export async function fetchVideosToReview(
    page: number,
): Promise<VideoReviewItem[]> {
    const response = await fetch(`${API_URL}/videos/review?page=${page}`, {
        method: "GET",
        headers: authHeaders(),
    });

    if (response.status === 401) {
        throw new Error(
            "Accès refusé : compte administrateur requis, ou session expirée.",
        );
    }

    if (!response.ok) {
        throw new Error("Impossible de récupérer les vidéos à modérer.");
    }

    return ((await response.json()) as VideoReviewItem[] | null) ?? [];
}

export async function reviewVideo(
    videoId: string,
    status: VideoStatus,
    message: string,
) {
    const response = await fetch(
        `${API_URL}/videos/${encodeURIComponent(videoId)}/review`,
        {
            method: "PUT",
            headers: { ...authHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ status, message }),
        },
    );

    if (response.status === 401) {
        throw new Error(
            "Action refusée : compte administrateur requis, ou session expirée.",
        );
    }

    if (response.status === 404) {
        throw new Error("Cette vidéo n'existe plus.");
    }

    if (!response.ok) {
        throw new Error("Impossible d'enregistrer la décision.");
    }
}
