"use client";

import { Monogram } from "@/components/brand/brand";
import { PageHeader } from "@/components/campus/page-header";
import { Skeleton } from "@/components/ui/primitives";
import { useSessionUser } from "@/data/auth/auth-provider";
import { useData } from "@/data/use-data";
import { formatDate, initials } from "@/domain/format";
import { cn } from "@/lib/cn";

export default function MessagesPage() {
  const { uid } = useSessionUser();
  const { data, status } = useData(`threads:${uid}`, async (store) => {
    const threads = await store.list("threads", { where: [["participantIds", "array-contains", uid]], orderBy: ["lastAt", "desc"] });
    const people = await store.list("users", { where: [["role", "!=", "student"]] }).catch(() => []);
    return { threads, people };
  });
  if (status !== "ready" || !data) return <Skeleton className="h-80" />;

  return (
    <div className="mx-auto max-w-(--container-content)">
      <PageHeader eyebrow="Correspondance" title="Messages">
        Échanges avec vos enseignants et le secrétariat académique.
      </PageHeader>
      <ul className="divide-y divide-line overflow-hidden rounded-md bg-paper-raised shadow-paper ring-1 ring-line">
        {data.threads.map((t) => {
          const otherId = t.participantIds.find((p) => p !== uid);
          const other = data.people.find((p) => p.uid === otherId);
          const unread = t.unreadFor.includes(uid);
          return (
            <li key={t.id} className="flex items-start gap-4 p-5">
              <Monogram initials={initials(other?.displayName ?? "IB")} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cn("truncate", unread ? "font-semibold" : "text-text-soft")}>{other?.displayName ?? "Secrétariat académique"}</p>
                  <p className="numeric shrink-0 text-xs text-text-muted">{formatDate(t.lastAt, { day: "numeric", month: "short" })}</p>
                </div>
                <p className="font-display mt-0.5 text-lg leading-snug">{t.subject}</p>
                <p className="mt-0.5 truncate text-sm text-text-muted">{t.lastMessage}</p>
              </div>
              {unread && <span aria-label="Non lu" className="mt-2 size-2 shrink-0 rounded-full bg-gold-600" />}
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm text-text-muted">La rédaction de nouveaux messages sera ouverte avec la messagerie temps réel.</p>
    </div>
  );
}
