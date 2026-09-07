import {
    CircleAlert,
    Download,
    Plus,
    Trash2,
    TriangleAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Pager } from "~/components/application/pager";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
    type ApiSurvey,
    fetchSurvey,
    type SurveyPayload,
    saveSurvey,
} from "~/lib/auth";

type Answer = { id: string; label: string; correct: boolean };
type Question = { id: string; prompt: string; answers: Answer[] };
type Survey = { questions: Question[]; obtentionRate: number };

const MIN_ANSWERS_PER_QUESTION = 2;

const QUESTIONS_PER_PAGE = 10;

const DEFAULT_OBTENTION_RATE = 60;

function createAnswer(): Answer {
    return { id: crypto.randomUUID(), label: "", correct: false };
}

function createQuestion(): Question {
    return {
        id: crypto.randomUUID(),
        prompt: "",
        answers: [createAnswer(), createAnswer()],
    };
}

function snapshot(questions: Question[], obtentionRate: number): string {
    return JSON.stringify({ questions, obtentionRate });
}

function toLocalSurvey(survey: ApiSurvey): Survey {
    return {
        obtentionRate: survey.obtention_rate,
        questions: (survey.questions ?? []).map((question) => ({
            id: crypto.randomUUID(),
            prompt: question.question,
            answers: (question.answers ?? []).map((answer) => ({
                id: crypto.randomUUID(),
                label: answer.answer,
                correct: answer.correct,
            })),
        })),
    };
}

function toSurveyPayload(
    questions: Question[],
    obtentionRate: number,
): SurveyPayload {
    return {
        obtention_rate: obtentionRate,
        questions: questions.map((question) => ({
            question: question.prompt,
            weight: 1,
            answers: question.answers.map((answer) => ({
                answer: answer.label,
                correct: answer.correct,
            })),
        })),
    };
}

function getQuestionIssues(question: Question): string[] {
    const issues: string[] = [];

    if (!question.prompt.trim()) {
        issues.push("L'énoncé est vide.");
    }
    if (question.answers.length < MIN_ANSWERS_PER_QUESTION) {
        issues.push(`Il faut au moins ${MIN_ANSWERS_PER_QUESTION} réponses.`);
    }
    if (question.answers.some((answer) => !answer.label.trim())) {
        issues.push("Une réponse est vide.");
    }
    if (!question.answers.some((answer) => answer.correct)) {
        issues.push("Aucune réponse n'est marquée comme correcte.");
    }

    return issues;
}

