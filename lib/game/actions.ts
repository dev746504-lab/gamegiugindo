import lessonData from "@/data/classroom-game/giu-gin-do-dung.json";
import { getSortingRemainingSeconds, type ActiveGame, type GameState } from "@/lib/game/state";

type Updater = (updater: (prev: GameState) => GameState) => void;

export function createGameActions(update: Updater) {
  return {
    setActiveGame(game: ActiveGame) {
      update((prev) => ({ ...prev, activeGame: game }));
    },

    selectTeam(teamId: string) {
      update((prev) => ({ ...prev, activeTeamId: teamId }));
    },

    addScore(teamId: string, delta: number) {
      update((prev) => ({
        ...prev,
        teams: prev.teams.map((team) =>
          team.id === teamId ? { ...team, score: Math.max(0, team.score + delta) } : team
        ),
      }));
    },

    resetScores() {
      update((prev) => ({ ...prev, teams: prev.teams.map((team) => ({ ...team, score: 0 })) }));
    },

    startTimer() {
      update((prev) => ({
        ...prev,
        sorting: { ...prev.sorting, isRunning: true, startedAt: Date.now() },
      }));
    },

    pauseTimer() {
      update((prev) => ({
        ...prev,
        sorting: {
          ...prev.sorting,
          isRunning: false,
          startedAt: null,
          remainingSeconds: getSortingRemainingSeconds(prev.sorting),
        },
      }));
    },

    resetSorting() {
      update((prev) => ({
        ...prev,
        sorting: {
          ...prev.sorting,
          isRunning: false,
          startedAt: null,
          remainingSeconds: prev.sorting.timerDuration,
          roundId: prev.sorting.roundId + 1,
        },
      }));
    },

    goToQuestion(delta: number) {
      update((prev) => {
        const nextIndex = Math.min(
          Math.max(prev.trueFalse.currentIndex + delta, 0),
          lessonData.trueFalseGame.questions.length - 1
        );
        return {
          ...prev,
          trueFalse: { currentIndex: nextIndex, teacherPick: null, revealed: false },
        };
      });
    },

    pickAnswer(pick: boolean) {
      update((prev) => ({
        ...prev,
        trueFalse: { ...prev.trueFalse, teacherPick: pick },
      }));
    },

    revealAnswer() {
      update((prev) => ({ ...prev, trueFalse: { ...prev.trueFalse, revealed: true } }));
    },
  };
}

export type GameActions = ReturnType<typeof createGameActions>;
