import { Pencil, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function AdminQuestionnaire() {
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
                <Button size="sm" variant="outline">
                    <Plus />
                    Ajouter une question
                </Button>
            </header>

            <section className="flex flex-col gap-4">
                <h2 className="font-heading text-base font-medium">
                    Questions
                </h2>
                <div className="rounded-xl border border-border">
                    <p className="p-8 text-center text-sm text-muted-foreground">
                        Aucune donnée chargée. Le questionnaire sera récupéré
                        depuis GET /survey.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-3 rounded-xl border border-border p-5">
                <h2 className="font-heading text-base font-medium">
                    Seuil d'obtention
                </h2>
                <p className="text-sm text-muted-foreground">
                    Pourcentage minimum de bonnes réponses pour obtenir la
                    certification.
                </p>
                <Button className="self-start" size="sm" variant="outline">
                    <Pencil />
                    Modifier
                </Button>
            </section>
        </>
    );
}
