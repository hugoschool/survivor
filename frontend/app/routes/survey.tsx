import { useState } from "react";
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

const PASSING_SCORE = 12;

const items = [
    {
        name: "q01",
        required: true,
        prompt: "Vous identifiez un risque de dépassement sur un délai client, mais vous ne savez pas encore de combien.",
        description: "Une seule réponse.",
        choices: [
            {
                value: "alerter-tot",
                label: "Je signale le risque tout de suite, même sans pouvoir annoncer de nouvelle date.",
                correct: true,
            },
            {
                value: "attendre-date",
                label: "J'attends d'avoir une date fiable à proposer avant d'en parler.",
                correct: false,
            },
        ],
    },
    {
        name: "q02",
        required: true,
        prompt: "Qu'est-ce qui entretient une motivation durable, au-delà des premiers mois ?",
        description: "Deux réponses à cocher.",
        choices: [
            {
                value: "sens",
                label: "Comprendre à quoi sert concrètement son travail.",
                correct: true,
            },
            {
                value: "progression",
                label: "Constater que ses compétences progressent.",
                correct: true,
            },
            {
                value: "felicitations",
                label: "Recevoir régulièrement des félicitations de sa hiérarchie.",
                correct: false,
            },
            {
                value: "nouveaute",
                label: "Travailler en permanence sur de nouveaux sujets.",
                correct: false,
            },
        ],
    },
    {
        name: "q03",
        required: true,
        prompt: "Vous quittez l'entreprise. Vous avez conçu un outil de suivi qui vous a demandé des mois de travail.",
        description: "Une seule réponse.",
        choices: [
            {
                value: "transmettre",
                label: "Je le documente et je le laisse à l'équipe : il a été produit dans le cadre de mon poste.",
                correct: true,
            },
            {
                value: "copie-perso",
                label: "J'en garde une copie personnelle : c'est ma méthode et mon savoir-faire.",
                correct: false,
            },
        ],
    },
    {
        name: "q04",
        required: true,
        prompt: "Quels comportements font réellement progresser une équipe ?",
        description: "Deux réponses à cocher.",
        choices: [
            {
                value: "info-spontanee",
                label: "Partager une information utile sans attendre qu'on la demande.",
                correct: true,
            },
            {
                value: "desaccord-avant",
                label: "Exprimer un désaccord avant que la décision soit prise.",
                correct: true,
            },
            {
                value: "preserver-cohesion",
                label: "Garder un désaccord mineur pour soi afin de préserver la cohésion.",
                correct: false,
            },
            {
                value: "valider-chaque-etape",
                label: "Faire valider chaque étape par le groupe avant d'avancer.",
                correct: false,
            },
        ],
    },
    {
        name: "q05",
        required: true,
        prompt: "En réunion, un collègue critique publiquement une décision que vous avez prise.",
        description: "Une seule réponse.",
        choices: [
            {
                value: "contexte-puis-fond",
                label: "Je donne le contexte factuel et je propose de reprendre le fond après la réunion.",
                correct: true,
            },
            {
                value: "repondre-point-par-point",
                label: "Je réponds point par point immédiatement, pour ne pas laisser de doute s'installer.",
                correct: false,
            },
        ],
    },
    {
        name: "q06",
        required: true,
        prompt: "Votre charge dépasse votre capacité pour la semaine.",
        description: "Deux réponses à cocher.",
        choices: [
            {
                value: "impact-echeance",
                label: "Trier selon l'impact et l'échéance réelle, pas ressentie.",
                correct: true,
            },
            {
                value: "rendre-visible",
                label: "Rendre visible dès maintenant ce qui ne pourra pas être fait.",
                correct: true,
            },
            {
                value: "plus-recentes",
                label: "Traiter d'abord les demandes arrivées le plus récemment.",
                correct: false,
            },
            {
                value: "repartir-egalement",
                label: "Répartir son temps équitablement entre tous les sujets ouverts.",
                correct: false,
            },
        ],
    },
    {
        name: "q07",
        required: true,
        prompt: "Vous repérez une erreur dans un livrable déjà envoyé au client. Elle est mineure et personne ne l'a signalée.",
        description: "Une seule réponse.",
        choices: [
            {
                value: "prevenir-impact",
                label: "Je préviens en précisant l'impact réel et la correction apportée.",
                correct: true,
            },
            {
                value: "corriger-silence",
                label: "Je corrige dans la prochaine version, sans alerter inutilement le client.",
                correct: false,
            },
        ],
    },
    {
        name: "q08",
        required: true,
        prompt: "Quelles situations constituent un conflit d'intérêts qu'il faut déclarer ?",
        description: "Deux réponses à cocher.",
        choices: [
            {
                value: "prestataire-proche",
                label: "Participer au choix d'un prestataire dirigé par un proche.",
                correct: true,
            },
            {
                value: "evaluer-relation",
                label: "Évaluer la performance d'une personne avec qui on a une relation personnelle.",
                correct: true,
            },
            {
                value: "recommander-officiel",
                label: "Recommander un ancien collègue via le canal de recrutement officiel.",
                correct: false,
            },
            {
                value: "jury-connaissance",
                label: "Siéger dans un jury où l'on connaît un candidat de vue.",
                correct: false,
            },
        ],
    },
    {
        name: "q09",
        required: true,
        prompt: "Un nouvel outil est imposé. Après deux semaines, vous constatez qu'il vous ralentit réellement.",
        description: "Une seule réponse.",
        choices: [
            {
                value: "documenter-remonter",
                label: "Je note les cas précis où il ralentit et je remonte ces éléments chiffrés.",
                correct: true,
            },
            {
                value: "ancien-outil-perso",
                label: "Je reprends l'ancien outil pour mes propres tâches, l'équipe garde le nouveau.",
                correct: false,
            },
        ],
    },
    {
        name: "q10",
        required: true,
        prompt: "Qu'est-ce qui rend un compte rendu de réunion exploitable une semaine plus tard ?",
        description: "Deux réponses à cocher.",
        choices: [
            {
                value: "decisions-isolables",
                label: "Les décisions sont identifiables sans relire tous les échanges.",
                correct: true,
            },
            {
                value: "responsable-echeance",
                label: "Chaque action a un responsable nommé et une échéance.",
                correct: true,
            },
            {
                value: "arguments-chacun",
                label: "Les arguments de chaque participant y sont repris.",
                correct: false,
            },
            {
                value: "validation-tous",
                label: "Il est validé par tous les participants avant diffusion.",
                correct: false,
            },
        ],
    },
    {
        name: "q11",
        required: true,
        prompt: "Une procédure de sécurité vous paraît disproportionnée et ralentit fortement l'équipe.",
        description: "Une seule réponse.",
        choices: [
            {
                value: "appliquer-demander-revision",
                label: "Je l'applique telle quelle et je demande sa révision par le canal prévu.",
                correct: true,
            },
            {
                value: "alleger-temporairement",
                label: "Je l'allège le temps de la mission, puis je propose officiellement une révision.",
                correct: false,
            },
        ],
    },
    {
        name: "q12",
        required: true,
        prompt: "Quels signes traduisent un réel engagement professionnel ?",
        description: "Deux réponses à cocher.",
        choices: [
            {
                value: "amelioration-constat",
                label: "Proposer une amélioration en l'appuyant sur un constat concret.",
                correct: true,
            },
            {
                value: "comprendre-objectifs",
                label: "Chercher à comprendre comment son travail sert les objectifs de l'équipe.",
                correct: true,
            },
            {
                value: "disponible-hors-horaires",
                label: "Se rendre disponible en dehors des horaires prévus.",
                correct: false,
            },
            {
                value: "accepter-toutes-missions",
                label: "Accepter toutes les missions qu'on vous propose.",
                correct: false,
            },
        ],
    },
    {
        name: "q13",
        required: true,
        prompt: "On vous confie une tâche supplémentaire alors que votre charge est déjà pleine.",
        description: "Une seule réponse.",
        choices: [
            {
                value: "accepter-arbitrage",
                label: "J'accepte en indiquant ce que cela décale, et je fais arbitrer les priorités.",
                correct: true,
            },
            {
                value: "accepter-sans-condition",
                label: "J'accepte sans condition : refuser donnerait une mauvaise image.",
                correct: false,
            },
        ],
    },
    {
        name: "q14",
        required: true,
        prompt: "Que recouvre l'autonomie attendue d'un professionnel confirmé ?",
        description: "Deux réponses à cocher.",
        choices: [
            {
                value: "identifier-aide",
                label: "Identifier le moment où il devient plus efficace de demander de l'aide.",
                correct: true,
            },
            {
                value: "rendre-compte",
                label: "Rendre compte de son avancement sans qu'on ait à le demander.",
                correct: true,
            },
            {
                value: "resoudre-seul",
                label: "Résoudre seul l'ensemble des blocages rencontrés.",
                correct: false,
            },
            {
                value: "priorites-sans-validation",
                label: "Fixer seul ses priorités sans les faire valider.",
                correct: false,
            },
        ],
    },
    {
        name: "q15",
        required: true,
        prompt: "À mi-parcours, vous constatez qu'une tâche prendra 50 % de temps en plus que prévu.",
        description: "Une seule réponse.",
        choices: [
            {
                value: "signaler-chiffre",
                label: "Je le signale maintenant, avec l'impact chiffré sur le planning.",
                correct: true,
            },
            {
                value: "compenser-perso",
                label: "Je compense sur mon temps personnel pour tenir l'engagement initial.",
                correct: false,
            },
        ],
    },
] as const;

