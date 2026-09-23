"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ActiveGame } from "@/lib/game/state";

interface GameInstructions {
  title: string;
  steps: string[];
}

const INSTRUCTIONS: Record<ActiveGame, GameInstructions> = {
  sorting: {
    title: "🧩 Game 1: Sắp xếp đồ dùng học tập",
    steps: [
      "Kéo từng thẻ đồ dùng ở khay chờ bên dưới vào đúng khay cất giữ phía trên.",
      "Kéo đúng: thẻ biến mất khỏi khay chờ, có hiệu ứng vui. Kéo sai: thẻ rung nhẹ rồi bật về chỗ cũ.",
      "Bấm biểu tượng 💡 trên mỗi thẻ nếu cần xem gợi ý nên bỏ vào khay nào.",
      "Mở bảng điều khiển ⚙️ để bấm Bắt đầu / Dừng / Chơi lại cho đồng hồ đếm giờ.",
    ],
  },
  truefalse: {
    title: "❓ Game 2: Đúng hay Sai",
    steps: [
      "Đọc to câu hỏi trên màn hình, cho học sinh trả lời rồi bấm nút ĐÚNG hoặc SAI.",
      "Bấm \"Chốt đáp án\" để xem kết quả: màn hình hiện đáp án đúng kèm lời giải thích.",
      "Mở bảng điều khiển ⚙️ để chuyển sang câu trước/sau (có 7 câu tất cả).",
    ],
  },
  sequencing: {
    title: "📚 Game 3: Bao vở thần tốc",
    steps: [
      "Mở bảng điều khiển ⚙️ → bấm \"Bắt đầu vòng chơi\" để xáo 6 bước và chạy đồng hồ đếm giờ.",
      "Bấm 2 thẻ bất kỳ để hoán đổi vị trí cho nhau, sắp xếp sao cho đúng thứ tự 1 → 6.",
      "Thẻ vào đúng chỗ sẽ tự khoá lại (hiện dấu ✅ xanh) ngay lập tức, không cần chờ kiểm tra.",
      "Bấm \"🔍 Kiểm tra đáp án\" để xem thẻ nào còn sai (rung, viền đỏ). Bấm 💡 trên thẻ để xem gợi ý vị trí đúng.",
      "Bấm \"Xem đáp án đúng\" trong bảng điều khiển để trình chiếu lại đúng thứ tự kèm giải thích, giúp cả lớp ghi nhớ trước khi thực hành.",
    ],
  },
};

interface HelpButtonProps {
  activeGame: ActiveGame;
}

export default function HelpButton({ activeGame }: HelpButtonProps) {
  const [open, setOpen] = useState(false);
  const info = INSTRUCTIONS[activeGame];

  return (
    <>
      <div className="fixed bottom-4 right-4 z-20 flex items-center gap-2">
        <motion.div
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-2 text-base font-black text-white shadow-lg"
        >
          Hướng dẫn <span className="text-xl">➜</span>
        </motion.div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-2xl font-black text-indigo-600 shadow-lg transition hover:bg-indigo-50"
          aria-label="Xem hướng dẫn trò chơi"
          title="Xem hướng dẫn trò chơi"
        >
          ❓
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-black text-slate-800">{info.title}</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 flex-shrink-0 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  aria-label="Đóng hướng dẫn"
                >
                  ✕
                </button>
              </div>
              <ol className="list-decimal space-y-3 pl-6 text-lg font-semibold leading-snug text-slate-700">
                {info.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
