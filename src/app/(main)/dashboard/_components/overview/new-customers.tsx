import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { getInitials } from "@/lib/utils";
import type { Customer } from "@/types/customer";

export function NewCustomers({ customers }: { readonly customers: Customer[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>New customers</CardTitle>
        <CardDescription>Recently created customer profiles.</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/customers">
              View all
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {customers.map((customer) => (
          <div key={customer.id} className="flex items-center gap-3">
            <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full text-xs font-medium">
              {getInitials(customer.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{customer.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {customer.city}, {customer.country}
              </p>
            </div>
            <span className="text-sm font-medium">{formatMoney(customer.totalSpent, undefined, 0)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
