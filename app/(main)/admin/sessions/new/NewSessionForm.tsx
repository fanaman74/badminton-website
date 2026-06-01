"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSessionAction } from "@/lib/actions/sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NewSessionForm() {
  const [state, action, pending] = useActionState(createSessionAction, undefined);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link
        href="/sessions"
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 w-fit"
      >
        <ArrowLeft size={16} />
        Back
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New Session</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  required
                  defaultValue="19:00"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="location_name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Location name <span className="text-red-500">*</span>
              </label>
              <input
                id="location_name"
                name="location_name"
                type="text"
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="e.g. Kallang Squash & Tennis Centre"
              />
            </div>
            <div>
              <label
                htmlFor="location_maps_url"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Google Maps link{" "}
                <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="location_maps_url"
                name="location_maps_url"
                type="url"
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div>
              <label
                htmlFor="courts_booked"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Courts booked <span className="text-red-500">*</span>
              </label>
              <select
                id="courts_booked"
                name="courts_booked"
                required
                defaultValue="2"
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} court{n > 1 ? "s" : ""} (max {n * 4} players)
                  </option>
                ))}
              </select>
            </div>
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                {state.error}
              </p>
            )}
            <Button
              type="submit"
              disabled={pending}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white mt-2"
            >
              {pending ? "Creating…" : "Create session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
