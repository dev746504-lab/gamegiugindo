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
  activeTeamId: string | null;
  onPick: (pick: boolean) => void;
  onReveal: () => void;
  onPassTurn: () => void;
}

export default function TrueFalseGame({
  data,
  state,
  activeTeamId,
  onPick,
  onReveal,
  onPassTurn,
}: TrueFalseGameProps) {
  const question = data.questions[state.currentIndex];
  const wasRevealed = useRef(false);
  const wasWrongAttempt = useRef(false);

  useEffect(() => {
    if (state.revealed && !wasRevealed.current) {
      playSound("correct");
    }
    wasRevealed.current = state.revealed;
  }, [state.revealed]);

  useEffect(() => {
    if (state.wrongAttempt && !wasWrongAttempt.current) {
      playSound("wrong");
    }
    wasWrongAttempt.current = state.wrongAttempt;
  }, [state.wrongAttempt]);

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

        {state.wrongAttempt ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 rounded-3xl bg-rose-500 px-8 py-6 text-white shadow-xl"
          >
            <p className="text-3xl font-black">❌ Sai rồi! Mời đội khác trả lời câu này.</p>
            <button
              type="button"
              onClick={onPassTurn}
              className="rounded-2xl bg-white px-6 py-3 text-lg font-bold text-rose-600 shadow transition hover:bg-rose-50"
            >
              Chọn đội khác trả lời →
            </button>
          </motion.div>
        ) : (
          <>
            {!activeTeamId && (
              <div className="rounded-2xl bg-amber-100 px-6 py-3 text-xl font-bold text-amber-700 shadow">
                👉 Hãy bấm chọn đội đang trả lời ở bảng điểm góc trên bên phải trước nhé!
              </div>
            )}

            <div className={`flex gap-8 transition ${!activeTeamId ? "pointer-events-none opacity-50" : ""}`}>
              <button
                type="button"
                onClick={() => onPick(true)}
                disabled={state.revealed || !activeTeamId}
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
                disabled={state.revealed || !activeTeamId}
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
          </>
        )}

        <AnimatePresence>
          {state.revealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl bg-emerald-500 p-6 text-white shadow-xl"
            >
              <p className="text-3xl font-black">🎉 Chính xác! +1 điểm</p>
              <p className="mt-2 text-xl font-semibold">{question.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
