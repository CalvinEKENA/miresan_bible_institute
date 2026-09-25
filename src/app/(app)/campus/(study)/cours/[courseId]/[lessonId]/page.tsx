"use client";

import { useParams } from "next/navigation";
import { AppSplash } from "@/components/auth/require-role";
import { StudyReader } from "@/components/study/study-reader";
import { ButtonLink } from "@/components/ui/button";
import { useSessionUser } from "@/data/auth/auth-provider";
import { loadCourse } from "@/data/repositories";
import { useData } from "@/data/use-data";

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { uid } = useSessionUser();
  const { data, status } = useData(`lesson:${uid}:${lessonId}`, async (store) => {
    const [courseData, highlights] = await Promise.all([
      loadCourse(store, courseId, uid),
      store.list("highlights", { where: [["uid", "==", uid], ["lessonId", "==", lessonId]] }),
    ]);
    return { ...courseData, highlights };
  });

  if (status === "loading") return <AppSplash label="Ouverture de la leçon…" />;
  const lesson = data?.lessons.find((l) => l.id === lessonId);
  if (!data?.course || !lesson) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
        <div>
          <p className="font-display text-4xl">Leçon introuvable</p>
          <ButtonLink href="/campus/cours" className="mt-6" arrow>
            Retour à mes cours
          </ButtonLink>
        </div>
      </div>
    );
  }
  return (
    <StudyReader
      key={lesson.id}
      uid={uid}
      course={data.course}
      lesson={lesson}
      lessons={data.lessons}
      progress={data.progress.find((p) => p.lessonId === lesson.id) ?? null}
      highlights={data.highlights}
    />
  );
}
