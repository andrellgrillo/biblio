"use client";

import { useActionState, useState } from "react";
import { createBook, deleteBook, addCopy, removeCopy, type BookFormState } from "@/actions/books";
import {
  Plus,
  Trash2,
  BookCopy,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string | null;
  publishedYear: number | null;
  copies: { id: string; code: string; status: string; condition: string }[];
};

export function CreateBookForm() {
  const [state, formAction, pending] = useActionState<BookFormState, FormData>(
    createBook,
    undefined
  );
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" />
        Novo Livro
      </button>
    );
  }

  return (
    <div className="glass-card p-6 mb-6 !transform-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cadastrar Novo Livro</h3>
        <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">
          <X className="h-5 w-5" />
        </button>
      </div>

      {state?.message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            state.success
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-error/10 border border-error/20 text-error"
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">
              Título *
            </label>
            <input id="title" name="title" required className="input-field" placeholder="Ex: Dom Casmurro" />
            {state?.errors?.title && <p className="mt-1 text-xs text-error">{state.errors.title[0]}</p>}
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-text-secondary mb-1">
              Autor *
            </label>
            <input id="author" name="author" required className="input-field" placeholder="Ex: Machado de Assis" />
            {state?.errors?.author && <p className="mt-1 text-xs text-error">{state.errors.author[0]}</p>}
          </div>
          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-text-secondary mb-1">
              ISBN *
            </label>
            <input id="isbn" name="isbn" required className="input-field" placeholder="Ex: 978-85-359-0277-1" />
            {state?.errors?.isbn && <p className="mt-1 text-xs text-error">{state.errors.isbn[0]}</p>}
          </div>
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-text-secondary mb-1">
              Gênero
            </label>
            <input id="genre" name="genre" className="input-field" placeholder="Ex: Romance" />
          </div>
          <div>
            <label htmlFor="publishedYear" className="block text-sm font-medium text-text-secondary mb-1">
              Ano de Publicação
            </label>
            <input id="publishedYear" name="publishedYear" type="number" className="input-field" placeholder="Ex: 1899" />
          </div>
          <div>
            <label htmlFor="coverUrl" className="block text-sm font-medium text-text-secondary mb-1">
              URL da Capa
            </label>
            <input id="coverUrl" name="coverUrl" type="url" className="input-field" placeholder="https://..." />
          </div>
        </div>
        <div>
          <label htmlFor="synopsis" className="block text-sm font-medium text-text-secondary mb-1">
            Sinopse
          </label>
          <textarea
            id="synopsis"
            name="synopsis"
            rows={3}
            className="input-field resize-none"
            placeholder="Breve descrição do livro..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Salvando..." : "Cadastrar Livro"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function BookList({ books }: { books: Book[] }) {
  const [search, setSearch] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const filtered = books.filter((b) => {
    const s = search.toLowerCase();
    const cleanSearch = search.replace(/-/g, "");
    return (
      b.title.toLowerCase().includes(s) ||
      b.author.toLowerCase().includes(s) ||
      b.isbn.replace(/-/g, "").includes(cleanSearch)
    );
  });

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={search}
          autoFocus
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered.length === 1) {
              e.preventDefault();
              setExpandedBook(filtered[0].id);
            }
          }}
          placeholder="Busque ou bipe o código de barras (ISBN)..."
          className="input-field !pl-10"
          title="Pronto para leitura com Scanner de Código de Barras"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center !transform-none">
          <BookCopy className="mx-auto h-12 w-12 text-text-muted/30 mb-3" />
          <p className="text-text-muted">
            {search ? "Nenhum livro encontrado para este código/termo." : "Nenhum livro cadastrado"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((book) => (
            <div key={book.id} className="glass-card overflow-hidden !transform-none">
              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {book.title}
                    </h3>
                    {book.genre && (
                      <span className="badge badge-gold text-[0.6rem] shrink-0">{book.genre}</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {book.author} · ISBN: {book.isbn}
                    {book.publishedYear && ` · ${book.publishedYear}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="badge badge-info text-[0.6rem]">
                    {book.copies.length} exempl.
                  </span>
                  <button
                    onClick={() =>
                      setExpandedBook(expandedBook === book.id ? null : book.id)
                    }
                    className="btn-secondary !py-1.5 !px-2.5 text-xs"
                  >
                    <Package className="h-3.5 w-3.5" />
                    {expandedBook === book.id ? "Fechar" : "Exemplares"}
                  </button>
                  <form
                    action={async () => {
                      if (confirm(`Excluir "${book.title}" e todos os seus exemplares?`)) {
                        await deleteBook(book.id);
                      }
                    }}
                  >
                    <button type="submit" className="btn-danger !py-1.5 !px-2.5 text-xs">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>

              {expandedBook === book.id && (
                <CopyManager bookId={book.id} copies={book.copies} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CopyManager({
  bookId,
  copies,
}: {
  bookId: string;
  copies: { id: string; code: string; status: string; condition: string }[];
}) {
  const [code, setCode] = useState("");
  const [condition, setCondition] = useState("NEW");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleAdd = async () => {
    const result = await addCopy(bookId, code, condition);
    if (result?.error) {
      setMsg({ text: result.error, type: "error" });
    } else {
      setMsg({ text: "Exemplar adicionado!", type: "success" });
      setCode("");
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const statusLabel: Record<string, string> = {
    AVAILABLE: "Disponível",
    BORROWED: "Emprestado",
    DAMAGED: "Danificado",
    LOST: "Perdido",
  };

  const statusBadge: Record<string, string> = {
    AVAILABLE: "badge-success",
    BORROWED: "badge-info",
    DAMAGED: "badge-warning",
    LOST: "badge-error",
  };

  return (
    <div className="border-t border-border-subtle p-4 bg-bg-base/50">
      <div className="flex items-end gap-2 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-text-muted mb-1">Código do Exemplar</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex: BIB-001"
            className="input-field text-sm"
          />
        </div>
        <div className="w-32">
          <label className="block text-xs text-text-muted mb-1">Condição</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="input-field text-sm"
          >
            <option value="NEW">Novo</option>
            <option value="GOOD">Bom</option>
            <option value="WORN">Usado</option>
            <option value="DAMAGED">Danificado</option>
          </select>
        </div>
        <button onClick={handleAdd} className="btn-primary !py-2 text-sm">
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      {msg && (
        <p className={`text-xs mb-3 ${msg.type === "success" ? "text-success" : "text-error"}`}>
          {msg.text}
        </p>
      )}

      {copies.length > 0 ? (
        <div className="space-y-2">
          {copies.map((copy) => (
            <div
              key={copy.id}
              className="flex items-center justify-between rounded-lg bg-bg-surface p-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-text-primary">{copy.code}</span>
                <span className={`badge text-[0.6rem] ${statusBadge[copy.status]}`}>
                  {statusLabel[copy.status]}
                </span>
              </div>
              <form
                action={async () => {
                  if (copy.status === "BORROWED") {
                    alert("Não é possível remover um exemplar emprestado.");
                    return;
                  }
                  await removeCopy(copy.id);
                }}
              >
                <button
                  type="submit"
                  className="text-text-muted hover:text-error transition-colors p-1"
                  title="Remover exemplar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted text-center py-4">
          Nenhum exemplar cadastrado para este livro
        </p>
      )}
    </div>
  );
}
