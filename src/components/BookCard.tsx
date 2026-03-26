import Link from "next/link";
import { BookOpen } from "lucide-react";

type BookCardProps = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  genre?: string | null;
  availableCopies: number;
  totalCopies: number;
};

export default function BookCard({
  id,
  title,
  author,
  coverUrl,
  genre,
  availableCopies,
  totalCopies,
}: BookCardProps) {
  const isAvailable = availableCopies > 0;

  return (
    <Link href={`/books/${id}`} className="block group">
      <article className="glass-card overflow-hidden">
        <div className="aspect-[2/3] relative overflow-hidden bg-bg-surface">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Capa de ${title}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-bg-surface to-bg-elevated">
              <BookOpen className="h-12 w-12 text-gold-400/40" />
              <span className="text-xs text-text-muted text-center px-4 line-clamp-2">
                {title}
              </span>
            </div>
          )}

          {genre && (
            <span className="absolute top-3 left-3 badge badge-gold text-[0.65rem]">
              {genre}
            </span>
          )}

          <div
            className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full ${
              isAvailable ? "bg-success" : "bg-error"
            }`}
            style={{
              boxShadow: isAvailable
                ? "0 0 8px rgba(34,197,94,0.5)"
                : "0 0 8px rgba(239,68,68,0.5)",
            }}
          />
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-gold-300 transition-colors">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-text-muted line-clamp-1">{author}</p>
          <div className="mt-3 flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                isAvailable ? "text-success" : "text-error"
              }`}
            >
              {isAvailable ? `${availableCopies} disponível` : "Indisponível"}
            </span>
            <span className="text-xs text-text-muted">
              {totalCopies} {totalCopies === 1 ? "exemplar" : "exemplares"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
