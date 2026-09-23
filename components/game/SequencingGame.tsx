"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getRemainingSeconds, type SequencingState } from "@/lib/game/state";
import { playSound } from "@/lib/game/sound";
import { StepIllustration } from "@/components/game/BaoVoIllustrations";

export interface SequencingStep {
  id: string;
  order: number;
  short: string;
  text: string;
  icon: string;
  note?: string;
}

export interface SequencingGameData {
  title: string;
  instruction: string;
  timerSeconds: number;
  steps: SequencingStep[];
}

interface SequencingGameProps {
  data: SequencingGameData;
  sequencing: SequencingState;
  onCheck: () => void;
}

/** Fisher-Yates shuffle, retried until at most 1 originally-adjacent pair
 * of steps stays adjacent — otherwise the shuffled order is too easy to
 * guess from the original sequence. */
function shuffleSteps(steps: SequencingStep[]): SequencingStep[] {
  const adjacentOriginalPairs = (arr: SequencingStep[]) => {
    let count = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i + 1].order === arr[i].order + 1) count++;
    }
    return count;
  };

  let fallback = steps;
  for (let attempt = 0; attempt < 50; attempt++) {
    const arr = [...steps];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (adjacentOriginalPairs(arr) <= 1) return arr;
    fallback = arr;
  }
  return fallback;
}

