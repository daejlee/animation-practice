'use client';

import { useState, useEffect } from 'react';
import { CARDS } from '../consts/card';

type Card = (typeof CARDS)[number];

const ANIM_MS = 380;

interface Props {
  card: Card;
  fromRect: DOMRect;
  toRect: DOMRect;
  onDone: () => void;
}

export function FlyingCardOverlay({ card, fromRect, toRect, onDone }: Props) {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    // double rAF: 첫 프레임에 마운트, 두 번째 프레임에 transition 시작
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setArrived(true)),
    );
    const timer = setTimeout(onDone, ANIM_MS + 40);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dx =
    fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2);
  const dy =
    fromRect.top + fromRect.height / 2 - (toRect.top + toRect.height / 2);
  const sx = fromRect.width / toRect.width;
  const sy = fromRect.height / toRect.height;

  return (
    <div
      style={{
        position: 'fixed',
        left: toRect.left,
        top: toRect.top,
        width: toRect.width,
        height: toRect.height,
        zIndex: 9999,
        pointerEvents: 'none',
        transformOrigin: 'center',
        transform: arrived
          ? 'translate(0,0) scale(1,1)'
          : `translate(${dx}px,${dy}px) scale(${sx},${sy})`,
        transition: arrived
          ? `transform ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
          : 'none',
      }}
    >
      <div
        className={`w-full h-full rounded-2xl bg-linear-to-br ${card.color} p-px`}
      >
        <div className='w-full h-full rounded-2xl bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center gap-2'>
          <span className='text-4xl'>{card.emoji}</span>
          <p className='text-sm font-semibold text-white'>{card.title}</p>
        </div>
      </div>
    </div>
  );
}
