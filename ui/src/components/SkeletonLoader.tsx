import React from 'react'

export function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="flex items-start gap-3 w-full overflow-x-hidden animate-pulse">
      {Array.from({ length: count }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="flex flex-col w-[300px] shrink-0 rounded-xl bg-surface/60 border border-border/60 overflow-hidden p-3 gap-3"
        >
          {/* Header shimmer */}
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="h-4 w-28 bg-border/80 rounded" />
            <div className="h-4 w-6 bg-border/60 rounded-full" />
          </div>
          {/* Cards shimmer */}
          <div className="flex flex-col gap-2">
            <div className="h-20 bg-bg/80 border border-border/40 rounded-lg p-3 flex flex-col justify-between">
              <div className="h-3 w-full bg-border/60 rounded" />
              <div className="h-3 w-3/4 bg-border/40 rounded" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-2.5 w-12 bg-border/60 rounded" />
                <div className="h-2.5 w-16 bg-border/40 rounded" />
              </div>
            </div>
            <div className="h-20 bg-bg/80 border border-border/40 rounded-lg p-3 flex flex-col justify-between">
              <div className="h-3 w-5/6 bg-border/60 rounded" />
              <div className="h-3 w-1/2 bg-border/40 rounded" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-2.5 w-12 bg-border/60 rounded" />
                <div className="h-2.5 w-16 bg-border/40 rounded" />
              </div>
            </div>
            <div className="h-20 bg-bg/80 border border-border/40 rounded-lg p-3 flex flex-col justify-between">
              <div className="h-3 w-4/5 bg-border/60 rounded" />
              <div className="h-3 w-2/3 bg-border/40 rounded" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-2.5 w-12 bg-border/60 rounded" />
                <div className="h-2.5 w-16 bg-border/40 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