export default function AdminQuestionnaire() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [obtentionRate, setObtentionRate] = useState(DEFAULT_OBTENTION_RATE);
    const [savedSnapshot, setSavedSnapshot] = useState("");
    const [surveyExists, setSurveyExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let cancelled = false;

        fetchSurvey()
            .then((survey) => {
                if (cancelled) {
                    return;
                }

                if (survey === null) {
                    setSurveyExists(false);
                    setQuestions([]);
                    setObtentionRate(DEFAULT_OBTENTION_RATE);
                    setSavedSnapshot(snapshot([], DEFAULT_OBTENTION_RATE));
                    setNotice(
                        "Aucun questionnaire n'existe encore. Le premier enregistrement le créera.",
                    );
                    return;
                }

                const local = toLocalSurvey(survey);

                setSurveyExists(true);
                setQuestions(local.questions);
                setObtentionRate(local.obtentionRate);
                setSavedSnapshot(
                    snapshot(local.questions, local.obtentionRate),
                );
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Impossible de récupérer le questionnaire.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    function updateQuestion(id: string, patch: Partial<Question>) {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === id ? { ...question, ...patch } : question,
            ),
        );
    }

    function addQuestion() {
        const next = [...questions, createQuestion()];

        setQuestions(next);
        setPage(Math.ceil(next.length / QUESTIONS_PER_PAGE));
    }

    function removeQuestion(id: string) {
        setQuestions((prev) => prev.filter((question) => question.id !== id));
    }

    function addAnswer(questionId: string) {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                          ...question,
                          answers: [...question.answers, createAnswer()],
                      }
                    : question,
            ),
        );
    }

    function updateAnswer(
        questionId: string,
        answerId: string,
        patch: Partial<Answer>,
    ) {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                          ...question,
                          answers: question.answers.map((answer) =>
                              answer.id === answerId
                                  ? { ...answer, ...patch }
                                  : answer,
                          ),
                      }
                    : question,
            ),
        );
    }

    function removeAnswer(questionId: string, answerId: string) {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                          ...question,
                          answers: question.answers.filter(
                              (answer) => answer.id !== answerId,
                          ),
                      }
                    : question,
            ),
        );
    }

    function exportSurvey() {
        const blob = new Blob(
            [
                JSON.stringify(
                    toSurveyPayload(questions, obtentionRate),
                    null,
                    2,
                ),
            ],
            { type: "application/json" },
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "questionnaire.json";
        link.click();
        URL.revokeObjectURL(url);
    }

    async function handleSave() {
        setSaving(true);
        setError(null);
        setNotice(null);

        try {
            await saveSurvey(
                toSurveyPayload(questions, obtentionRate),
                surveyExists,
            );

            setSurveyExists(true);
            setSavedSnapshot(snapshot(questions, obtentionRate));
            setNotice("Questionnaire enregistré.");
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Impossible d'enregistrer le questionnaire.",
            );
        } finally {
            setSaving(false);
        }
    }

    const isDirty = snapshot(questions, obtentionRate) !== savedSnapshot;
    const incompleteCount = questions.filter(
        (question) => getQuestionIssues(question).length > 0,
    ).length;
    const isValid = questions.length > 0 && incompleteCount === 0;

    const totalPages = Math.max(
        1,
        Math.ceil(questions.length / QUESTIONS_PER_PAGE),
    );
    const currentPage = Math.min(page, totalPages);
    const firstIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const visibleQuestions = questions.slice(
        firstIndex,
        firstIndex + QUESTIONS_PER_PAGE,
    );

    return (
        <>
            <header className="flex flex-wrap items-center justify-between gap-3 border-border border-b pb-5">
                <div className="flex flex-col gap-1">
                    <h1 className="font-heading text-xl font-medium">
                        Questionnaire de certification
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Modifiez les questions, les réponses et le seuil
                        d'obtention.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        disabled={loading}
                        onClick={exportSurvey}
                        size="sm"
                        variant="outline"
                    >
                        <Download />
                        Exporter
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={addQuestion}
                        size="sm"
                        variant="outline"
                    >
                        <Plus />
                        Ajouter une question
                    </Button>
                </div>
            </header>

            {error !== null && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                    <CircleAlert className="size-4 shrink-0" />
                    {error}
                </div>
            )}

            {error === null && notice !== null && (
                <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    {notice}
                </div>
            )}

            <section className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-heading text-base font-medium">
                        Questions
                    </h2>
                    <p className="text-xs text-muted-foreground tabular-nums">
                        {questions.length} question
                        {questions.length > 1 ? "s" : ""} · seuil à{" "}
                        {obtentionRate} %
                        {totalPages > 1
                            ? ` · ${firstIndex + 1}-${firstIndex + visibleQuestions.length} affichées`
                            : ""}
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-border">
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            Chargement du questionnaire…
                        </p>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="rounded-xl border border-border">
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            Aucune question. Ajoutez-en une pour commencer.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {visibleQuestions.map((question, index) => {
                            const issues = getQuestionIssues(question);
                            const number = firstIndex + index + 1;

                            return (
                                <div
                                    key={question.id}
                                    className="flex flex-col gap-3 rounded-xl border border-border p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Question {number}
                                        </p>
                                        <Button
                                            aria-label={`Supprimer la question ${number}`}
                                            onClick={() =>
                                                removeQuestion(question.id)
                                            }
                                            size="icon-sm"
                                            variant="destructive"
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label
                                            htmlFor={`prompt-${question.id}`}
                                        >
                                            Énoncé
                                        </Label>
                                        <Textarea
                                            id={`prompt-${question.id}`}
                                            onChange={(event) =>
                                                updateQuestion(question.id, {
                                                    prompt: event.target.value,
                                                })
                                            }
                                            placeholder="Formulez la situation ou la question posée au candidat."
                                            value={question.prompt}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>
                                            Réponses
                                            <span className="font-normal text-muted-foreground">
                                                cochez les bonnes réponses
                                            </span>
                                        </Label>
                                        <ul className="flex flex-col gap-2">
                                            {question.answers.map((answer) => (
                                                <li
                                                    key={answer.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <input
                                                        aria-label="Réponse correcte"
                                                        checked={answer.correct}
                                                        className="size-4 shrink-0 accent-primary"
                                                        onChange={(event) =>
                                                            updateAnswer(
                                                                question.id,
                                                                answer.id,
                                                                {
                                                                    correct:
                                                                        event
                                                                            .target
                                                                            .checked,
                                                                },
                                                            )
                                                        }
                                                        type="checkbox"
                                                    />
                                                    <Input
                                                        aria-label="Texte de la réponse"
                                                        onChange={(event) =>
                                                            updateAnswer(
                                                                question.id,
                                                                answer.id,
                                                                {
                                                                    label: event
                                                                        .target
                                                                        .value,
                                                                },
                                                            )
                                                        }
                                                        placeholder="Texte de la réponse"
                                                        value={answer.label}
                                                    />
                                                    <Button
                                                        aria-label="Supprimer la réponse"
                                                        disabled={
                                                            question.answers
                                                                .length <=
                                                            MIN_ANSWERS_PER_QUESTION
                                                        }
                                                        onClick={() =>
                                                            removeAnswer(
                                                                question.id,
                                                                answer.id,
                                                            )
                                                        }
                                                        size="icon-sm"
                                                        variant="ghost"
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            className="self-start"
                                            onClick={() =>
                                                addAnswer(question.id)
                                            }
                                            size="xs"
                                            variant="ghost"
                                        >
                                            <Plus />
                                            Ajouter une réponse
                                        </Button>
                                    </div>

                                    {issues.length > 0 && (
                                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                                            <TriangleAlert className="size-3.5" />
                                            {issues.join(" ")}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        {totalPages > 1 && (
                            <Pager
                                className="pt-1"
                                hasNext={currentPage < totalPages}
                                onPageChange={setPage}
                                page={currentPage}
                                totalPages={totalPages}
                            />
                        )}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-3 rounded-xl border border-border p-5">
                <h2 className="font-heading text-base font-medium">
                    Seuil d'obtention
                </h2>
                <p className="text-sm text-muted-foreground">
                    Pourcentage minimum de bonnes réponses pour obtenir la
                    certification.
                </p>
                <div className="flex items-center gap-2">
                    <Input
                        aria-label="Seuil d'obtention en pourcentage"
                        className="w-24"
                        disabled={loading}
                        max={100}
                        min={0}
                        onChange={(event) => {
                            const value = Number(event.target.value);
                            setObtentionRate(
                                Number.isNaN(value)
                                    ? 0
                                    : Math.min(100, Math.max(0, value)),
                            );
                        }}
                        type="number"
                        value={obtentionRate}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                </div>
            </section>

            <section className="flex flex-wrap items-center justify-between gap-3 border-border border-t pt-5">
                <p className="text-sm text-muted-foreground">
                    {incompleteCount > 0
                        ? `${incompleteCount} question${incompleteCount > 1 ? "s" : ""} à compléter avant d'enregistrer.`
                        : isDirty
                          ? "Modifications non enregistrées."
                          : "Aucune modification en attente."}
                </p>
                <Button
                    disabled={loading || saving || !isDirty || !isValid}
                    onClick={handleSave}
                >
                    {saving ? "Enregistrement…" : "Enregistrer"}
                </Button>
            </section>
        </>
    );
}
