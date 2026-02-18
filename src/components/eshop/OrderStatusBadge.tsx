"use client";

import { OrderStatus, ORDER_STATUS_LABELS } from "@/types/eshop";

interface Props {
  status: OrderStatus;
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  ready: "bg-emerald-100 text-emerald-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderStatusBadge({ status }: Props) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
