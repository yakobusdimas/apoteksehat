/**
 * Loading State Component
 * Skeleton loaders for better perceived performance
 */

import { cn } from './utils';

// Base skeleton
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

// Medicine Card Skeleton
export function MedicineCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="h-44 w-full rounded-none" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" /> {/* Category badge */}
        <Skeleton className="h-5 w-full" /> {/* Title */}
        <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-3/4" /> {/* Description line 2 */}
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" /> {/* Label */}
            <Skeleton className="h-6 w-24" /> {/* Price */}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Heart button */}
            <Skeleton className="h-9 w-20 rounded-md" /> {/* Buy button */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart Item Skeleton
export function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
      <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

// Generic Grid Skeleton
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <MedicineCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Text Skeleton Lines
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}
