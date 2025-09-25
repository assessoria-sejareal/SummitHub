import { ReactNode } from 'react'

interface SkeletonProps {
  className?: string
  children?: ReactNode
}

export const Skeleton = ({ className = '', children }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      {children}
    </div>
  )
}

// Skeleton específicos para diferentes componentes
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
    <Skeleton className="h-8 w-24" />
  </div>
)

export const BookingSkeleton = () => (
  <div className="border-l-4 border-l-gray-200 bg-gray-50 rounded-lg p-4 space-y-3">
    <div className="flex items-center space-x-2">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-5 w-16" />
    </div>
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-4 w-40" />
    <Skeleton className="h-8 w-20 ml-auto" />
  </div>
)

export const StationSkeleton = () => (
  <div className="bg-white rounded-lg border-2 border-gray-200 p-4 space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
)

export const StatsSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
    <Skeleton className="h-6 w-32" />
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-12 mx-auto" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-12 mx-auto" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-12 mx-auto" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
    </div>
  </div>
)