"use client";

import { useState } from "react";
import { useGetVendorEarningsQuery } from "@/lib/redux/features/vendors/vendorsApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, TrendingUp, Clock, Store } from "lucide-react";

// Local date helpers (client-only, so `new Date()` is safe here).
const toYmd = (d: Date) => d.toISOString().slice(0, 10);
const todayStr = () => toYmd(new Date());
const daysAgoStr = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toYmd(d);
};
const monthStartStr = () => {
  const d = new Date();
  return toYmd(new Date(d.getFullYear(), d.getMonth(), 1));
};

const formatCurrency = (amount: string | number) =>
  `Rs. ${parseFloat(String(amount)).toLocaleString("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

type Preset = "all" | "7d" | "30d" | "month" | "custom";

export default function EarningsPage() {
  // Draft inputs (what's in the date fields) vs. applied filter (used in query).
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [applied, setApplied] = useState<{ startDate?: string; endDate?: string }>(
    {}
  );
  const [preset, setPreset] = useState<Preset>("all");

  const { data, isLoading, isFetching, error } =
    useGetVendorEarningsQuery(applied);

  const applyPreset = (next: Preset) => {
    setPreset(next);
    if (next === "all") {
      setStartInput("");
      setEndInput("");
      setApplied({});
      return;
    }
    let start = "";
    const end = todayStr();
    if (next === "7d") start = daysAgoStr(7);
    else if (next === "30d") start = daysAgoStr(30);
    else if (next === "month") start = monthStartStr();
    setStartInput(start);
    setEndInput(end);
    setApplied({ startDate: start, endDate: end });
  };

  const applyCustom = () => {
    setPreset("custom");
    setApplied({
      startDate: startInput || undefined,
      endDate: endInput || undefined,
    });
  };

  const totals = data?.totals;
  const vendors = data?.vendors ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Vendor Earnings &amp; Payouts</h1>
        <p className="text-gray-600 mt-1">
          Payments are collected into the platform account. This shows how much
          each vendor has generated and how much you still owe them.
        </p>
      </div>

      {/* Date range filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Time range</CardTitle>
          <CardDescription>
            Filter earnings by order date. Defaults to all time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All time"],
                ["7d", "Last 7 days"],
                ["30d", "Last 30 days"],
                ["month", "This month"],
              ] as [Preset, string][]
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={preset === key ? "default" : "outline"}
                onClick={() => applyPreset(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Custom range */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={startInput}
                max={endInput || todayStr()}
                onChange={(e) => setStartInput(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                value={endInput}
                min={startInput || undefined}
                max={todayStr()}
                onChange={(e) => setEndInput(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              type="button"
              onClick={applyCustom}
              disabled={!startInput && !endInput}
              className="w-full sm:w-auto"
            >
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gross sales</p>
                <p className="text-2xl font-bold mt-1">
                  {totals ? formatCurrency(totals.grossSales) : "—"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Owed to vendors</p>
                <p className="text-2xl font-bold mt-1 text-primary">
                  {totals ? formatCurrency(totals.amountOwed) : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Paid &amp; delivered orders
                </p>
              </div>
              <Wallet className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending payout</p>
                <p className="text-2xl font-bold mt-1">
                  {totals ? formatCurrency(totals.pendingPayout) : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sold, not yet payable
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-vendor table */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown by vendor</CardTitle>
          <CardDescription>
            {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}
            {isFetching && !isLoading ? " · updating…" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading earnings…</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-primary">Failed to load earnings</p>
            </div>
          ) : !vendors.length ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No vendors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Gross sales</TableHead>
                    <TableHead className="text-right">Owed</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((row) => (
                    <TableRow key={row.vendorId}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {row.vendor.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {row.vendor.email}
                          </span>
                          {!row.vendor.isActive && (
                            <Badge
                              variant="outline"
                              className="mt-1 w-fit bg-gray-100 text-gray-600"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {row.unitsSold}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.orderCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.grossSales)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(row.amountOwed)}
                      </TableCell>
                      <TableCell className="text-right text-gray-500">
                        {formatCurrency(row.pendingPayout)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
