"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSortingRemainingSeconds, type SortingState } from "@/lib/game/state";
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

export default function SortingGame({ data, sorting }: SortingGameProps) {
  const [placedByTray, setPlacedByTray] = useState<Record<string, string[]>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(() => getSortingRemainingSeconds(sorting));
  const dragOrigin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPlacedByTray({});
    setDragId(null);
    setShakeId(null);
  }, [sorting.roundId]);

  useEffect(() => {
    setRemaining(getSortingRemainingSeconds(sorting));
    const interval = setInterval(() => {
      setRemaining(getSortingRemainingSeconds(sorting));
    }, 250);
    return () => clearInterval(interval);
  }, [sorting]);

  const placedItemIds = new Set(Object.values(placedByTray).flat());
  const pendingItems = data.items.filter((item) => !placedItemIds.has(item.id));

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
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-800">{data.title}</h2>
          <p className="text-xl font-semibold text-slate-500">{data.instruction}</p>
        </div>
        <div
          className={`rounded-3xl px-8 py-3 text-5xl font-black tabular-nums shadow-lg ${
            remaining <= 10 ? "animate-pulse bg-rose-500 text-white" : "bg-white text-slate-800"
          }`}
        >
          {minutes}:{seconds}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {data.trays.map((tray) => (
          <div
            key={tray.id}
            data-tray-id={tray.id}
            className="flex min-h-[160px] flex-col items-center gap-2 rounded-3xl border-4 border-dashed border-sky-300 bg-sky-50 p-3"
          >
            <span className="text-5xl">{tray.emoji}</span>
            <span className="text-lg font-bold text-sky-700">{tray.label}</span>
            <div className="flex flex-wrap justify-center gap-1">
              {(placedByTray[tray.id] ?? []).map((itemId) => {
                const item = data.items.find((i) => i.id === itemId);
                if (!item) return null;
                return (
                  <span key={itemId} className="text-3xl" title={item.label}>
                    {item.emoji}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex min-h-[160px] flex-wrap items-center justify-center gap-6 rounded-3xl bg-white/70 p-6">
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
              className="flex cursor-grab select-none flex-col items-center gap-1 rounded-2xl bg-white px-5 py-4 shadow-xl active:cursor-grabbing"
              style={{ touchAction: "none", zIndex: dragId === item.id ? 50 : 1 }}
            >
              <span className="text-5xl">{item.emoji}</span>
              <span className="text-lg font-bold text-slate-700">{item.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {pendingItems.length === 0 && (
          <p className="text-3xl font-black text-emerald-500">🎉 Hoàn thành rồi! 🎉</p>
        )}
      </div>
    </div>
  );
}
