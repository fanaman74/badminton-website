"use client";

import { useActionState } from "react";
import { validateInviteCodeAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const [state, formAction, isPending] = useActionState(
    validateInviteCodeAction,
    undefined
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="text-4xl mb-2">🏸</div>
          <CardTitle className="text-2xl">Badminton Team</CardTitle>
          <p className="text-slate-500 text-sm">Enter your invite code to join</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="inviteCode"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Invite Code
              </label>
              <input
                id="inviteCode"
                name="inviteCode"
                type="password"
                required
                autoFocus
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter the code"
                disabled={isPending}
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                {state.error}
              </p>
            )}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? "Joining…" : "Join"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
