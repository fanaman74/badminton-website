"use client";

import { useState } from "react";
import { setupTeamAction } from "@/lib/actions/setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);

  const [membersText, setMembersText] = useState("");

  async function handleSetup() {
    setStatus("loading");
    setMessage("");

    // Parse lines: "Name, email, ADMIN" or "Name, email"
    const lines = membersText.split("\n").map((l) => l.trim()).filter(Boolean);
    const members = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const name = parts[0] || "";
      const email = parts[1] || "";
      const role = (parts[2]?.toUpperCase() === "ADMIN" ? "ADMIN" : "PLAYER") as "ADMIN" | "PLAYER";
      return { name, email, role };
    }).filter((m) => m.name && m.email);

    if (members.length === 0) {
      setStatus("error");
      setMessage("Please enter at least one member (format: Name, email@domain.com, role)");
      return;
    }

    const result = await setupTeamAction(members);
    if (result.error) {
      setStatus("error");
      setMessage(result.error);
    } else {
      setStatus("done");
      setCreated(result.created ?? []);
      setSkipped(result.skipped ?? []);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🏸</div>
          <h1 className="text-2xl font-bold text-slate-900">Team Setup</h1>
          <p className="text-slate-500 text-sm mt-1">
            Import initial team member profiles into Neon Postgres.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Add Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Enter one member per line: <code>Name, email@domain.com, [ADMIN|PLAYER]</code>
              </label>
              <textarea
                rows={6}
                value={membersText}
                onChange={(e) => setMembersText(e.target.value)}
                placeholder={"Alex Tan, alex@example.com, ADMIN\nBen Wong, ben@example.com, PLAYER"}
                className="w-full text-sm font-mono p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {status === "idle" && (
              <Button
                onClick={handleSetup}
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
              >
                Create profiles
              </Button>
            )}

            {status === "loading" && (
              <Button disabled className="w-full h-11">
                Creating profiles…
              </Button>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{message}</p>
                <Button
                  onClick={handleSetup}
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
                >
                  Retry
                </Button>
              </div>
            )}

            {status === "done" && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Setup complete!
                  </p>
                  {created.length > 0 && (
                    <p className="text-sm text-green-700 mt-1">
                      Created: {created.join(", ")}
                    </p>
                  )}
                  {skipped.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Already existed: {skipped.join(", ")}
                    </p>
                  )}
                </div>
                <p className="text-center text-sm text-slate-500">
                  Team members can now sign in at{" "}
                  <a href="/auth" className="text-green-600 hover:underline font-medium">
                    /auth
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
