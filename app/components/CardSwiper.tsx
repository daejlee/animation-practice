"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

const CARDS = [
  { id: 1, title: "Mountain Peaks", emoji: "🏔️", color: "from-blue-400 to-indigo-600" },
  { id: 2, title: "Ocean Waves", emoji: "🌊", color: "from-cyan-400 to-blue-600" },
  { id: 3, title: "Forest Path", emoji: "🌲", color: "from-green-400 to-emerald-600" },
  { id: 4, title: "Desert Dunes", emoji: "🏜️", color: "from-yellow-400 to-orange-500" },
  { id: 5, title: "City Lights", emoji: "🌆", color: "from-purple-400 to-pink-600" },
  { id: 6, title: "Starry Night", emoji: "🌌", color: "from-indigo-500 to-purple-700" },
  { id: 7, title: "Cherry Blossom", emoji: "🌸", color: "from-pink-300 to-rose-500" },
  { id: 8, title: "Northern Lights", emoji: "🌠", color: "from-teal-400 to-green-600" },
  { id: 9, title: "Golden Sunset", emoji: "🌅", color: "from-orange-400 to-red-500" },
  { id: 10, title: "Snowy Village", emoji: "❄️", color: "from-sky-300 to-blue-500" },
];

export default function CardSwiper() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        카드를 스와이프해서 선택하세요
      </h2>

      <Swiper
        modules={[FreeMode]}
        freeMode
        loop
        grabCursor
        slidesPerView="auto"
        spaceBetween={20}
        className="w-full px-8"
      >
        {CARDS.map((card) => (
          <SwiperSlide key={card.id} style={{ width: 220 }}>
            <button
              onClick={() => setSelected(card.id)}
              className={`w-full rounded-2xl bg-gradient-to-br ${card.color} p-px cursor-pointer`}
            >
              <div
                className={`rounded-2xl bg-white/10 backdrop-blur-sm p-6 flex flex-col items-center gap-4 transition-all duration-200 ${
                  selected === card.id ? "ring-4 ring-white ring-offset-2" : "hover:brightness-110"
                }`}
              >
                <span className="text-6xl">{card.emoji}</span>
                <p className="text-lg font-semibold text-white">{card.title}</p>
                {selected === card.id && (
                  <span className="text-xs font-bold bg-white text-gray-800 px-3 py-1 rounded-full">
                    선택됨 ✓
                  </span>
                )}
              </div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      {selected && (
        <div className="mt-2 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">선택한 카드</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {CARDS.find((c) => c.id === selected)?.emoji}{" "}
            {CARDS.find((c) => c.id === selected)?.title}
          </p>
          <button
            onClick={() => setSelected(null)}
            className="mt-2 text-xs text-gray-400 underline hover:text-gray-600"
          >
            선택 해제
          </button>
        </div>
      )}
    </div>
  );
}
