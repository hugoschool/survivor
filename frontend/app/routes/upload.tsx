import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { HeadBar } from "~/components/Headbar";
import { API_URL, getToken } from "~/lib/auth";
import type { Route } from "../+types/root";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

// biome-ignore lint: params not used but is mandatory for func
export async function loader({ params }: Route.LoaderArgs) {
    return { message: "Administration" };
}

const AUTH_KEYS = {
    token: "token",
    legacyToken: "jwt-token",
};

const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    return Boolean(
        window.localStorage.getItem(AUTH_KEYS.token) ||
            window.localStorage.getItem(AUTH_KEYS.legacyToken),
    );
};

type UploadResponse = {
    id: string;
    link: string;
};

export default function Upload() {
    const navigate = useNavigate();
    const [loggedIn] = useState<boolean>(isAuthenticated);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<UploadResponse | null>(
        null,
    );
    const [uploadNotice, setUploadNotice] = useState<string | null>(null);

    useEffect(() => {
        if (!loggedIn) {
            navigate("/login", { replace: true });
        }
    }, [loggedIn, navigate]);

    if (!loggedIn) {
        return null;
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setSelectedFile(file);
        setError(null);
    };

    const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setUploadResult(null);
        setUploadNotice(null);

        if (!selectedFile) {
            setError("Merci de sélectionner une vidéo avant d'envoyer.");
            return;
        }

        const token = getToken();
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        setIsUploading(true);
        try {
            const response = await fetch(`${API_URL}/videos/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const payload = (await response.json().catch(() => null)) as
                | UploadResponse
                | { message?: string }
                | null;

            if (!response.ok) {
                if (response.status === 413) {
                    setError("Le fichier est trop volumineux (max 100 Mo).");
                    return;
                }
                const apiMessage =
                    payload && "message" in payload ? payload.message : null;
                setError(apiMessage || "Échec de l'upload de la vidéo.");
                return;
            }

            setUploadResult(payload as UploadResponse);
            setSelectedFile(null);
        } catch {
            setError("Impossible d'envoyer la vidéo pour le moment.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(27,58,107,0.08),transparent_42%),linear-gradient(to_bottom,#ffffff,#f7f9fc)]">
            <HeadBar />
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center px-4 py-10 sm:px-1 lg:px-8">
                <Card className="w-full overflow-hidden border-border/70 bg-white/90 shadow-lg backdrop-blur">
                    <CardHeader className="border-b border-border/60 bg-white/90">
                        <CardTitle className="text-4xl text-institutionnel sm:text-5xl">
                            Ajouter une vidéo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleUpload} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="video-file">
                                    Sélectionner un fichier vidéo
                                </Label>
                                <Input
                                    id="video-file"
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={isUploading}>
                                {isUploading ? "Envoi..." : "Envoyer la vidéo"}
                            </Button>

                            {error ? (
                                <p className="text-sm text-red-600">{error}</p>
                            ) : null}

                            {uploadResult ? (
                                <div className="grid gap-2">
                                    <p className="text-sm text-green-700">
                                        Vidéo envoyée, elle sera publique une
                                        fois validée par l'Administration.
                                    </p>
                                    {uploadNotice ? (
                                        <p className="text-sm text-[#52627b]">
                                            {uploadNotice}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
