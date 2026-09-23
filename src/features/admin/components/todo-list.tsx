import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";

export type TodoItem = {
  key: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  isUrgent: boolean;
};

/// Points à régler, triés par urgence, chacun avec son action directe.
export function TodoList({ items }: { items: readonly TodoItem[] }) {
  return (
    <section aria-labelledby="todo-title" className="flex flex-col">
      <h2 id="todo-title" className="mb-2 font-display text-3xl text-ink">
        À régler <em className="text-muted">avant le lever de rideau</em>
      </h2>
      {items.length === 0 ? (
        <EmptyState title="Rien à régler pour l'instant.">Tout est en place, belle répétition.</EmptyState>
      ) : (
        <ol className="flex flex-col">
          {items.map((item, index) => (
            <li key={item.key} className="flex items-center gap-5 border-b border-line py-4">
              <span
                aria-hidden="true"
                className={`w-7 shrink-0 font-display text-4xl italic leading-none ${item.isUrgent ? "text-danger" : "text-accent"}`}
              >
                {index + 1}
              </span>
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-[15px] font-semibold text-ink">{item.title}</p>
                <p className="text-sm text-subtle">{item.detail}</p>
              </div>
              <Link
                href={item.href}
                className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-line-strong px-4 text-sm text-ink transition hover:bg-raised"
              >
                {item.cta}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
