"use client";

import { useState } from "react";
import { updateUserRoleAction } from "@/lib/actions/profile";

interface TeamMemberCardProps {
  id: string;
  name: string;
  email: string | null;
  role: "ADMIN" | "PLAYER";
  isCurrentUser: boolean;
  currentUserIsAdmin: boolean;
}

export function TeamMemberCard({
  id,
  name,
  email,
  role,
  isCurrentUser,
  currentUserIsAdmin,
}: TeamMemberCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState(role);

  function avatarColor(userId: string) {
    const colors = [
      "#FF5A1F",
      "#1FA463",
      "#2D7FF9",
      "#9B5DE5",
      "#F15BB5",
      "#E0A500",
      "#00B5C9",
      "#E5484D",
      "#14B8A6",
      "#F97316",
      "#8B5CF6",
      "#EC4899",
    ];
    let hash = 0;
    for (const c of userId) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return colors[Math.abs(hash) % colors.length];
  }

  function initials(n: string) {
    return n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  async function toggleRole() {
    const newRole = currentRole === "ADMIN" ? "PLAYER" : "ADMIN";
    setIsLoading(true);
    setError(null);

    const result = await updateUserRoleAction(id, newRole);
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setCurrentRole(newRole);
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--r-lg)",
        padding: 12,
        border: "1px solid var(--line)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            flexShrink: 0,
            background: avatarColor(id),
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {initials(name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 15,
              color: "var(--ink)",
              lineHeight: 1,
            }}
          >
            {name}
            {isCurrentUser && (
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>
                (you)
              </span>
            )}
          </div>
          {email && (
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 12,
                color: "var(--muted)",
                marginTop: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {email}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {currentRole === "ADMIN" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: "var(--r-sm)",
              background: "var(--accent)",
              color: "var(--accent-ink)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 11.5,
              whiteSpace: "nowrap",
            }}
          >
            ⚙️ Admin
          </div>
        )}

        {currentUserIsAdmin && !isCurrentUser && (
          <button
            onClick={toggleRole}
            disabled={isLoading}
            title={currentRole === "ADMIN" ? "Demote to player" : "Promote to admin"}
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line)",
              background: "var(--surface-2)",
              color: currentRole === "ADMIN" ? "var(--out)" : "var(--in)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 14,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {currentRole === "ADMIN" ? "✕" : "+"}
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            background: "color-mix(in srgb, var(--out) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
            borderRadius: "var(--r-sm)",
            padding: "8px 12px",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 12,
            color: "var(--out)",
            zIndex: 50,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
