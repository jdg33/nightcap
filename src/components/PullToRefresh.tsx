import React from 'react';
import { Loader2 } from 'lucide-react';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const { scrollableRef, isPulling, pullDistance, isRefreshing, threshold } =
    usePullToRefresh({ onRefresh });

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const rotation = (pullDistance / threshold) * 360;

  return (
    <div ref={scrollableRef} className="relative min-h-screen overflow-auto">
      {(isPulling || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / threshold, 1),
          }}
        >
          <div className="flex flex-col items-center">
            <Loader2
              className={`h-6 w-6 text-amber-600 dark:text-amber-500 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
              }}
            />
            {pullDistance >= threshold && !isRefreshing && (
              <span className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Release to refresh
              </span>
            )}
            {isRefreshing && (
              <span className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Refreshing...
              </span>
            )}
          </div>
        </div>
      )}
      <div
        style={{
          transform: `translateY(${isPulling || isRefreshing ? pullDistance : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
