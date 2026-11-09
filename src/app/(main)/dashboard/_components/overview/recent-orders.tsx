import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";
import type { Order } from "@/types/order";

export function RecentOrders({ orders }: { readonly orders: Order[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>The latest orders across your store.</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/orders">
              View all
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 px-2">Order</TableHead>
              <TableHead className="h-8 px-2">Customer</TableHead>
              <TableHead className="h-8 px-2">Date</TableHead>
              <TableHead className="h-8 px-2 text-right">Total</TableHead>
              <TableHead className="h-8 px-2">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-2 py-2.5 font-medium">{order.orderNumber}</TableCell>
                <TableCell className="max-w-40 truncate px-2 py-2.5">{order.customerName}</TableCell>
                <TableCell className="text-muted-foreground px-2 py-2.5 text-xs">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="px-2 py-2.5 text-right font-medium">
                  {formatMoney(order.total, order.currency, 0)}
                </TableCell>
                <TableCell className="px-2 py-2.5">
                  <StatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
