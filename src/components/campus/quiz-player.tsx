"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/primitives";
import { submitAttempt } from "@/data/assessments";
import { invalidate } from "@/data/use-data";
import { type AttemptResult } from "@/domain/quiz";
import { type AnswerValue, type Assessment, type Question } from "@/domain/types";
import { cn } from "@/lib/cn";

const TYPE_HINT: Partial<Record<Question["type"], string>> = {
  single: "Une seule réponse",
  multiple: "Plusieurs réponses possibles",
  true_false: "Vrai ou faux",
  verse_completion: "Complétez le verset",
  short_text: "Réponse courte",
  ordering: "Remettez dans l’ordre",
  matching: "Associez les éléments",
  reflection: "Réponse libre — corrigée par l’enseignant",
  long_text: "Réponse développée — corrigée par l’enseignant",
};

export function QuizPlayer({ uid, assessment }: { uid: string; assessment: Assessment }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() => {
    // Les questions d'ordre démarrent avec l'ordre proposé.
    const init: Record<string, AnswerValue> = {};
    for (const q of assessment.questions) if (q.type === "ordering" && q.options) init[q.id] = q.options.map((o) => o.id);
    return init;
  });
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = assessment.questions.length;
  const question = assessment.questions[step];
  const set = (id: string, value: AnswerValue) => setAnswers((a) => ({ ...a, [id]: value }));

  async function submit() {
    setPending(true);
    setError(null);
    try {
      setResult(await submitAttempt(uid, assessment, answers));
      invalidate(`assessments:${uid}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("La soumission a échoué. Vérifiez votre connexion : vos réponses sont conservées.");
    } finally {
      setPending(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="reveal rounded-md bg-forest-800 p-8 text-center text-ivory-50 shadow-lifted sm:p-12">
          <p className="eyebrow text-gold-300">Résultat</p>
          {result.on20 != null ? (
            <p className="font-display numeric mt-4 text-[5.5rem] leading-none">
              {result.on20.toFixed(1).replace(".", ",")}
              <span className="text-3xl text-ivory-50/60"> / 20</span>
            </p>
          ) : (
            <p className="font-display mt-4 text-4xl leading-tight">
              {result.score} / {result.results.filter((r) => r.earned != null).reduce((s, r) => s + r.max, 0)} points
              <span className="mt-2 block font-sans text-sm text-ivory-50/60">sur les questions corrigées automatiquement</span>
            </p>
          )}
          {result.pendingManual > 0 && <p className="mt-4 text-ivory-50/70">{result.pendingManual} réponse(s) seront corrigées par l’enseignant.</p>}
        </div>
        <ol className="mt-8 space-y-3">
          {assessment.questions.map((q, i) => {
            const r = result.results.find((x) => x.questionId === q.id);
            return (
              <li key={q.id} className="flex items-start gap-4 rounded-md bg-paper-raised p-4 ring-1 ring-line">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm", r?.correct == null ? "bg-paper-sunken text-text-muted" : r.correct ? "bg-success-100 text-forest-700" : "bg-danger-100 text-danger-600")}>
                  {r?.correct == null ? <Icon name="clock" className="size-4" /> : r.correct ? <Icon name="check" className="size-4" /> : <Icon name="close" className="size-3.5" />}
                </span>
                <span className="flex-1 text-[0.9375rem]">
                  <span className="text-xs text-text-muted">Question {i + 1}</span>
                  <span className="block">{q.prompt}</span>
                </span>
                <span className="numeric text-sm text-text-muted">
                  {r?.earned ?? "—"} / {q.points}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setStep(0);
            }}
          >
            Recommencer
          </Button>
          <Link href="/campus/evaluations" className="inline-flex h-11 items-center px-4 text-sm font-semibold text-forest-700 hover:underline">
            Retour aux évaluations
          </Link>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span className="numeric shrink-0">
          {step + 1} / {total}
        </span>
        <ProgressBar value={((step + 1) / total) * 100} tone="gold" label="Avancement du quiz" />
      </div>

      <fieldset key={question.id} className="reveal mt-8">
        <legend className="w-full">
          <span className="eyebrow text-accent">{TYPE_HINT[question.type] ?? "Question"}</span>
          <span className="font-display mt-3 block text-[clamp(1.6rem,1.2rem+1.5vw,2.2rem)] leading-tight">{question.prompt}</span>
          {question.reference && <span className="mt-2 block text-sm text-text-muted">{question.reference}</span>}
        </legend>

        <div className="mt-7">
          <QuestionInput question={question} value={answers[question.id]} onChange={(v) => set(question.id, v)} />
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="mt-6 text-sm font-medium text-danger-600">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Précédente
        </Button>
        {step < total - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} arrow>
            Suivante
          </Button>
        ) : (
          <Button variant="gold" onClick={() => void submit()} disabled={pending} arrow={!pending}>
            {pending ? "Correction…" : "Valider mes réponses"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Choice({ checked, type, label, onChange, name }: { checked: boolean; type: "radio" | "checkbox"; label: string; onChange: () => void; name: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-4 rounded-md p-4 ring-1 transition-colors", checked ? "bg-forest-800/5 ring-2 ring-forest-700" : "bg-paper-raised ring-line hover:ring-line-strong")}>
      <input type={type} name={name} checked={checked} onChange={onChange} className="size-4 accent-forest-700" />
      <span className="text-[1.0625rem]">{label}</span>
    </label>
  );
}

function QuestionInput({ question, value, onChange }: { question: Question; value: AnswerValue | undefined; onChange: (v: AnswerValue) => void }) {
  switch (question.type) {
    case "single":
    case "true_false":
      return (
        <div className={cn("grid gap-3", question.type === "true_false" && "grid-cols-2")}>
          {question.options?.map((o) => (
            <Choice key={o.id} name={question.id} type="radio" label={o.label} checked={value === o.id} onChange={() => onChange(o.id)} />
          ))}
        </div>
      );
    case "multiple": {
      const list = Array.isArray(value) ? value : [];
      return (
        <div className="grid gap-3">
          {question.options?.map((o) => (
            <Choice key={o.id} name={question.id} type="checkbox" label={o.label} checked={list.includes(o.id)} onChange={() => onChange(list.includes(o.id) ? list.filter((x) => x !== o.id) : [...list, o.id])} />
          ))}
        </div>
      );
    }
    case "short_text":
    case "verse_completion":
      return (
        <input
          aria-label="Votre réponse"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="none"
          className="w-full border-0 border-b-2 border-line-strong bg-transparent px-0 py-3 font-display text-2xl outline-none focus:border-forest-700"
          placeholder="Votre réponse…"
        />
      );
    case "ordering": {
      const order = Array.isArray(value) ? value : (question.options ?? []).map((o) => o.id);
      const move = (i: number, d: -1 | 1) => {
        const next = [...order];
        const j = i + d;
        if (j < 0 || j >= next.length) return;
        [next[i], next[j]] = [next[j]!, next[i]!];
        onChange(next);
      };
      return (
        <ol className="space-y-2">
          {order.map((id, i) => {
            const label = question.options?.find((o) => o.id === id)?.label ?? id;
            return (
              <li key={id} className="flex items-center gap-3 rounded-md bg-paper-raised p-3 pl-4 ring-1 ring-line">
                <span className="font-display numeric w-6 text-xl text-accent">{i + 1}</span>
                <span className="flex-1 text-[1.0625rem]">{label}</span>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-10 place-items-center rounded-sm ring-1 ring-line disabled:opacity-30" aria-label={`Monter ${label}`}>
                  <Icon name="chevronDown" className="size-4 rotate-180" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} className="grid size-10 place-items-center rounded-sm ring-1 ring-line disabled:opacity-30" aria-label={`Descendre ${label}`}>
                  <Icon name="chevronDown" className="size-4" />
                </button>
              </li>
            );
          })}
        </ol>
      );
    }
    case "matching": {
      const map = value && typeof value === "object" && !Array.isArray(value) ? value : {};
      return (
        <div className="space-y-3">
          {question.pairs?.left.map((l) => (
            <label key={l.id} className="grid grid-cols-1 items-center gap-2 rounded-md bg-paper-raised p-4 ring-1 ring-line sm:grid-cols-2">
              <span className="font-display text-lg">{l.label}</span>
              <select value={map[l.id] ?? ""} onChange={(e) => onChange({ ...map, [l.id]: e.target.value })} className="h-11 rounded-sm bg-paper px-3 ring-1 ring-line outline-none focus:ring-forest-700">
                <option value="">Choisir…</option>
                {question.pairs?.right.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      );
    }
    default:
      return (
        <textarea
          aria-label="Votre réponse"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="ruled w-full resize-y rounded-md bg-paper-raised p-4 text-[1rem] leading-[1.75rem] ring-1 ring-line outline-none focus:ring-forest-700"
          placeholder="Rédigez votre réponse…"
        />
      );
  }
}
