import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type PagerProps = {
    /** Page courante, indexée à partir de 1. */
    page: number;
    /** Faux quand on sait qu'il n'y a rien après la page courante. */
    hasNext: boolean;
    onPageChange: (page: number) => void;
    /** Omis quand le total est inconnu (pagination côté serveur sans compteur). */
    totalPages?: number;
    disabled?: boolean;
    className?: string;
};

export function Pager({
    page,
    hasNext,
    onPageChange,
    totalPages,
    disabled = false,
    className,
}: PagerProps) {
    return (
        <nav
            aria-label="Pagination"
            className={cn("flex items-center justify-between gap-3", className)}
        >
            <Button
                disabled={disabled || page <= 1}
                onClick={() => onPageChange(page - 1)}
                size="sm"
                variant="outline"
            >
                <ChevronLeft data-icon="inline-start" />
                Précédent
            </Button>

            <p className="text-xs text-muted-foreground tabular-nums">
                Page {page}
                {totalPages === undefined ? "" : ` sur ${totalPages}`}
            </p>

            <Button
                disabled={disabled || !hasNext}
                onClick={() => onPageChange(page + 1)}
                size="sm"
                variant="outline"
            >
                Suivant
                <ChevronRight data-icon="inline-end" />
            </Button>
        </nav>
    );
}
