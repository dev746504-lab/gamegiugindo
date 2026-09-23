import Link from "next/link";
import lessonData from "@/data/classroom-game/giu-gin-do-dung.json";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-sky-200 via-amber-100 to-emerald-200 p-8 text-center">
      <div>
        <h1 className="text-3xl font-black text-slate-800">{lessonData.lessonTitle}</h1>
        <p className="text-lg font-semibold text-slate-500">{lessonData.grade} — Trò chơi tương tác</p>
      </div>

      <Link
        href="/game/present"
        className="rounded-2xl bg-sky-500 px-10 py-5 text-2xl font-bold text-white shadow-lg transition hover:bg-sky-600"
      >
        🖥️ Bắt đầu trình chiếu
      </Link>

      <p className="max-w-lg text-sm text-slate-500">
        Chiếu màn hình này lên tivi/máy chiếu. Bấm nút ⚙️ ở góc dưới-trái bất cứ lúc nào để mở bảng điều
        khiển: chuyển game, bật/dừng giờ...
      </p>
    </main>
  );
}
