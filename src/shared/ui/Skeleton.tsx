import { twMerge } from "tailwind-merge";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={twMerge("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  );
}