export default function Survey() {
    const [score, setScore] = useState<number | null>(null);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        let total = 0;

        for (const question of items) {
            const given = formData.getAll(question.name).map(String);
            const expected = question.choices
                .filter((choice) => choice.correct)
                .map((choice) => choice.value);
            const isCorrect =
                given.length === expected.length &&
                expected.every((value) => given.includes(value));

            if (isCorrect) {
                total += 1;
            }
        }

        setScore(total);
    }

    return (
        <div>
            <HeadBar />
            <div className="flex min-h-screen items-start justify-center px-4 pt-24">
                {score === null ? (
                    <Questionnaire
                        className="w-full max-w-3xl gap-6 rounded-xl border border-input p-8"
                        items={items}
                        onSubmit={handleSubmit}
                    >
                        <QuestionnaireProgress />
                        {items.map((question) => (
                            <QuestionnaireItem
                                key={question.name}
                                multiple={question.choices.length > 2}
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
                            <QuestionnaireSubmit />
                        </QuestionnaireActions>
                    </Questionnaire>
                ) : (
                    <div className="flex w-full max-w-3xl flex-col gap-4 rounded-xl border border-input p-8">
                        <h1 className="font-heading text-xl font-medium">
                            {score >= PASSING_SCORE
                                ? "Certification obtenue"
                                : "Certification non obtenue"}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Score : {score} / {items.length} — seuil de réussite
                            à {PASSING_SCORE}.
                        </p>
                        <Button
                            className="self-start"
                            onClick={() => setScore(null)}
                            variant="outline"
                        >
                            Recommencer
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