export default function SequencingGame({ data, sequencing, onCheck }: SequencingGameProps) {
  const [order, setOrder] = useState<SequencingStep[]>(() => shuffleSteps(data.steps));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<Record<string, boolean> | null>(null);
  const [hintedStepIds, setHintedStepIds] = useState<Set<string>>(new Set());
  // A step's id lands here the instant it's swapped into its correct spot —
  // it locks in place (no longer swappable) and its point was already
  // awarded right then, instead of waiting for "Kiểm tra đáp án".
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [showAnswer, setShowAnswer] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(sequencing));

  const isFirstRoundRef = useRef(true);
  const lastCheckSignalRef = useRef(sequencing.checkSignal);
  const lastShowAnswerSignalRef = useRef(sequencing.showAnswerSignal);
  const timersRef = useRef<{ interval?: ReturnType<typeof setInterval>; timeout?: ReturnType<typeof setTimeout> }>(
    {}
  );

  // New round: reshuffle and clear any leftover feedback (skip on first mount,
  // the initializer above already shuffled once).
  useEffect(() => {
    if (isFirstRoundRef.current) {
      isFirstRoundRef.current = false;
      return;
    }
    setOrder(shuffleSteps(data.steps));
    setSelectedId(null);
    setCheckResult(null);
    setShowAnswer(false);
    setRevealCount(0);
    setHintedStepIds(new Set());
    setLockedIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequencing.roundId]);

  useEffect(() => {
    setRemaining(getRemainingSeconds(sequencing));
    const interval = setInterval(() => {
      setRemaining(getRemainingSeconds(sequencing));
    }, 250);
    return () => clearInterval(interval);
  }, [sequencing]);

  // Whenever the arrangement changes for any reason (a swap, or a fresh
  // shuffle at the start of a round), lock + score any card that's now in
  // its correct spot and wasn't already locked. Checking the whole array
  // here (not just the two just-swapped cards) also catches a card that
  // happens to land in its correct spot purely from the shuffle.
  useEffect(() => {
    const newlyCorrect = order.filter((step, index) => step.order === index + 1 && !lockedIds.has(step.id));
    if (newlyCorrect.length === 0) return;

    setLockedIds((prev) => {
      const next = new Set(prev);
      newlyCorrect.forEach((step) => next.add(step.id));
      return next;
    });
    playSound("correct");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  // "Kiểm tra đáp án": correct cards already locked + scored themselves the
  // instant they were placed, so this just re-flashes whichever cards are
  // still unlocked (i.e. still wrong) as a nudge — it doesn't award points.
  useEffect(() => {
    if (sequencing.checkSignal === lastCheckSignalRef.current) return;
    lastCheckSignalRef.current = sequencing.checkSignal;

    const result: Record<string, boolean> = {};
    order.forEach((step) => {
      result[step.id] = lockedIds.has(step.id);
    });
    setCheckResult(result);
    playSound(lockedIds.size === order.length ? "correct" : "wrong");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequencing.checkSignal]);

  // "Xem đáp án đúng": reveal steps 1→6 one at a time, then auto-close.
  useEffect(() => {
    if (sequencing.showAnswerSignal === lastShowAnswerSignalRef.current) return;
    lastShowAnswerSignalRef.current = sequencing.showAnswerSignal;

    const timers = timersRef.current;
    clearInterval(timers.interval);
    clearTimeout(timers.timeout);

    setShowAnswer(true);
    setRevealCount(0);
    const total = data.steps.length;
    let revealed = 0;
    timers.interval = setInterval(() => {
      revealed += 1;
      setRevealCount(revealed);
      if (revealed >= total) {
        clearInterval(timers.interval);
        timers.timeout = setTimeout(() => setShowAnswer(false), 3000);
      }
    }, 800);

    return () => {
      clearInterval(timers.interval);
      clearTimeout(timers.timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequencing.showAnswerSignal]);

  const timeUp = remaining <= 0;
  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = Math.floor(remaining % 60).toString().padStart(2, "0");
  const lockedCount = lockedIds.size;
  const sortedSteps = [...data.steps].sort((a, b) => a.order - b.order);

  function handleCardClick(stepId: string) {
    if (timeUp || lockedIds.has(stepId)) return;
    if (selectedId === null) {
      setSelectedId(stepId);
      return;
    }
    if (selectedId === stepId) {
      setSelectedId(null);
      return;
    }

    // Locking + scoring newly-correct cards is handled by the effect above,
    // which reacts to any change in `order` — this just performs the swap.
    setOrder((prev) => {
      const next = [...prev];
      const i = next.findIndex((step) => step.id === selectedId);
      const j = next.findIndex((step) => step.id === stepId);
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setSelectedId(null);
    setCheckResult(null);
  }

  function toggleHint(stepId: string) {
    setHintedStepIds((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  function handleCloseAnswer() {
    clearInterval(timersRef.current.interval);
    clearTimeout(timersRef.current.timeout);
    setShowAnswer(false);
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800">{data.title}</h2>
          <p className="text-lg font-semibold text-slate-500">{data.instruction}</p>
        </div>
        <div
          className={`rounded-3xl px-6 py-2 text-4xl font-black tabular-nums shadow-lg ${
            remaining <= 10 ? "animate-pulse bg-rose-500 text-white" : "bg-white text-slate-800"
          }`}
        >
          {minutes}:{seconds}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCheck}
          disabled={timeUp || lockedCount === order.length}
          className="rounded-2xl bg-indigo-500 px-6 py-2 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          🔍 Kiểm tra đáp án
        </button>
        <div
          className={`rounded-2xl px-6 py-2 text-2xl font-black shadow-lg transition ${
            lockedCount === order.length ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700"
          }`}
        >
          {lockedCount === order.length ? "🎉 " : ""}
          {lockedCount}/{order.length} bước đúng!
        </div>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2">
        {order.map((step, index) => {
          const isSelected = selectedId === step.id;
          const isLocked = lockedIds.has(step.id);
          const flaggedWrong = !isLocked && checkResult?.[step.id] === false;
          const isHinted = hintedStepIds.has(step.id);
          return (
            <motion.div
              key={step.id}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative"
            >
              <button
                type="button"
                onClick={() => handleCardClick(step.id)}
                disabled={timeUp || isLocked}
                title={step.text}
                className={`relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-3xl border-4 p-2 text-center shadow-xl transition disabled:cursor-not-allowed ${
                  isLocked
                    ? "border-emerald-500 bg-emerald-50"
                    : flaggedWrong
                      ? "border-rose-500 bg-rose-50"
                      : isSelected
                        ? "scale-105 border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                <span className="absolute -left-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-lg font-black text-white shadow">
                  {isLocked ? "✅" : index + 1}
                </span>
                <motion.div
                  animate={flaggedWrong ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex w-full flex-col items-center gap-1"
                >
                  <div className="h-14 w-14">
                    <StepIllustration stepId={step.id} />
                  </div>
                  <span className="text-sm font-bold text-slate-600">{step.short}</span>
                  {isHinted && !isLocked && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                      → Vị trí {step.order}
                    </span>
                  )}
                </motion.div>
              </button>
              {!isLocked && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleHint(step.id);
                  }}
                  className={`absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-lg shadow transition ${
                    isHinted ? "bg-amber-400 text-white" : "bg-amber-100 text-amber-600 hover:bg-amber-200"
                  }`}
                  aria-label={`Gợi ý cho bước "${step.text}"`}
                  title="Xem gợi ý"
                >
                  💡
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-10"
          >
            <div className="max-h-full w-full max-w-3xl space-y-3 overflow-y-auto rounded-3xl bg-white p-8">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-800">Đúng thứ tự các bước</h3>
                <button
                  type="button"
                  onClick={handleCloseAnswer}
                  className="h-9 w-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {sortedSteps.map((step, index) => (
                  <AnimatePresence key={step.id}>
                    {index < revealCount && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3"
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
                          {step.order}
                        </span>
                        <div className="h-14 w-14 flex-shrink-0">
                          <StepIllustration stepId={step.id} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{step.text}</p>
                          {step.note && <p className="text-sm font-semibold text-emerald-600">💡 {step.note}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
