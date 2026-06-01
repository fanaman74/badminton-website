import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Trophy className="text-slate-300 mb-4" size={48} />
      <h1 className="text-xl font-semibold text-slate-700">Leaderboard</h1>
      <p className="text-slate-500 mt-2 text-sm">Coming in Phase 3 — win rates and match history.</p>
    </div>
  );
}
