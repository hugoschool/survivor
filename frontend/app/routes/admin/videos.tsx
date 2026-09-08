import { Check, CircleAlert, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Pager } from "~/components/application/pager";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
    fetchVideosToReview,
    reviewVideo,
    USERS_PAGE_SIZE,
    VIDEO_STATUS,
    type VideoReviewItem,
    type VideoStatus,
} from "~/lib/auth";

const DEFAULT_APPROVAL_MESSAGE = "Vidéo conforme aux règles de publication.";

export default function AdminVideos() {
    const [items, setItems] = useState<VideoReviewItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, string>>({});
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const data = await fetchVideosToReview(page);

            if (data.length === 0 && page > 1) {
                setPage((previous) => previous - 1);
                return;
            }

            setItems(data);
            setError(null);
        } catch (err: unknown) {
            setItems([]);
            setError(
                err instanceof Error
                    ? err.message
                    : "Impossible de récupérer les vidéos à modérer.",
            );
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    async function submitDecision(videoId: string, status: VideoStatus) {
        const message = (messages[videoId] ?? "").trim();

        if (status === VIDEO_STATUS.refused && message === "") {
            return;
        }

        setBusyId(videoId);
        setError(null);

        try {
            await reviewVideo(
                videoId,
                status,
                message || DEFAULT_APPROVAL_MESSAGE,
            );

            setMessages((previous) => {
                const next = { ...previous };
                delete next[videoId];
                return next;
            });
            await load();
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Impossible d'enregistrer la décision.",
            );
        } finally {
            setBusyId(null);
        }
    }

    const hasNext = items.length === USERS_PAGE_SIZE;

    return (
        <>
            <header className="flex flex-col gap-1 border-border border-b pb-5">
                <h1 className="font-heading text-xl font-medium">
                    Modération des vidéos
                </h1>
                <p className="text-sm text-muted-foreground">
                    Les vidéos en attente sont présentées de la plus ancienne à
                    la plus récente.
                </p>
            </header>

            <section className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-heading text-base font-medium">
                        File d'attente
                    </h2>
                    <p className="text-xs text-muted-foreground tabular-nums">
                        {loading
                            ? "Chargement…"
                            : `${items.length} en attente sur cette page`}
                    </p>
                </div>

                {error !== null && (
                    <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                        <CircleAlert className="size-4 shrink-0" />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-xl border border-border">
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            Chargement des vidéos…
                        </p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-border">
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            Aucune vidéo en attente de modération.
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {items.map((item) => {
                            const videoId = item.video.id;
                            const message = messages[videoId] ?? "";
                            const busy = busyId === videoId;

                            return (
                                <li
                                    key={videoId}
                                    className="flex flex-col gap-4 rounded-xl border border-border p-4 md:flex-row"
                                >
                                    <video
                                        className="w-full shrink-0 rounded-lg border border-border bg-black md:w-64"
                                        controls
                                        preload="metadata"
                                        src={item.video.link}
                                    >
                                        <track kind="captions" />
                                    </video>

                                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-sm font-medium">
                                                {`${item.user.first_name} ${item.user.last_name}`.trim() ||
                                                    "Sans nom"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.user.age} ans ·{" "}
                                                {item.user.survey_score === null
                                                    ? "questionnaire non passé"
                                                    : `score ${item.user.survey_score} %`}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <Label
                                                htmlFor={`message-${videoId}`}
                                            >
                                                Motif
                                                <span className="font-normal text-muted-foreground">
                                                    obligatoire pour un refus
                                                </span>
                                            </Label>
                                            <Textarea
                                                disabled={busy}
                                                id={`message-${videoId}`}
                                                onChange={(event) =>
                                                    setMessages((previous) => ({
                                                        ...previous,
                                                        [videoId]:
                                                            event.target.value,
                                                    }))
                                                }
                                                placeholder="Message transmis au candidat."
                                                value={message}
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                disabled={busy}
                                                onClick={() =>
                                                    submitDecision(
                                                        videoId,
                                                        VIDEO_STATUS.validated,
                                                    )
                                                }
                                                size="sm"
                                            >
                                                <Check />
                                                Valider
                                            </Button>
                                            <Button
                                                disabled={
                                                    busy ||
                                                    message.trim() === ""
                                                }
                                                onClick={() =>
                                                    submitDecision(
                                                        videoId,
                                                        VIDEO_STATUS.refused,
                                                    )
                                                }
                                                size="sm"
                                                variant="destructive"
                                            >
                                                <X />
                                                Refuser
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {(hasNext || page > 1) && (
                    <Pager
                        disabled={loading || busyId !== null}
                        hasNext={hasNext}
                        onPageChange={setPage}
                        page={page}
                    />
                )}
            </section>
        </>
    );
}
