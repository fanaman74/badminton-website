"use client";

import { useState } from "react";
import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";

interface ProfileEditFormProps {
  name: string;
  email: string;
  userId: string;
  isAdmin: boolean;
}

export function ProfileEditForm({
  name: initialName,
  email: initialEmail,
  userId,
  isAdmin,
}: ProfileEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    undefined
  );

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSuccess = () => {
    if (state?.success) {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-lg)",
          padding: 20,
          border: "1px solid var(--line)",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.20)",
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--ink)", marginBottom: 16 }}>
          Edit Profile
        </div>

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              htmlFor="name"
              style={{
                display: "block",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--ink)",
                marginBottom: 6,
              }}
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={initialName}
              required
              style={{
                width: "100%",
                borderRadius: "var(--r-sm)",
                border: "1.5px solid var(--line)",
                padding: "11px 13px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: 15,
                color: "var(--ink)",
                background: "var(--surface-2)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--ink)",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={initialEmail}
              required
              style={{
                width: "100%",
                borderRadius: "var(--r-sm)",
                border: "1.5px solid var(--line)",
                padding: "11px 13px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: 15,
                color: "var(--ink)",
                background: "var(--surface-2)",
                outline: "none",
              }}
            />
          </div>

          {state?.error && (
            <div
              style={{
                background: "color-mix(in srgb, var(--out) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                borderRadius: "var(--r-sm)",
                padding: "10px 14px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--out)",
              }}
            >
              {state.error}
            </div>
          )}

          {state?.success && (
            <div
              style={{
                background: "color-mix(in srgb, var(--in) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--in) 30%, transparent)",
                borderRadius: "var(--r-sm)",
                padding: "10px 14px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--in)",
              }}
            >
              ✓ Profile updated!
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              style={{
                flex: 1,
                height: 40,
                borderRadius: "var(--r-md)",
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--ink)",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 13,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                flex: 1,
                height: 40,
                borderRadius: "var(--r-md)",
                border: "none",
                background: "var(--brand)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 13,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--r-lg)",
        padding: 20,
        border: "1px solid var(--line)",
        boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.20)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            flexShrink: 0,
            background: `hsl(${(userId.charCodeAt(0) * 47) % 360}, 60%, 55%)`,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          {initialName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--ink)",
              lineHeight: 1.1,
            }}
          >
            {initialName}
          </div>
          {initialEmail && (
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 12.5,
                color: "var(--muted)",
                marginTop: 4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {initialEmail}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: "var(--r-sm)",
            background: "var(--accent)",
            color: "var(--accent-ink)",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 12.5,
            marginBottom: 16,
            width: "fit-content",
          }}
        >
          ⚙️ Admin
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        style={{
          width: "100%",
          height: 48,
          borderRadius: "var(--r-md)",
          border: "none",
          background: "var(--brand)",
          color: "#fff",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 16,
          cursor: "pointer",
          boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
          marginBottom: 10,
        }}
      >
        Edit profile
      </button>
    </div>
  );
}
