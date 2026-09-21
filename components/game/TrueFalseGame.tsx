"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TrueFalseState } from "@/lib/game/state";
import { playSound } from "@/lib/game/sound";

export interface TrueFalseQuestion {
  id: string;
  text: string;
  emoji: string;
  answer: boolean;
  explanation: string;
}

export interface TrueFalseGameData {
  title: string;
  instruction: string;
  questions: TrueFalseQuestion[];
}

interface TrueFalseGameProps {
  data: TrueFalseGameData;
  state: TrueFalseState;
  onPick: (pick: boolean) => void;
  onReveal: () => void;
}

export default function TrueFalseGame({ data, state, onPick, onReveal }: TrueFalseGameProps) {
  const question = data.questions[state.currentIndex];
  const wasRevealed = useRef(false);

  useEffect(() => {
    if (state.revealed && !wasRevealed.current) {
      const isCorrect = state.teacherPick === question?.answer;
      playSound(isCorrect ? "correct" : "wrong");
    }
    wasRevealed.current = state.revealed;
  }, [state.revealed, state.teacherPick, question?.answer]);

  if (!question) return null;

  return (
    <div className="flex h-full flex-col gap-8">
      <div>
        <h2 className="text-4xl font-black text-slate-800">{data.title}</h2>
        <p className="text-xl font-semibold text-slate-500">{data.instruction}</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 rounded-3xl bg-white/80 p-10 text-center shadow-xl">
        <span className="text-sm font-bold uppercase tracking-widest text-slate-400">
          Câu {state.currentIndex + 1} / {data.questions.length}
        </span>
        <span className="text-7xl">{question.emoji}</span>
        <p className="max-w-3xl text-4xl font-extrabold leading-snug text-slate-800">{question.text}</p>

        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => onPick(true)}
            disabled={state.revealed}
            className={`flex h-32 w-56 items-center justify-center rounded-3xl text-4xl font-black shadow-lg transition disabled:cursor-not-allowed ${
              state.teacherPick === true
                ? "scale-110 bg-emerald-500 text-white"
                : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
            }`}
          >
            ĐÚNG
          </button>
          <button
            type="button"
            onClick={() => onPick(false)}
            disabled={state.revealed}
            className={`flex h-32 w-56 items-center justify-center rounded-3xl text-4xl font-black shadow-lg transition disabled:cursor-not-allowed ${
              state.teacherPick === false
                ? "scale-110 bg-rose-500 text-white"
                : "bg-rose-100 text-rose-600 hover:bg-rose-200"
            }`}
          >
            SAI
          </button>
        </div>

        {state.teacherPick !== null && !state.revealed && (
          <button
            type="button"
            onClick={onReveal}
            className="rounded-2xl bg-indigo-500 px-8 py-3 text-xl font-bold text-white shadow-lg transition hover:bg-indigo-600"
          >
            Chốt đáp án
          </button>
        )}

        <AnimatePresence>
          {state.revealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`w-full max-w-2xl rounded-3xl p-6 text-white shadow-xl ${
                question.answer ? "bg-emerald-500" : "bg-rose-500"
              }`}
            >
              <p className="text-3xl font-black">
                Đáp án đúng: {question.answer ? "ĐÚNG" : "SAI"}
              </p>
              <p className="mt-2 text-xl font-semibold">{question.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
