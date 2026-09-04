import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function AdminUsers() {
    return (
        <>
            <header className="flex flex-col gap-1 border-border border-b pb-5">
                <h1 className="font-heading text-xl font-medium">Candidats</h1>
                <p className="text-sm text-muted-foreground">
                    Rechercher un candidat et consulter son résultat de
                    certification.
                </p>
            </header>

            <section className="flex flex-col gap-2">
                <Label htmlFor="user-search">Rechercher</Label>
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="user-search"
                        className="h-10 ps-8"
                        placeholder="Nom, prénom ou adresse e-mail"
                        type="search"
                    />
                </div>
            </section>

            <section className="rounded-xl border border-border">
                <p className="p-8 text-center text-sm text-muted-foreground">
                    Aucun résultat. Cette page nécessite une route GET /users
                    côté backend, qui n'existe pas encore.
                </p>
            </section>
        </>
    );
}
