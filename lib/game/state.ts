"use client";

import { useCallback, useState } from "react";

export type ActiveGame = "sorting" | "truefalse" | "sequencing";

export interface Team {
  id: string;
  name: string;
  score: number;
}

/** Shared shape for any game's countdown clock. */
export interface CountdownTimer {
  timerDuration: number;
  remainingSeconds: number;
  startedAt: number | null;
  isRunning: boolean;
}

export interface SortingState extends CountdownTimer {
  roundId: number;
}

export interface TrueFalseState {
  currentIndex: number;
  teacherPick: boolean | null;
  revealed: boolean;
  wrongAttempt: boolean;
}

export interface SequencingState extends CountdownTimer {
  roundId: number;
  // Incrementing "signal" counters: bumping them (even to the same effective
  // state) tells the present screen to re-run that one-shot action, the same
  // way roundId tells SortingGame to reshuffle.
  checkSignal: number;
  showAnswerSignal: number;
}

export interface GameState {
  activeGame: ActiveGame;
  activeTeamId: string | null;
  teams: Team[];
  sorting: SortingState;
  trueFalse: TrueFalseState;
  sequencing: SequencingState;
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
      timerDuration: 600,
      remainingSeconds: 600,
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
    sequencing: {
      timerDuration: 45,
      remainingSeconds: 45,
      startedAt: null,
      isRunning: false,
      roundId: 0,
      checkSignal: 0,
      showAnswerSignal: 0,
    },
  };
}

export function getRemainingSeconds(timer: CountdownTimer, now = Date.now()): number {
  if (!timer.isRunning || timer.startedAt === null) {
    return timer.remainingSeconds;
  }
  const elapsed = Math.floor((now - timer.startedAt) / 1000);
  return Math.max(0, timer.remainingSeconds - elapsed);
}

/** One screen, one browser tab: game state just lives in React state. */
export function useGameState(teamNames: string[]) {
  const [state, setState] = useState<GameState>(() => createInitialState(teamNames));

  const update = useCallback((updater: (prev: GameState) => GameState) => {
    setState(updater);
  }, []);

  return { state, update };
}
