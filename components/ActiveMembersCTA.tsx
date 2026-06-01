import Link from "next/link";

interface ActiveMembersCTAProps {
  memberCount: number;
}

export function ActiveMembersCTA({ memberCount }: ActiveMembersCTAProps) {
  return (
    <div style={{ padding: "8px 16px 24px" }}>
      <div style={{
        background: "linear-gradient(110deg, #060C1C 0%, #0a1628 60%, #060C1C 100%)",
        border: "1px solid rgba(198,240,60,0.15)",
        borderRadius: 14,
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 28,
            color: "#C6F03C",
            lineHeight: 1,
            marginBottom: 6,
          }}>
            {memberCount}+ Members
          </div>
          <div style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: 14,
            color: "rgba(255,255,255,0.55)",
          }}>
            Join VUB Smashers
          </div>
        </div>
        <Link
          href="/team"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 999,
            background: "#C6F03C",
            color: "#060C1C",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          View Team →
        </Link>
      </div>
    </div>
  );
}
