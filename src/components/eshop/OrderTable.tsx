"use client";

import { Order, OrderStatus, ORDER_STATUS_LABELS } from "@/types/eshop";
import { formatPrice } from "@/lib/eshop-utils";
import { updateOrderStatus } from "@/lib/eshop-api";
import OrderStatusBadge from "./OrderStatusBadge";

interface Props {
  orders: Order[];
  onUpdate: () => void;
}

const statuses: OrderStatus[] = ["pending", "paid", "preparing", "ready", "completed", "cancelled"];

export default function OrderTable({ orders, onUpdate }: Props) {
  async function handleStatusChange(orderId: string, status: OrderStatus) {
    try {
      await updateOrderStatus(orderId, status);
      onUpdate();
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted">
        Žádné objednávky
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 pr-4 font-medium text-muted">Číslo</th>
            <th className="py-3 pr-4 font-medium text-muted">Zákazník</th>
            <th className="py-3 pr-4 font-medium text-muted">Celkem</th>
            <th className="py-3 pr-4 font-medium text-muted">Status</th>
            <th className="py-3 pr-4 font-medium text-muted">Datum</th>
            <th className="py-3 font-medium text-muted">Akce</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border">
              <td className="py-3 pr-4">
                <div className="font-mono text-xs">{order.order_number}</div>
                {order.delivery_method.startsWith("reception_") && (
                  <span className="inline-block mt-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    {order.delivery_method === "reception_cash" ? "Hotovost" : "Karta"}
                  </span>
                )}
              </td>
              <td className="py-3 pr-4">
                <div className="font-medium text-foreground">{order.customer_name}</div>
                <div className="text-xs text-muted">{order.email}</div>
              </td>
              <td className="py-3 pr-4 font-medium">{formatPrice(order.total)}</td>
              <td className="py-3 pr-4">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="py-3 pr-4 text-muted">
                {new Date(order.created_at).toLocaleDateString("cs-CZ")}
              </td>
              <td className="py-3">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                  className="rounded border border-border px-2 py-1 text-xs focus:border-primary focus:outline-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
