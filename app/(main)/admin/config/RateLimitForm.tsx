"use client";

import { useState, useTransition } from "react";
import { resetRateLimitsAction, saveRateLimitsAction } from "@/lib/actions/config";
import type { AuthLimits } from "@/lib/authLimits";

interface FieldSpec {
  field: keyof AuthLimits;
  label: string;
  help: string;
  min: number;
  max: number;
}

interface Props {
  fields: FieldSpec[];
  defaults: AuthLimits;
  overrides: Partial<AuthLimits>;
  effective: AuthLimits;
}

/**
 * Admin console form for the sign-in rate limits.
 *
 * The values live in app_settings, so saving applies to the next sign-in attempt
 * with no redeploy; "Reset" removes the overrides and returns to whatever the
 * environment defines. Field metadata (labels, bounds) is passed in from the server
 * page — importing lib/authLimits here would pull the database client into the
 * browser bundle.
 */
export function RateLimitForm({ fields, defaults, overrides, effective }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((spec) => [spec.field, String(effective[spec.field])]))
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const hasOverrides = Object.keys(overrides).length > 0;

  function handleSave() {
    setError(null);
    setNotice(null);

    const parsed: Record<string, number> = {};
    for (const spec of fields) {
      const raw = (values[spec.field] ?? "").trim();
      const parsedValue = Number(raw);
      if (raw === "" || !Number.isInteger(parsedValue)) {
        setError(`${spec.label} must be a whole number.`);
        return;
      }
      parsed[spec.field] = parsedValue;
    }

    startTransition(async () => {
      try {
        const result = await saveRateLimitsAction(parsed);
        if (result.error) {
          setError(result.error);
          return;
        }
        setNotice("Saved — this applies to the next sign-in attempt.");
      } catch {
        setError("Could not save the limits. Please try again.");
      }
    });
  }

  function handleReset() {
    setError(null);
    setNotice(null);

    startTransition(async () => {
      try {
        const result = await resetRateLimitsAction();
        if (result.error) {
          setError(result.error);
          return;
        }
        setValues(
          Object.fromEntries(fields.map((spec) => [spec.field, String(defaults[spec.field])]))
        );
        setNotice("Reset to the configured defaults.");
      } catch {
        setError("Could not reset the limits. Please try again.");
      }
    });
  }

  return (
    <section className="page-shell" style={{ paddingBottom: 60 }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
          padding: 20,
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--ink)" }}>
          Sign-in limits
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", margin: "6px 0 16px", lineHeight: 1.5 }}>
          Throttles for password sign-in and login codes. A value of <strong>0</strong> refuses the very
          first attempt — a way to switch an entry point off, and an easy way to lock everyone out.
          Saving applies immediately; the environment values are the defaults.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {fields.map((spec) => {
            const isOverridden = overrides[spec.field] !== undefined;
            return (
              <div key={spec.field}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
                  <label
                    htmlFor={`limit-${spec.field}`}
                    style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "var(--ink)" }}
                  >
                    {spec.label}
                  </label>
                  {isOverridden && (
                    <span
                      style={{
                        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10.5,
                        color: "var(--brand)", background: "color-mix(in srgb, var(--brand) 12%, transparent)",
                        padding: "2px 7px", borderRadius: 5, letterSpacing: "0.04em",
                      }}
                    >
                      OVERRIDDEN
                    </span>
                  )}
                </div>
                <input
                  id={`limit-${spec.field}`}
                  type="number"
                  inputMode="numeric"
                  min={spec.min}
                  max={spec.max}
                  value={values[spec.field] ?? ""}
                  onChange={(event) => setValues((prev) => ({ ...prev, [spec.field]: event.target.value }))}
                  disabled={isPending}
                  style={{
                    width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
                    padding: "10px 12px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15,
                    color: "var(--ink)", background: "var(--surface-2)", outline: "none",
                  }}
                />
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.45 }}>
                  {spec.help} Default {defaults[spec.field]}, allowed {spec.min}–{spec.max}.
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div role="alert" style={{ marginTop: 14, color: "var(--out)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5 }}>
            {error}
          </div>
        )}
        {notice && (
          <div role="status" aria-live="polite" style={{ marginTop: 14, color: "var(--in)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5 }}>
            ✓ {notice}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            style={{
              flex: 1, height: 46, borderRadius: "var(--r-md)", border: "none",
              background: "var(--brand)", color: "#fff",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
              cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Saving…" : "Save limits"}
          </button>
          {hasOverrides && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              style={{
                height: 46, padding: "0 16px", borderRadius: "var(--r-md)",
                border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink)",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5,
                cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
              }}
            >
              Reset to defaults
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
