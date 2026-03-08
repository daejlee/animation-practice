'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { CARDS } from '../consts/card';
import { FlyingCardOverlay } from './FlyingCardOverlay';
import { useCardSelection, MAX_SELECTION } from '../hooks/useCardSelection';

export default function CardSwiper() {
  const {
    selectedIds,
    flyingCard,
    flyingIds,
    collapsingIds,
    exitingFromSelected,
    swiperCards,
    isMaxSelected,
    slotRefs,
    handleSelect,
    handleFlyingDone,
    handleDeselect,
  } = useCardSelection();

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
          >
            {swiperCards.map((card) => {
              const isFlying = flyingIds.has(card.id);
              const isCollapsing = collapsingIds.has(card.id);
              return (
                <SwiperSlide
                  key={card.id}
                  style={{
                    width: isCollapsing ? 0 : 220,
                    overflow: 'hidden',
                    transition: 'width 0.3s ease',
                    opacity: isFlying || isCollapsing ? 0 : 1,
                  }}
                >
                  {/* width 고정: 슬라이드 너비가 줄어도 내부 콘텐츠가 줄바꿈되지 않게 */}
                  <div style={{ width: 220, minWidth: 220 }}>
                    <button
                      onClick={(e) => handleSelect(card, e)}
                      disabled={isMaxSelected || isFlying || isCollapsing}
                      className={`w-full rounded-2xl bg-linear-to-br ${card.color} p-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <div className='rounded-2xl bg-white/10 backdrop-blur-sm p-6 flex flex-col items-center gap-4 hover:brightness-110 transition-[filter] duration-200'>
                        <span className='text-6xl'>{card.emoji}</span>
                        <p className='text-lg font-semibold text-white'>
                          {card.title}
                        </p>
                      </div>
                    </button>
                  </div>
                </SwiperSlide>
              );
            })}
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
