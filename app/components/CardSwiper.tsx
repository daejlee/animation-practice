'use client';

import { useLayoutEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import { CARDS } from '../consts/card';
import { FlyingCardOverlay } from './FlyingCardOverlay';
import { useCardSelection, MAX_SELECTION } from '../hooks/useCardSelection';

const SWIPER_FILL_DURATION = 300;

type SlideSnapshot = { el: HTMLElement; left: number };

export default function CardSwiper() {
  const {
    selectedIds,
    flyingCard,
    flyingIds,
    exitingFromSelected,
    swiperCards,
    isMaxSelected,
    slotRefs,
    handleSelect,
    handleFlyingDone,
    handleDeselect,
  } = useCardSelection();

  const swiperRef = useRef<SwiperClass | null>(null);
  const prevSnapshotRef = useRef<SlideSnapshot[]>([]);

  // 클릭 시점에 현재 슬라이드 위치를 스냅샷 → React 상태 업데이트 전에 기록
  const handleSelectWithFlip = useCallback(
    (card: (typeof CARDS)[number], e: React.MouseEvent) => {
      const swiper = swiperRef.current;
      if (swiper) {
        prevSnapshotRef.current = swiper.slides.map((el) => ({
          el,
          left: el.getBoundingClientRect().left,
        }));
      }
      handleSelect(card, e);
    },
    [handleSelect],
  );

  // DOM 업데이트 직후(paint 전) FLIP 애니메이션 적용
  useLayoutEffect(() => {
    const snapshot = prevSnapshotRef.current;
    if (!snapshot.length) return;
    prevSnapshotRef.current = [];

    // 살아있는 슬라이드에 역방향 오프셋 적용 (이동 전 위치로 순간이동)
    snapshot.forEach(({ el, left }) => {
      if (!el.isConnected) return;
      const dx = left - el.getBoundingClientRect().left;
      if (Math.abs(dx) < 1) return;
      el.style.transition = 'none';
      el.style.transform = `translateX(${dx}px)`;
    });

    // 다음 프레임에 transition 추가 → 원래 위치(0)로 부드럽게 이동
    requestAnimationFrame(() => {
      snapshot.forEach(({ el }) => {
        if (!el.isConnected) return;
        el.style.transition = `transform ${SWIPER_FILL_DURATION}ms ease`;
        el.style.transform = '';
      });
    });
  }, [swiperCards.length]);

  return (
    <>
      {flyingCard && (
        <FlyingCardOverlay
          card={flyingCard.card}
          fromRect={flyingCard.fromRect}
          toRect={flyingCard.toRect}
          onDone={handleFlyingDone}
        />
      )}

      <div className='flex flex-col gap-10 py-12 max-w-4xl mx-auto w-full'>
        {/* 카드 캐러셀 */}
        <div className='flex flex-col gap-4'>
          <div className='px-8 flex items-center justify-between'>
            <h2 className='text-3xl font-bold text-gray-800 dark:text-gray-100'>
              Select Your Cards
            </h2>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {selectedIds.length} / {MAX_SELECTION}
            </span>
          </div>

          <Swiper
            modules={[FreeMode]}
            freeMode
            grabCursor={!isMaxSelected}
            slidesPerView='auto'
            spaceBetween={20}
            className='w-full px-8'
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {swiperCards.map((card) => (
              <SwiperSlide key={card.id} style={{ width: 220 }}>
                <button
                  onClick={(e) => handleSelectWithFlip(card, e)}
                  disabled={isMaxSelected || flyingIds.has(card.id)}
                  className={`w-full rounded-2xl bg-linear-to-br ${card.color} p-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <div className='rounded-2xl bg-white/10 backdrop-blur-sm p-6 flex flex-col items-center gap-4 hover:brightness-110 transition-[filter] duration-200'>
                    <span className='text-6xl'>{card.emoji}</span>
                    <p className='text-lg font-semibold text-white'>
                      {card.title}
                    </p>
                  </div>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* 선택된 카드 슬롯 (고정 3개) */}
        <div className='flex flex-col gap-4 px-8'>
          <h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300'>
            Selected Cards
          </h3>

          <div className='flex gap-4 items-start'>
            {Array.from({ length: MAX_SELECTION }).map((_, i) => {
              const id = selectedIds[i];
              const card = id != null ? CARDS.find((c) => c.id === id) : null;
              const isExiting = id != null && exitingFromSelected.has(id);

              return (
                <div
                  key={i}
                  ref={(el) => {
                    slotRefs.current[i] = el;
                  }}
                  style={{ width: 160, height: 144 }}
                >
                  {card ? (
                    <button
                      onClick={() => handleDeselect(card.id)}
                      className={`w-full h-full rounded-2xl bg-linear-to-br ${card.color} p-px cursor-pointer ${isExiting ? 'card-exit-selected' : ''}`}
                    >
                      <div className='relative w-full h-full rounded-2xl bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center gap-2 hover:brightness-110 transition-[filter] duration-200'>
                        <span className='absolute top-2 right-2 text-white/50 text-xs leading-none'>
                          ✕
                        </span>
                        <span className='text-4xl'>{card.emoji}</span>
                        <p className='text-sm font-semibold text-white'>
                          {card.title}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div className='w-full h-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700' />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
