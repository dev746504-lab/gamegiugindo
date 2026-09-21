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
          trueFalse: { currentIndex: nextIndex, teacherPick: null, revealed: false, wrongAttempt: false },
        };
      });
    },

    pickAnswer(pick: boolean) {
      update((prev) => ({
        ...prev,
        trueFalse: { ...prev.trueFalse, teacherPick: pick },
      }));
    },

    // Correct: award the active team exactly 1 point and reveal the explanation.
    // Wrong: don't reveal anything yet — just flag it so the UI can offer the
    // question to a different team instead of spoiling the answer.
    revealAnswer() {
      update((prev) => {
        const question = lessonData.trueFalseGame.questions[prev.trueFalse.currentIndex];
        if (!question || prev.trueFalse.teacherPick === null) return prev;
        const isCorrect = prev.trueFalse.teacherPick === question.answer;

        if (isCorrect) {
          return {
            ...prev,
            teams: prev.activeTeamId
              ? prev.teams.map((team) =>
                  team.id === prev.activeTeamId ? { ...team, score: team.score + 1 } : team
                )
              : prev.teams,
            trueFalse: { ...prev.trueFalse, revealed: true, wrongAttempt: false },
          };
        }

        return {
          ...prev,
          trueFalse: { ...prev.trueFalse, wrongAttempt: true },
        };
      });
    },

    // After a wrong attempt: clear the pick and the active team so the
    // teacher has to choose a different team to try the same question.
    passToNextTeam() {
      update((prev) => ({
        ...prev,
        activeTeamId: null,
        trueFalse: { ...prev.trueFalse, teacherPick: null, wrongAttempt: false },
      }));
    },
  };
}

export type GameActions = ReturnType<typeof createGameActions>;
