import lessonData from "@/data/classroom-game/giu-gin-do-dung.json";
import { getRemainingSeconds, type ActiveGame, type GameState } from "@/lib/game/state";

type Updater = (updater: (prev: GameState) => GameState) => void;

export function createGameActions(update: Updater) {
  return {
    setActiveGame(game: ActiveGame) {
      update((prev) => ({ ...prev, activeGame: game }));
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
          remainingSeconds: getRemainingSeconds(prev.sorting),
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

    // Reveal the correct answer + explanation, whether the pick was right or
    // wrong — the UI decides how to show that based on comparing teacherPick
    // to the question's actual answer.
    revealAnswer() {
      update((prev) => ({ ...prev, trueFalse: { ...prev.trueFalse, revealed: true } }));
    },

    // Bumping roundId tells SequencingGame to reshuffle and clear any prior
    // check result, same pattern as resetSorting.
    startSequencingRound() {
      update((prev) => ({
        ...prev,
        sequencing: {
          ...prev.sequencing,
          isRunning: true,
          startedAt: Date.now(),
          remainingSeconds: prev.sequencing.timerDuration,
          roundId: prev.sequencing.roundId + 1,
        },
      }));
    },

    // Bumping checkSignal / showAnswerSignal tells SequencingGame to run that
    // one-shot action, even if pressed twice in a row.
    checkSequencing() {
      update((prev) => ({
        ...prev,
        sequencing: { ...prev.sequencing, checkSignal: prev.sequencing.checkSignal + 1 },
      }));
    },

    showSequencingAnswer() {
      update((prev) => ({
        ...prev,
        sequencing: { ...prev.sequencing, showAnswerSignal: prev.sequencing.showAnswerSignal + 1 },
      }));
    },
  };
}

export type GameActions = ReturnType<typeof createGameActions>;
