"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { QuizPlayer } from "@/components/campus/quiz-player";
import { Icon } from "@/components/ui/icons";
import { EmptyState, Skeleton } from "@/components/ui/primitives";
import { useSessionUser } from "@/data/auth/auth-provider";
import { useData } from "@/data/use-data";

export default function AssessmentPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { uid } = useSessionUser();
  const { data, status } = useData(`assessment:${assessmentId}`, async (store) => {
    const assessment = await store.get("assessments", assessmentId);
    const course = assessment ? await store.get("courses", assessment.courseId) : null;
    return { assessment, course };
  });

  if (status !== "ready") return <Skeleton className="mx-auto h-80 max-w-2xl" />;
  if (!data?.assessment) return <EmptyState title="Évaluation introuvable" />;

  return (
    <div>
      <div className="mx-auto mb-8 max-w-2xl">
        <Link href="/campus/evaluations" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
          <Icon name="arrowLeft" className="size-4" /> Évaluations
        </Link>
        <p className="eyebrow mt-6 text-accent">{data.course?.title}</p>
        <h1 className="font-display mt-2 text-4xl">{data.assessment.title}</h1>
        <p className="mt-2 text-text-muted">{data.assessment.description}</p>
      </div>
      <QuizPlayer uid={uid} assessment={data.assessment} />
    </div>
  );
}
