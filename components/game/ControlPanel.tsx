"use client";

import { useEffect, useState } from "react";
import lessonData from "@/data/classroom-game/giu-gin-do-dung.json";
import baoVoData from "@/data/classroom-game/bao-vo-than-toc.json";
import { getRemainingSeconds, type GameState } from "@/lib/game/state";
import type { GameActions } from "@/lib/game/actions";
import ScoreBoard from "@/components/game/ScoreBoard";

interface ControlPanelProps {
  state: GameState;
  actions: GameActions;
}

export default function ControlPanel({ state, actions }: ControlPanelProps) {
  const [sortingRemaining, setSortingRemaining] = useState(() => getRemainingSeconds(state.sorting));
  const [sequencingRemaining, setSequencingRemaining] = useState(() => getRemainingSeconds(state.sequencing));

  useEffect(() => {
    const interval = setInterval(() => {
      setSortingRemaining(getRemainingSeconds(state.sorting));
      setSequencingRemaining(getRemainingSeconds(state.sequencing));
    }, 250);
    return () => clearInterval(interval);
  }, [state.sorting, state.sequencing]);

  const sortingTimeUp = sortingRemaining <= 0;
  const sortingMinutes = Math.floor(sortingRemaining / 60).toString().padStart(2, "0");
  const sortingSeconds = Math.floor(sortingRemaining % 60).toString().padStart(2, "0");

  const sequencingMinutes = Math.floor(sequencingRemaining / 60).toString().padStart(2, "0");
  const sequencingSeconds = Math.floor(sequencingRemaining % 60).toString().padStart(2, "0");

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
        <button
          type="button"
          onClick={() => actions.setActiveGame("sequencing")}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${
            state.activeGame === "sequencing" ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Game 3: Bao vở
        </button>
      </div>

      <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
        {state.activeGame === "sorting" && (
          <>
            <h3 className="text-sm font-bold text-slate-600">Sắp xếp đồ dùng học tập</h3>
            <div
              className={`text-4xl font-black tabular-nums ${sortingTimeUp ? "text-rose-500" : "text-slate-800"}`}
            >
              {sortingMinutes}:{sortingSeconds}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={actions.startTimer}
                disabled={state.sorting.isRunning || sortingTimeUp}
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
        )}

        {state.activeGame === "truefalse" && (
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
            {state.trueFalse.wrongAttempt ? (
              <div className="space-y-2 rounded-xl bg-rose-50 p-3">
                <p className="text-sm font-bold text-rose-600">❌ Sai rồi! Mời đội khác trả lời.</p>
                <button
                  type="button"
                  onClick={actions.passToNextTeam}
                  className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white"
                >
                  Chọn đội khác trả lời →
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => actions.pickAnswer(true)}
                  disabled={state.trueFalse.revealed || !state.activeTeamId}
                  className={`rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-40 ${
                    state.trueFalse.teacherPick === true ? "bg-emerald-600" : "bg-emerald-400"
                  }`}
                >
                  ĐÚNG
                </button>
                <button
                  type="button"
                  onClick={() => actions.pickAnswer(false)}
                  disabled={state.trueFalse.revealed || !state.activeTeamId}
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
            )}
            {!state.activeTeamId && !state.trueFalse.wrongAttempt && (
              <p className="text-xs font-bold text-amber-600">👉 Chọn đội đang trả lời ở Bảng điểm bên dưới trước.</p>
            )}
          </>
        )}

        {state.activeGame === "sequencing" && (
          <>
            <h3 className="text-sm font-bold text-slate-600">{baoVoData.title}</h3>
            <div className="text-4xl font-black tabular-nums text-slate-800">
              {sequencingMinutes}:{sequencingSeconds}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={actions.startSequencingRound}
                className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-bold text-white"
              >
                Bắt đầu vòng chơi
              </button>
              <button
                type="button"
                onClick={actions.checkSequencing}
                disabled={!state.activeTeamId}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Kiểm tra kết quả
              </button>
              <button
                type="button"
                onClick={actions.showSequencingAnswer}
                className="rounded-xl bg-slate-500 px-4 py-2 text-sm font-bold text-white"
              >
                Xem đáp án đúng
              </button>
            </div>
            {!state.activeTeamId && (
              <p className="text-xs font-bold text-amber-600">👉 Chọn đội đang thi ở Bảng điểm bên dưới trước.</p>
            )}
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
