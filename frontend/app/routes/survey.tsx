import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { HeadBar } from "~/components/Headbar";
import { Button } from "~/components/ui/button";
import {
    Questionnaire,
    QuestionnaireActions,
    QuestionnaireChoice,
    QuestionnaireChoices,
    QuestionnaireDescription,
    QuestionnaireError,
    QuestionnaireItem,
    QuestionnaireNext,
    QuestionnairePrevious,
    QuestionnaireProgress,
    QuestionnaireSubmit,
    QuestionnaireTitle,
} from "~/components/ui/questionnaire";
import {
    type ApiSurvey,
    fetchSurvey,
    SurveyAlreadyCompletedError,
    submitSurvey,
} from "~/lib/auth";
import { useAuth } from "~/lib/authContext";

const MULTIPLE_CHOICE_THRESHOLD = 2;

type Choice = { value: string; answerId: number; label: string };

type Item = {
    name: string;
    questionId: number;
    required: true;
    prompt: string;
    description: string;
    choices: Choice[];
};

function toItems(survey: ApiSurvey): Item[] {
    return (survey.questions ?? []).map((question) => {
        const choices = (question.answers ?? []).map((answer) => ({
            value: String(answer.model.ID),
            answerId: answer.model.ID,
            label: answer.answer,
        }));

        return {
            name: `question-${question.model.ID}`,
            questionId: question.model.ID,
            required: true as const,
            prompt: question.question,
            description:
                choices.length > MULTIPLE_CHOICE_THRESHOLD
                    ? "Plusieurs réponses possibles."
                    : "Une seule réponse.",
            choices,
        };
    });
}

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <HeadBar />
            <div className="flex min-h-screen items-start justify-center px-4 pt-24">
                {children}
            </div>
        </div>
    );
}

function Panel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full max-w-3xl flex-col gap-4 rounded-xl border border-input p-8">
            {children}
        </div>
    );
}

export default function Survey() {
    const { user, loading: userLoading, refetch } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [obtentionRate, setObtentionRate] = useState<number | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [surveyId, setSurveyId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchSurvey()
            .then((survey) => {
                if (cancelled) {
                    return;
                }

                if (survey === null) {
                    setError(
                        "Aucun questionnaire n'est disponible pour le moment.",
                    );
                    return;
                }

                setItems(toItems(survey));
                setObtentionRate(survey.obtention_rate);
                setSurveyId(survey.model.ID);
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Impossible de charger le questionnaire.",
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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (surveyId === null) {
            setError("Cannot send the survey, no ID found");
            return;
        }

        const formData = new FormData(event.currentTarget);
        const submission = {
            survey_id: surveyId,
            questions: items.map((item) => {
                const selected = formData.getAll(item.name).map(String);

                return {
                    id: item.questionId,
                    answers: item.choices.map((choice) => ({
                        id: choice.answerId,
                        checked: selected.includes(choice.value),
                    })),
                };
            }),
        };

        setSubmitting(true);
        setError(null);

        try {
            setScore(await submitSurvey(submission));
            await refetch();
        } catch (err: unknown) {
            if (err instanceof SurveyAlreadyCompletedError) {
                setScore(user?.survey_score ?? null);
                setError(err.message);
            } else {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Impossible d'envoyer vos réponses.",
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (userLoading || loading) {
        return (
            <Layout>
                <Panel>
                    <p className="text-sm text-muted-foreground">
                        Chargement du questionnaire…
                    </p>
                </Panel>
            </Layout>
        );
    }

    if (user === null) {
        return (
            <Layout>
                <Panel>
                    <h1 className="font-heading text-xl font-medium">
                        Connexion requise
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Vous devez être connecté pour passer le questionnaire de
                        certification.
                    </p>
                    <NavLink className="self-start" to="/login">
                        <Button>Se connecter</Button>
                    </NavLink>
                </Panel>
            </Layout>
        );
    }

    const finalScore = score ?? user.survey_score;

    if (finalScore !== null && finalScore !== undefined) {
        const passed =
            obtentionRate !== null ? finalScore >= obtentionRate : null;

        return (
            <Layout>
                <Panel>
                    <h1 className="font-heading text-xl font-medium">
                        {passed === null
                            ? "Questionnaire terminé"
                            : passed
                              ? "Certification obtenue"
                              : "Certification non obtenue"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Score : {finalScore} %
                        {obtentionRate === null
                            ? ""
                            : ` — seuil de réussite à ${obtentionRate} %.`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Le questionnaire ne peut être passé qu'une seule fois.
                    </p>
                    <NavLink className="self-start" to="/profile">
                        <Button variant="outline">Voir mon profil</Button>
                    </NavLink>
                </Panel>
            </Layout>
        );
    }

    if (error !== null || items.length === 0) {
        return (
            <Layout>
                <Panel>
                    <p className="flex items-center gap-2 text-sm text-destructive">
                        <CircleAlert className="size-4 shrink-0" />
                        {error ??
                            "Ce questionnaire ne contient aucune question."}
                    </p>
                </Panel>
            </Layout>
        );
    }

    return (
        <Layout>
            <Questionnaire
                className="w-full max-w-3xl gap-6 rounded-xl border border-input p-8"
                items={items}
                onSubmit={handleSubmit}
            >
                <QuestionnaireProgress />
                {items.map((item) => (
                    <QuestionnaireItem
                        key={item.name}
                        multiple={
                            item.choices.length > MULTIPLE_CHOICE_THRESHOLD
                        }
                        name={item.name}
                        required={item.required}
                    >
                        <QuestionnaireTitle>{item.prompt}</QuestionnaireTitle>
                        <QuestionnaireDescription>
                            {item.description}
                        </QuestionnaireDescription>
                        <QuestionnaireChoices>
                            {item.choices.map((choice) => (
                                <QuestionnaireChoice
                                    key={choice.value}
                                    value={choice.value}
                                >
                                    {choice.label}
                                </QuestionnaireChoice>
                            ))}
                        </QuestionnaireChoices>
                        <QuestionnaireError />
                    </QuestionnaireItem>
                ))}
                <QuestionnaireActions>
                    <QuestionnairePrevious />
                    <QuestionnaireNext />
                    <QuestionnaireSubmit disabled={submitting} />
                </QuestionnaireActions>
            </Questionnaire>
        </Layout>
    );
}
