"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import lessonData from "@/data/classroom-game/giu-gin-do-dung.json";
import { useGameState } from "@/lib/game/state";
import { createGameActions } from "@/lib/game/actions";
import ScoreBoard from "@/components/game/ScoreBoard";
import SortingGame from "@/components/game/SortingGame";
import TrueFalseGame from "@/components/game/TrueFalseGame";
import ControlPanel from "@/components/game/ControlPanel";

export default function PresentPage() {
  const { state, update } = useGameState(lessonData.teams);
  const actions = createGameActions(update);
  const [showControl, setShowControl] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-200 via-amber-100 to-emerald-200 p-10">
      <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-7xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 rounded-2xl bg-white/80 p-1.5 shadow">
            <button
              type="button"
              onClick={() => actions.setActiveGame("sorting")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                state.activeGame === "sorting" ? "bg-sky-500 text-white" : "text-slate-500"
              }`}
            >
              Game 1: Sắp xếp
            </button>
            <button
              type="button"
              onClick={() => actions.setActiveGame("truefalse")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                state.activeGame === "truefalse" ? "bg-fuchsia-500 text-white" : "text-slate-500"
              }`}
            >
              Game 2: Đúng/Sai
            </button>
          </div>
          <ScoreBoard teams={state.teams} activeTeamId={state.activeTeamId} variant="present" />
        </div>

        <div className="flex-1">
          {state.activeGame === "sorting" ? (
            <SortingGame data={lessonData.sortingGame} sorting={state.sorting} />
          ) : (
            <TrueFalseGame data={lessonData.trueFalseGame} state={state.trueFalse} />
          )}
        </div>
      </div>

      {/* Nút mở bảng điều khiển ngay trên màn hình trình chiếu. */}
      <button
        type="button"
        onClick={() => setShowControl(true)}
        className="fixed bottom-4 left-4 z-20 h-12 w-12 rounded-full bg-white/70 text-xl text-slate-700 shadow-lg hover:bg-white"
        aria-label="Mở bảng điều khiển"
        title="Mở bảng điều khiển"
      >
        ⚙️
      </button>

      <AnimatePresence>
        {showControl && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowControl(false)}
              className="fixed inset-0 z-30 bg-slate-900/40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed bottom-0 left-0 top-0 z-40 w-[380px] overflow-y-auto bg-white p-4 shadow-2xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">Điều khiển</h2>
                <button
                  type="button"
                  onClick={() => setShowControl(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  aria-label="Đóng bảng điều khiển"
                >
                  ✕
                </button>
              </div>
              <ControlPanel state={state} actions={actions} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
