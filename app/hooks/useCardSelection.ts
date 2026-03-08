import { useState, useRef, useCallback } from 'react';
import { CARDS } from '../consts/card';

type Card = (typeof CARDS)[number];

export const MAX_SELECTION = 3;
const DESELECT_ANIM_MS = 250;
const COLLAPSE_MS = 300;

interface FlyingCardState {
  card: Card;
  fromRect: DOMRect;
  toRect: DOMRect;
}

export function useCardSelection() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [flyingCard, setFlyingCard] = useState<FlyingCardState | null>(null);
  const [flyingIds, setFlyingIds] = useState<Set<number>>(new Set()); // 비행 중: 스와이퍼에 invisible 유지
  const [collapsingIds, setCollapsingIds] = useState<Set<number>>(new Set()); // 착지 후: 슬롯 접히는 중
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

    // 선택 목록에 추가, overlay 제거
    setSelectedIds((prev) => [...prev, card.id]);
    setFlyingCard(null);

    // flyingIds → collapsingIds: 스와이퍼 슬롯이 접히기 시작
    setFlyingIds((prev) => {
      const next = new Set(prev);
      next.delete(card.id);
      return next;
    });
    setCollapsingIds((prev) => new Set(prev).add(card.id));

    // 접힘 완료 후 스와이퍼에서 완전 제거
    setTimeout(() => {
      setCollapsingIds((prev) => {
        const next = new Set(prev);
        next.delete(card.id);
        return next;
      });
    }, COLLAPSE_MS);
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

  // 비행 중·접히는 중인 카드도 스와이퍼에 유지 (플레이스홀더)
  const swiperCards = CARDS.filter(
    (c) =>
      !selectedIds.includes(c.id) ||
      flyingIds.has(c.id) ||
      collapsingIds.has(c.id),
  );

  return {
    selectedIds,
    flyingCard,
    flyingIds,
    collapsingIds,
    exitingFromSelected,
    swiperCards,
    isMaxSelected: selectedIds.length >= MAX_SELECTION,
    slotRefs,
    handleSelect,
    handleFlyingDone,
    handleDeselect,
  };
}
