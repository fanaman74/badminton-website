export interface SessionPerson {
  id: string;
  name: string;
}

const MAX_NAMES_SHOWN = 8;

function initialsOf(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/** Same hue derivation as the session detail page, so a member keeps one colour. */
function avatarColor(id: string) {
  return `hsl(${(id.charCodeAt(0) * 47) % 360}, 60%, 55%)`;
}

/**
 * Names of the members who are going, as initials avatars with first names.
 * Renders nothing when the list is empty. Up to 8 names are shown; the rest
 * collapse into a "+N more" chip, while the full list stays available to
 * assistive tech through the accessible list label.
 */
export function GoingNames({
  people,
  viewerId,
}: {
  people: SessionPerson[];
  viewerId?: string | null;
}) {
  if (people.length === 0) return null;

  const label = (p: SessionPerson) => (viewerId && p.id === viewerId ? "You" : p.name);
  const shown = people.slice(0, MAX_NAMES_SHOWN);
  const hiddenCount = people.length - shown.length;

  return (
    <div
      role="list"
      aria-label={`Going: ${people.map(label).join(", ")}`}
      style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}
    >
      {shown.map((p) => {
        const isYou = Boolean(viewerId) && p.id === viewerId;
        return (
          <span
            key={p.id}
            role="listitem"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "2px 9px 2px 2px", borderRadius: 999,
              background: "var(--surface-2)", border: "1px solid var(--line)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                background: avatarColor(p.id), color: "#fff",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 9.5,
              }}
            >
              {initialsOf(p.name)}
            </span>
            <span style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
              color: isYou ? "var(--brand)" : "var(--ink)",
            }}>
              {isYou ? "You" : p.name.split(" ")[0]}
            </span>
          </span>
        );
      })}
      {hiddenCount > 0 && (
        <span
          role="listitem"
          style={{
            display: "inline-flex", alignItems: "center", padding: "4px 9px",
            borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5, color: "var(--muted)",
          }}
        >
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}
