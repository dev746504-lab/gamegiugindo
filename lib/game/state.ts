"use client";

import { useCallback, useState } from "react";

export type ActiveGame = "sorting" | "truefalse";

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface SortingState {
  timerDuration: number;
  remainingSeconds: number;
  startedAt: number | null;
  isRunning: boolean;
  roundId: number;
}

export interface TrueFalseState {
  currentIndex: number;
  teacherPick: boolean | null;
  revealed: boolean;
  wrongAttempt: boolean;
}

export interface GameState {
  activeGame: ActiveGame;
  activeTeamId: string | null;
  teams: Team[];
  sorting: SortingState;
  trueFalse: TrueFalseState;
}

export function createInitialState(teamNames: string[]): GameState {
  return {
    activeGame: "sorting",
    activeTeamId: null,
    teams: teamNames.map((name, index) => ({
      id: `team-${index + 1}`,
      name,
      score: 0,
    })),
    sorting: {
      timerDuration: 120,
      remainingSeconds: 120,
      startedAt: null,
      isRunning: false,
      roundId: 0,
    },
    trueFalse: {
      currentIndex: 0,
      teacherPick: null,
      revealed: false,
      wrongAttempt: false,
    },
  };
}

export function getSortingRemainingSeconds(sorting: SortingState, now = Date.now()): number {
  if (!sorting.isRunning || sorting.startedAt === null) {
    return sorting.remainingSeconds;
  }
  const elapsed = Math.floor((now - sorting.startedAt) / 1000);
  return Math.max(0, sorting.remainingSeconds - elapsed);
}

/** One screen, one browser tab: game state just lives in React state. */
export function useGameState(teamNames: string[]) {
  const [state, setState] = useState<GameState>(() => createInitialState(teamNames));

  const update = useCallback((updater: (prev: GameState) => GameState) => {
    setState(updater);
  }, []);

  return { state, update };
}
