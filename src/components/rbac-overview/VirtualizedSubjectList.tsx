/**
 * @file VirtualizedSubjectList.tsx
 * Windowed list for large subject collections.
 */
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

const DEFAULT_ROW_HEIGHT = 36;

type VirtualizedSubjectListProps<T> = {
  items: T[];
  rowHeight?: number;
  height?: number;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  ariaLabel: string;
};

export function VirtualizedSubjectList<T>({
  items,
  rowHeight = DEFAULT_ROW_HEIGHT,
  height = 448,
  getKey,
  renderItem,
  ariaLabel,
}: VirtualizedSubjectListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const { startIndex, endIndex, offsetY, totalHeight } = useMemo(() => {
    const visibleCount = Math.ceil(height / rowHeight) + 4;
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
    const end = Math.min(items.length, start + visibleCount);
    return {
      startIndex: start,
      endIndex: end,
      offsetY: start * rowHeight,
      totalHeight: items.length * rowHeight,
    };
  }, [height, items.length, rowHeight, scrollTop]);

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      className="rbac-overview__virtual-list"
      style={{ height: `${height}px` }}
      onScroll={onScroll}
      role="listbox"
      aria-label={ariaLabel}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item) => (
            <div key={getKey(item)} role="presentation" style={{ minHeight: `${rowHeight}px` }}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
