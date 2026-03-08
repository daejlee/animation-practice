'use client';

import { useState, useEffect } from 'react';
import { CARDS } from '../consts/card';

type Card = (typeof CARDS)[number];

const ANIM_MS = 400;
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

interface Props {
  card: Card;
  fromRect: DOMRect;
  toRect: DOMRect;
  onDone: () => void;
}

export function FlyingCardOverlay({ card, fromRect, toRect, onDone }: Props) {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    // double rAF: 첫 프레임 마운트(initial 위치), 두 번째 프레임부터 transition 시작
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setArrived(true)),
    );
    const timer = setTimeout(onDone, ANIM_MS + 40);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const transition = arrived
    ? `left ${ANIM_MS}ms ${EASE}, top ${ANIM_MS}ms ${EASE}, width ${ANIM_MS}ms ${EASE}, height ${ANIM_MS}ms ${EASE}`
    : 'none';

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
        left: arrived ? toRect.left : fromRect.left,
        top: arrived ? toRect.top : fromRect.top,
        width: arrived ? toRect.width : fromRect.width,
        height: arrived ? toRect.height : fromRect.height,
        transition,
      }}
    >
      <div
        className={`w-full h-full rounded-2xl bg-linear-to-br ${card.color} p-px`}
      >
        <div className='relative w-full h-full rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden'>
          {/* source 레이아웃: 날아가는 동안 fade-out */}
          <div
            className='absolute inset-0 flex flex-col items-center justify-center gap-4 p-6'
            style={{
              opacity: arrived ? 0 : 1,
              transition: `opacity ${ANIM_MS}ms ${EASE}`,
            }}
          >
            <span className='text-6xl'>{card.emoji}</span>
            <p className='text-lg font-semibold text-white'>{card.title}</p>
          </div>

          {/* dest 레이아웃: 도착하면서 fade-in */}
          <div
            className='absolute inset-0 flex flex-col items-center justify-center gap-2'
            style={{
              opacity: arrived ? 1 : 0,
              transition: `opacity ${ANIM_MS}ms ${EASE}`,
            }}
          >
            <span className='text-4xl'>{card.emoji}</span>
            <p className='text-sm font-semibold text-white'>{card.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
