import { useState, useRef, useCallback } from 'react';
import { CARDS } from '../consts/card';

type Card = (typeof CARDS)[number];

export const MAX_SELECTION = 3;
const DESELECT_ANIM_MS = 250;

interface FlyingCardState {
  card: Card;
  fromRect: DOMRect;
  toRect: DOMRect;
}

export function useCardSelection() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [flyingCard, setFlyingCard] = useState<FlyingCardState | null>(null);
  const [flyingIds, setFlyingIds] = useState<Set<number>>(new Set());
  const [exitingFromSelected, setExitingFromSelected] = useState<Set<number>>(
    new Set(),
  );
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSelect = useCallback(
    (card: Card, e: React.MouseEvent) => {
      if (
        selectedIds.length >= MAX_SELECTION ||
        flyingCard ||
        flyingIds.has(card.id)
      )
        return;

      const fromRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const toRect =
        slotRefs.current[selectedIds.length]?.getBoundingClientRect();
      if (!toRect) return;

      setFlyingIds((prev) => new Set(prev).add(card.id));
      setFlyingCard({ card, fromRect, toRect });
    },
    [selectedIds, flyingCard, flyingIds],
  );

  const handleFlyingDone = useCallback(() => {
    if (!flyingCard) return;
    const { card } = flyingCard;
    setSelectedIds((prev) => [...prev, card.id]);
    setFlyingIds((prev) => {
      const next = new Set(prev);
      next.delete(card.id);
      return next;
    });
    setFlyingCard(null);
  }, [flyingCard]);

  const handleDeselect = useCallback(
    (id: number) => {
      if (exitingFromSelected.has(id)) return;
      setExitingFromSelected((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));
        setExitingFromSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, DESELECT_ANIM_MS);
    },
    [exitingFromSelected],
  );

  const swiperCards = CARDS.filter(
    (c) => !selectedIds.includes(c.id) && !flyingIds.has(c.id),
  );

  return {
    selectedIds,
    flyingCard,
    exitingFromSelected,
    swiperCards,
    isMaxSelected: selectedIds.length >= MAX_SELECTION,
    slotRefs,
    handleSelect,
    handleFlyingDone,
    handleDeselect,
  };
}
