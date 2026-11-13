"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Faq } from "@/types/product.types";

const MAX_FAQS = 30;

/*
 * Optional FAQ list for a category or product. Shown on the storefront page as
 * an accordion (and as FAQPage schema). Rows left blank are ignored on save.
 */
export default function FaqEditor({
  value,
  onChange,
  idPrefix = "faq",
}: {
  value: Faq[];
  onChange: (faqs: Faq[]) => void;
  idPrefix?: string;
}) {
  const update = (i: number, patch: Partial<Faq>) =>
    onChange(value.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-gray-500">
          No questions yet. Optional: answer what shoppers usually ask (warranty, compatibility,
          delivery, how to choose).
        </p>
      )}

      {value.map((faq, i) => (
        <div key={i} className="space-y-2 rounded-md border bg-gray-50/60 p-3">
          <div className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-sm font-medium text-gray-500">{i + 1}.</span>
            <Input
              id={`${idPrefix}-q-${i}`}
              value={faq.question}
              onChange={(e) => update(i, { question: e.target.value })}
              placeholder="Question, e.g. Do these earbuds work with iPhone?"
              maxLength={300}
              aria-label={`Question ${i + 1}`}
            />
            <div className="flex shrink-0">
              <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label={`Remove question ${i + 1}`}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
          <textarea
            id={`${idPrefix}-a-${i}`}
            value={faq.answer}
            onChange={(e) => update(i, { answer: e.target.value })}
            placeholder="Answer"
            maxLength={3000}
            aria-label={`Answer ${i + 1}`}
            className="ml-8 min-h-20 w-[calc(100%-2rem)] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={value.length >= MAX_FAQS}
        onClick={() => onChange([...value, { question: "", answer: "" }])}
      >
        <Plus className="mr-1 h-4 w-4" /> Add question
      </Button>
    </div>
  );
}

/** The rows worth saving: both fields filled. */
export function cleanFaqs(faqs: Faq[]): Faq[] {
  return faqs
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
    .filter((f) => f.question && f.answer);
}
