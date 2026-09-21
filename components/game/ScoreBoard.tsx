"use client";

import { motion } from "framer-motion";
import type { Team } from "@/lib/game/state";

export const TEAM_COLORS = [
  "from-rose-400 to-rose-500",
  "from-sky-400 to-sky-500",
  "from-amber-400 to-amber-500",
  "from-emerald-400 to-emerald-500",
  "from-violet-400 to-violet-500",
];

interface ScoreBoardProps {
  teams: Team[];
  activeTeamId?: string | null;
  variant?: "present" | "control";
  onSelectTeam?: (teamId: string) => void;
  onAddScore?: (teamId: string, delta: number) => void;
}

export default function ScoreBoard({
  teams,
  activeTeamId,
  variant = "present",
  onSelectTeam,
  onAddScore,
}: ScoreBoardProps) {
  if (variant === "control") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {teams.map((team, index) => {
          const isActive = team.id === activeTeamId;
          return (
            <div
              key={team.id}
              className={`rounded-2xl border-2 p-3 transition ${
                isActive ? "border-fuchsia-500 bg-fuchsia-50" : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectTeam?.(team.id)}
                className={`mb-2 w-full rounded-xl bg-gradient-to-br ${TEAM_COLORS[index % TEAM_COLORS.length]} px-3 py-2 text-left font-bold text-white shadow`}
              >
                {team.name}
              </button>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-slate-700">{team.score}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onAddScore?.(team.id, -1)}
                    className="h-9 w-9 rounded-full bg-slate-200 text-lg font-bold text-slate-700 hover:bg-slate-300"
                    aria-label={`Trừ điểm ${team.name}`}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddScore?.(team.id, 1)}
                    className="h-9 w-9 rounded-full bg-emerald-400 text-lg font-bold text-white hover:bg-emerald-500"
                    aria-label={`Cộng điểm ${team.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-3 rounded-3xl bg-white/90 p-3 shadow-xl backdrop-blur">
      {teams.map((team, index) => {
        const isActive = team.id === activeTeamId;
        return (
          <motion.button
            key={team.id}
            type="button"
            onClick={() => onSelectTeam?.(team.id)}
            animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
            className={`flex min-w-[110px] flex-col items-center rounded-2xl bg-gradient-to-br ${TEAM_COLORS[index % TEAM_COLORS.length]} px-4 py-2 text-white shadow-lg transition hover:brightness-110 ${
              isActive ? "ring-4 ring-yellow-300" : ""
            }`}
          >
            <span className="text-sm font-bold">{team.name}</span>
            <span className="text-3xl font-black">{team.score}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
