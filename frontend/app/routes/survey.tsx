import { HeadBar } from "~/components/Headbar";
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
    QuestionnaireSkip,
    QuestionnaireSubmit,
    QuestionnaireTitle,
} from "~/components/ui/questionnaire";

const items = [
    {
        name: "direction",
        required: true,
        prompt: "Qui est le Neuille le plus Neuillesque de la promo",
        description: "Le top neuille de la classe , l'élite des NOEUILLE",
        choices: [
            {
                value: "MOMO le non conforme",
                label: "MOMO le non conforme",
                description: "Spécialiste du -42",
            },
            {
                value: "Mathiou pitchoun",
                label: "Mathiou pitchoun",
                description: "Empereur des escort",
            },
            { value: "Autre", label: "Personne non mentionné" },
        ],
    },
    {
        name: "detail",
        required: false,
        prompt: "How much detail should it include?",
        description: "Skip this if you are not sure yet.",
        choices: [
            { value: "focused", label: "Focused" },
            { value: "complete", label: "Complete flow" },
        ],
    },
] as const;

export default function Survey() {
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const answers = Object.fromEntries(new FormData(event.currentTarget));
        console.log(answers);
    }

    return (
        <div>
            <HeadBar />
            <div className="flex min-h-screen items-start pt-24 justify-center px-4">
                <Questionnaire
                    className="flex w-full max-w-3xl flex-col gap-6 rounded-xl border border-input p-8"
                    items={items}
                    onSubmit={handleSubmit}
                >
                    <QuestionnaireProgress />
                    {items.map((question) => (
                        <QuestionnaireItem
                            key={question.name}
                            name={question.name}
                            required={question.required}
                        >
                            <QuestionnaireTitle>
                                {question.prompt}
                            </QuestionnaireTitle>
                            <QuestionnaireDescription>
                                {question.description}
                            </QuestionnaireDescription>
                            <QuestionnaireChoices>
                                {question.choices.map((choice) => (
                                    <QuestionnaireChoice
                                        key={choice.value}
                                        value={choice.value}
                                    >
                                        <span className="font-medium">
                                            {choice.label}
                                        </span>
                                        {"description" in choice ? (
                                            <span className="text-muted-foreground">
                                                {choice.description}
                                            </span>
                                        ) : null}
                                    </QuestionnaireChoice>
                                ))}
                            </QuestionnaireChoices>
                            <QuestionnaireError />
                        </QuestionnaireItem>
                    ))}
                    <QuestionnaireActions>
                        <QuestionnairePrevious />
                        <QuestionnaireSkip />
                        <QuestionnaireNext />
                        <QuestionnaireSubmit />
                    </QuestionnaireActions>
                </Questionnaire>
            </div>
        </div>
    );
}
