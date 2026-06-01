"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { addCommentAction, deleteCommentAction } from "@/lib/actions/comments";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author: { name: string } | null;
}

interface Props {
  sessionId: string;
  comments: Comment[];
  isAdmin: boolean;
  currentUserId: string;
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function SessionComments({ sessionId, comments, isAdmin, currentUserId }: Props) {
  const [state, formAction, isPending] = useActionState(addCommentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea on successful submit
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <div style={{
      background: "var(--surface)", borderRadius: "var(--r-lg)",
      border: "1px solid var(--line)",
      boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.20)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px 12px",
        borderBottom: comments.length > 0 ? "1px solid var(--line)" : "none",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--brand)"
          strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span style={{
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
          letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--faint)",
        }}>
          Admin Notes
        </span>
        {comments.length > 0 && (
          <span style={{
            marginLeft: "auto",
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12,
            color: "var(--muted)",
          }}>{comments.length}</span>
        )}
      </div>

      {/* Comment list */}
      {comments.length > 0 && (
        <div style={{ padding: "4px 0" }}>
          {comments.map((c, i) => (
            <CommentRow
              key={c.id}
              comment={c}
              isAdmin={isAdmin}
              sessionId={sessionId}
              isLast={i === comments.length - 1}
            />
          ))}
        </div>
      )}

      {/* Empty state for non-admins */}
      {comments.length === 0 && !isAdmin && (
        <div style={{
          padding: "20px 16px", textAlign: "center",
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
          color: "var(--faint)",
        }}>
          No notes yet
        </div>
      )}

      {/* Admin compose box */}
      {isAdmin && (
        <div style={{
          padding: "12px 16px",
          borderTop: comments.length > 0 ? "1px solid var(--line)" : "none",
          background: "var(--surface-2)",
        }}>
          <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input type="hidden" name="session_id" value={sessionId} />
            <textarea
              name="body"
              placeholder="Add a note for the team… e.g. bring bibs, parking info, changed court"
              required
              maxLength={1000}
              rows={3}
              style={{
                width: "100%", borderRadius: "var(--r-sm)",
                border: "1.5px solid var(--line)",
                padding: "10px 12px",
                fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
                color: "var(--ink)", background: "var(--surface)",
                outline: "none", resize: "vertical",
                lineHeight: 1.5,
              }}
            />

            {state?.error && (
              <div style={{
                background: "color-mix(in srgb, var(--out) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                borderRadius: "var(--r-sm)", padding: "8px 12px",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: "var(--out)",
              }}>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                alignSelf: "flex-end",
                height: 38, padding: "0 18px",
                borderRadius: "var(--r-md)", border: "none",
                background: "var(--brand)", color: "#fff",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.6 : 1,
              }}
            >
              {isPending ? "Posting…" : "Post note"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function CommentRow({
  comment, isAdmin, sessionId, isLast,
}: {
  comment: Comment;
  isAdmin: boolean;
  sessionId: string;
  isLast: boolean;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this note?")) return;
    setDeleting(true);
    await deleteCommentAction(comment.id, sessionId);
    setDeleting(false);
  }

  return (
    <div style={{
      padding: "12px 16px",
      borderBottom: isLast ? "none" : "1px solid var(--line)",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      {/* Author + time row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: "var(--brand)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11,
        }}>
          {(comment.author?.name ?? "A").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
            color: "var(--ink)",
          }}>
            {comment.author?.name ?? "Admin"}
          </span>
          <span style={{
            fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11.5,
            color: "var(--faint)", marginLeft: 8,
          }}>
            {timeAgo(comment.created_at)}
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete note"
            style={{
              width: 28, height: 28, borderRadius: "var(--r-sm)",
              border: "none", background: "transparent",
              color: "var(--faint)", cursor: deleting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, opacity: deleting ? 0.4 : 1,
              flexShrink: 0,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{
        fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
        color: "var(--ink)", lineHeight: 1.55,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        paddingLeft: 36,
      }}>
        {comment.body}
      </div>
    </div>
  );
}

