"use client";

import { useEffect, useState } from "react";
import lessonData from "@/data/classroom-game/giu-gin-do-dung.json";
import { getSortingRemainingSeconds, type GameState } from "@/lib/game/state";
import type { GameActions } from "@/lib/game/actions";
import ScoreBoard from "@/components/game/ScoreBoard";

interface ControlPanelProps {
  state: GameState;
  actions: GameActions;
}

export default function ControlPanel({ state, actions }: ControlPanelProps) {
  const [remaining, setRemaining] = useState(() => getSortingRemainingSeconds(state.sorting));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getSortingRemainingSeconds(state.sorting));
    }, 250);
    return () => clearInterval(interval);
  }, [state.sorting]);

  const timeUp = remaining <= 0;
  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = Math.floor(remaining % 60).toString().padStart(2, "0");
  const currentQuestion = lessonData.trueFalseGame.questions[state.trueFalse.currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => actions.setActiveGame("sorting")}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${
            state.activeGame === "sorting" ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Game 1: Sắp xếp
        </button>
        <button
          type="button"
          onClick={() => actions.setActiveGame("truefalse")}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${
            state.activeGame === "truefalse" ? "bg-fuchsia-500 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Game 2: Đúng/Sai
        </button>
      </div>

      <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
        {state.activeGame === "sorting" ? (
          <>
            <h3 className="text-sm font-bold text-slate-600">Sắp xếp đồ dùng học tập</h3>
            <div className={`text-4xl font-black tabular-nums ${timeUp ? "text-rose-500" : "text-slate-800"}`}>
              {minutes}:{seconds}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={actions.startTimer}
                disabled={state.sorting.isRunning || timeUp}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Bắt đầu
              </button>
              <button
                type="button"
                onClick={actions.pauseTimer}
                disabled={!state.sorting.isRunning}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Dừng
              </button>
              <button
                type="button"
                onClick={actions.resetSorting}
                className="rounded-xl bg-slate-500 px-4 py-2 text-sm font-bold text-white"
              >
                Chơi lại
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-bold text-slate-600">
              Câu {state.trueFalse.currentIndex + 1} / {lessonData.trueFalseGame.questions.length}
            </h3>
            <p className="text-sm font-semibold text-slate-800">{currentQuestion?.text}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => actions.goToQuestion(-1)}
                disabled={state.trueFalse.currentIndex === 0}
                className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40"
              >
                ← Trước
              </button>
              <button
                type="button"
                onClick={() => actions.goToQuestion(1)}
                disabled={state.trueFalse.currentIndex === lessonData.trueFalseGame.questions.length - 1}
                className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40"
              >
                Sau →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => actions.pickAnswer(true)}
                disabled={state.trueFalse.revealed}
                className={`rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-40 ${
                  state.trueFalse.teacherPick === true ? "bg-emerald-600" : "bg-emerald-400"
                }`}
              >
                ĐÚNG
              </button>
              <button
                type="button"
                onClick={() => actions.pickAnswer(false)}
                disabled={state.trueFalse.revealed}
                className={`rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-40 ${
                  state.trueFalse.teacherPick === false ? "bg-rose-600" : "bg-rose-400"
                }`}
              >
                SAI
              </button>
              <button
                type="button"
                onClick={actions.revealAnswer}
                disabled={state.trueFalse.teacherPick === null || state.trueFalse.revealed}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Chốt đáp án
              </button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-600">Bảng điểm</h3>
          <button
            type="button"
            onClick={actions.resetScores}
            className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600"
          >
            Đặt lại điểm
          </button>
        </div>
        <ScoreBoard
          teams={state.teams}
          activeTeamId={state.activeTeamId}
          variant="control"
          onSelectTeam={actions.selectTeam}
          onAddScore={actions.addScore}
        />
      </div>
    </div>
  );
}
