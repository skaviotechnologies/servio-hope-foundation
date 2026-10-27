import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { CardGridSkeleton, EmptyState, ErrorState } from "./ui";

export function ListBody<T>({ q, empty, render }: { q: UseQueryResult<T[]>; empty: [string, string]; render: (items: T[]) => ReactNode }) {
  if (q.isLoading) return <CardGridSkeleton n={6} />;
  if (q.isError) return <ErrorState />;
  if (!q.data?.length) return <EmptyState title={empty[0]} text={empty[1]} />;
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{render(q.data)}</div>;
}
