"use client";

import { useState } from "react";
import { setupTeamAction } from "@/lib/actions/setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TEAM_MEMBERS = [
  { name: "Marika Vernon",     email: "marika.vernon@yahoo.co.uk",         role: "PLAYER" as const },
  { name: "O. Opraestegaard", email: "opraestegaard@gmail.com",            role: "PLAYER" as const },
  { name: "Isabel",            email: "jetisa@yahoo.com",                   role: "PLAYER" as const },
  { name: "Sarah Turner",      email: "sarah.turner@ec.europa.eu",          role: "PLAYER" as const },
  { name: "Fred Anaman",       email: "fredanaman@proton.me",               role: "ADMIN"  as const },
  { name: "Wayne",             email: "water.works@skynet.be",              role: "PLAYER" as const },
  { name: "Molly",             email: "mollrog@hotmail.com",                role: "PLAYER" as const },
  { name: "Kamil Baranik",     email: "kamilbaranik@gmail.com",             role: "PLAYER" as const },
  { name: "Dali Sherpa-haar",  email: "dalishaar@hotmail.com",              role: "PLAYER" as const },
  { name: "Paul Moody",        email: "paulsmoody@yahoo.co.uk",             role: "PLAYER" as const },
  { name: "Cristina Sima",     email: "cristina21sima@hotmail.com",         role: "PLAYER" as const },
  { name: "Soren Sogaard",     email: "soren.sogaard@europarl.europa.eu",   role: "PLAYER" as const },
  { name: "Michael O'Brien",   email: "michael.obrien@europarl.europa.eu",  role: "PLAYER" as const },
  { name: "Piotr Banski",      email: "piotr.banski@ec.europa.eu",          role: "PLAYER" as const },
  { name: "A. Bootland",       email: "abootland@hotmail.com",              role: "PLAYER" as const },
  { name: "Patryk Lozinski",   email: "patryk.lozinski@gmail.com",          role: "PLAYER" as const },
];

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);

  async function handleSetup() {
    setStatus("loading");
    setMessage("");
    const result = await setupTeamAction(TEAM_MEMBERS);
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
            Creates profiles for all team members. Safe to run multiple times.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Team members ({TEAM_MEMBERS.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 mb-4">
              {TEAM_MEMBERS.map((m) => (
                <div
                  key={m.email}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-sm font-medium text-slate-800">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{m.email}</span>
                    {m.role === "ADMIN" && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                        admin
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {status === "idle" && (
              <Button
                onClick={handleSetup}
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
              >
                Create all profiles
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

        <p className="text-center text-xs text-slate-400">
          Password for all members: <strong>Smash2026!!!</strong>
        </p>
      </div>
    </div>
  );
}
