"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserRoleAction, deleteMemberAction } from "@/lib/actions/profile";

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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState(role);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  const isProtectedAdmin =
    email?.toLowerCase() === "fredanaman@gmail.com" ||
    email?.toLowerCase() === "marika.vernon@yahoo.co.uk";

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

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteMemberAction(id);
    if (result.error) {
      setDeleteError(result.error);
      setIsDeleting(false);
    } else {
      setShowDeleteConfirm(false);
      setIsDeleted(true);
      router.refresh();
    }
  }

  if (isDeleted) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: "relative",
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
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={toggleRole}
                disabled={isLoading || isDeleting}
                title={currentRole === "ADMIN" ? "Demote to player" : "Promote to admin"}
                style={{
                  height: 32,
                  padding: "0 10px",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--line)",
                  background: "var(--surface-2)",
                  color: currentRole === "ADMIN" ? "var(--out)" : "var(--in)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: (isLoading || isDeleting) ? "not-allowed" : "pointer",
                  opacity: (isLoading || isDeleting) ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {currentRole === "ADMIN" ? "Demote" : "+ Admin"}
              </button>

              {!isProtectedAdmin && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading || isDeleting}
                  title={`Delete member ${name}`}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--r-sm)",
                    border: "1px solid color-mix(in srgb, var(--out) 25%, transparent)",
                    background: "color-mix(in srgb, var(--out) 8%, transparent)",
                    color: "var(--out)",
                    cursor: (isLoading || isDeleting) ? "not-allowed" : "pointer",
                    opacity: (isLoading || isDeleting) ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    transition: "all 0.15s ease",
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
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

      {showDeleteConfirm && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--r-lg)",
              padding: "24px 20px 20px",
              maxWidth: 360,
              width: "100%",
              border: "1px solid var(--line)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 20,
                color: "var(--ink)",
                marginBottom: 8,
              }}
            >
              Delete Member?
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: 13.5,
                color: "var(--muted)",
                marginBottom: 18,
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to remove <strong>{name}</strong> from the team? This will delete their profile and all their session RSVPs. This cannot be undone.
            </p>
            {deleteError && (
              <div
                style={{
                  background: "color-mix(in srgb, var(--out) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                  borderRadius: "var(--r-sm)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "var(--out)",
                  marginBottom: 14,
                }}
              >
                {deleteError}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--line)",
                  background: "var(--surface-2)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: "var(--r-md)",
                  border: "none",
                  background: "var(--out)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
