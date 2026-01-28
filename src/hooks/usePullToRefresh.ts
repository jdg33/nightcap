import { useEffect, useRef, useState } from 'react';
import { haptics, isNative } from '../lib/ios';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: PullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(0);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollableRef.current;
    if (!element) return;

    let touchStartY = 0;
    let scrollTop = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return;

      scrollTop = element.scrollTop || window.scrollY;
      if (scrollTop === 0) {
        touchStartY = e.touches[0].clientY;
        startY.current = touchStartY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchY - touchStartY;

      scrollTop = element.scrollTop || window.scrollY;

      if (scrollTop === 0 && deltaY > 0) {
        setIsPulling(true);
        const distance = Math.min(deltaY / resistance, threshold * 1.5);
        setPullDistance(distance);

        if (distance >= threshold && isNative) {
          haptics.light();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isRefreshing) return;

      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        if (isNative) {
          await haptics.medium();
        }

        try {
          await onRefresh();
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setIsPulling(false);
            setPullDistance(0);
          }, 300);
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, resistance, pullDistance, isRefreshing]);

  return {
    scrollableRef,
    isPulling,
    pullDistance,
    isRefreshing,
    threshold,
  };
};
