"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getRemainingSeconds, type SortingState } from "@/lib/game/state";
import { playSound } from "@/lib/game/sound";

export interface SortingTray {
  id: string;
  label: string;
  emoji: string;
}

export interface SortingItem {
  id: string;
  label: string;
  emoji: string;
  correctTrayId: string;
}

export interface SortingGameData {
  title: string;
  instruction: string;
  timerSeconds: number;
  trays: SortingTray[];
  items: SortingItem[];
}

interface SortingGameProps {
  data: SortingGameData;
  sorting: SortingState;
}

function shuffleItems<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SortingGame({ data, sorting }: SortingGameProps) {
  const [placedByTray, setPlacedByTray] = useState<Record<string, string[]>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [hintedItemIds, setHintedItemIds] = useState<Set<string>>(new Set());
  // Starts unshuffled (deterministic) so server-render and client-hydration
  // agree — Math.random() inside a useState initializer would make them
  // produce different orders and trigger a hydration mismatch.
  const [shuffledItems, setShuffledItems] = useState<SortingItem[]>(data.items);
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(sorting));
  const dragOrigin = useRef({ x: 0, y: 0 });
  const isFirstRoundRef = useRef(true);

  // Client-only: shuffle right after mount, once hydration is safely done.
  useEffect(() => {
    setShuffledItems(shuffleItems(data.items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // New round: reset placements and reshuffle (skip on first mount, the
  // effect above already shuffled once).
  useEffect(() => {
    if (isFirstRoundRef.current) {
      isFirstRoundRef.current = false;
      return;
    }
    setPlacedByTray({});
    setDragId(null);
    setShakeId(null);
    setHintedItemIds(new Set());
    setShuffledItems(shuffleItems(data.items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting.roundId]);

  useEffect(() => {
    setRemaining(getRemainingSeconds(sorting));
    const interval = setInterval(() => {
      setRemaining(getRemainingSeconds(sorting));
    }, 250);
    return () => clearInterval(interval);
  }, [sorting]);

  const placedItemIds = new Set(Object.values(placedByTray).flat());
  const pendingItems = shuffledItems.filter((item) => !placedItemIds.has(item.id));
  const trayById = new Map(data.trays.map((tray) => [tray.id, tray]));
  const hintedTrayIds = new Set(
    pendingItems.filter((item) => hintedItemIds.has(item.id)).map((item) => item.correctTrayId)
  );

  function toggleHint(itemId: string) {
    setHintedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  const timeUp = remaining <= 0;
  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = Math.floor(remaining % 60).toString().padStart(2, "0");

  function handlePointerDown(event: PointerEvent<HTMLDivElement>, itemId: string) {
    if (timeUp) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = { x: event.clientX, y: event.clientY };
    setDragId(itemId);
    setDragOffset({ x: 0, y: 0 });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragId) return;
    setDragOffset({
      x: event.clientX - dragOrigin.current.x,
      y: event.clientY - dragOrigin.current.y,
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>, item: SortingItem) {
    if (!dragId) return;
    // The dragged card sits right under the pointer, so hide it from hit-testing
    // for a moment — otherwise elementFromPoint always finds the card itself
    // instead of the tray underneath it.
    const draggedEl = event.currentTarget;
    draggedEl.style.pointerEvents = "none";
    const target = document.elementFromPoint(event.clientX, event.clientY);
    draggedEl.style.pointerEvents = "";
    const trayEl = target?.closest<HTMLElement>("[data-tray-id]");
    const trayId = trayEl?.dataset.trayId;

    if (trayId && trayId === item.correctTrayId) {
      setPlacedByTray((prev) => ({
        ...prev,
        [trayId]: [...(prev[trayId] ?? []), item.id],
      }));
      playSound("correct");
    } else if (trayId) {
      setShakeId(item.id);
      playSound("wrong");
      setTimeout(() => setShakeId(null), 500);
    }
    setDragId(null);
    setDragOffset({ x: 0, y: 0 });
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800">{data.title}</h2>
          <p className="text-lg font-semibold text-slate-500">{data.instruction}</p>
        </div>
        <div
          className={`rounded-3xl px-6 py-2 text-4xl font-black tabular-nums shadow-lg ${
            remaining <= 10 ? "animate-pulse bg-rose-500 text-white" : "bg-white text-slate-800"
          }`}
        >
          {minutes}:{seconds}
        </div>
      </div>

      <div
        className={`grid gap-2 transition ${
          data.trays.length >= 5 ? "grid-cols-5" : data.trays.length === 3 ? "grid-cols-3" : "grid-cols-4"
        }`}
      >
        {data.trays.map((tray) => (
          <div
            key={tray.id}
            data-tray-id={tray.id}
            className={`flex min-h-[120px] flex-col items-center gap-1 rounded-3xl border-4 border-dashed p-2 transition ${
              hintedTrayIds.has(tray.id)
                ? "animate-pulse border-amber-400 bg-amber-50 ring-4 ring-amber-300"
                : "border-sky-300 bg-sky-50"
            }`}
          >
            <span className="text-4xl">{tray.emoji}</span>
            <span className="text-base font-bold text-sky-700">{tray.label}</span>
            <div className="flex flex-wrap justify-center gap-1">
              {(placedByTray[tray.id] ?? []).map((itemId) => {
                const item = data.items.find((i) => i.id === itemId);
                if (!item) return null;
                return (
                  <span key={itemId} className="text-2xl" title={item.label}>
                    {item.emoji}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex min-h-[130px] flex-wrap items-center justify-center gap-3 rounded-3xl bg-white/70 p-4">
        <AnimatePresence>
          {pendingItems.map((item) => (
            <motion.div
              key={item.id}
              onPointerDown={(event) => handlePointerDown(event, item.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => handlePointerUp(event, item)}
              animate={
                shakeId === item.id
                  ? { x: [0, -12, 12, -8, 8, 0] }
                  : dragId === item.id
                    ? { x: dragOffset.x, y: dragOffset.y, scale: 1.1 }
                    : { x: 0, y: 0, scale: 1 }
              }
              transition={
                dragId === item.id
                  ? { duration: 0 }
                  : shakeId === item.id
                    ? { duration: 0.4, ease: "easeInOut" }
                    : { type: "spring", stiffness: 300, damping: 20 }
              }
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative flex cursor-grab select-none flex-col items-center gap-0.5 rounded-2xl bg-white px-3 py-2 shadow-xl active:cursor-grabbing"
              style={{ touchAction: "none", zIndex: dragId === item.id ? 50 : 1 }}
            >
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleHint(item.id);
                }}
                className={`absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-base shadow transition ${
                  hintedItemIds.has(item.id)
                    ? "bg-amber-400 text-white"
                    : "bg-amber-100 text-amber-600 hover:bg-amber-200"
                }`}
                aria-label={`Gợi ý cho ${item.label}`}
                title="Xem gợi ý"
              >
                💡
              </button>
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-sm font-bold text-slate-700">{item.label}</span>
              {hintedItemIds.has(item.id) && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                  → {trayById.get(item.correctTrayId)?.label}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {pendingItems.length === 0 && (
          <p className="text-2xl font-black text-emerald-500">🎉 Hoàn thành rồi! 🎉</p>
        )}
      </div>
    </div>
  );
}
