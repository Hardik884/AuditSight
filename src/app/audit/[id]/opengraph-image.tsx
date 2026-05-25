import { ImageResponse } from "next/og";
import { getAuditById } from "@/lib/audit-storage";
import { buildPublicAuditSummary } from "@/lib/public-audit";
import { formatCurrency } from "@/lib/metadata";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface AuditOgProps {
  params: { id: string };
}

export default async function OpenGraphImage({ params }: AuditOgProps) {
  const audit = await getAuditById(params.id);

  if (!audit) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px",
            background: "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1f2937 100%)",
            color: "#f8fafc",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: "48px", fontWeight: 700 }}>AuditSight</div>
          <div style={{ marginTop: "24px", fontSize: "28px", color: "#cbd5f5" }}>
            AI spend audit report
          </div>
        </div>
      ),
      size
    );
  }

  const summary = buildPublicAuditSummary(audit);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1f2937 100%)",
          color: "#f8fafc",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "0.08em" }}>
            AuditSight
          </div>
          <div
            style={{
              fontSize: "14px",
              padding: "8px 16px",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.18)",
              color: "#e0e7ff",
            }}
          >
            Executive AI Spend Audit
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "44px", fontWeight: 700 }}>{summary.headline}</div>
          <div style={{ fontSize: "20px", color: "#cbd5f5", maxWidth: "880px" }}>
            {summary.executiveInsight}
          </div>
        </div>

        <div style={{ display: "flex", gap: "24px" }}>
          <div
            style={{
              flex: 1,
              padding: "20px 24px",
              borderRadius: "16px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <div style={{ fontSize: "14px", color: "#94a3b8" }}>Optimization score</div>
            <div style={{ marginTop: "8px", fontSize: "26px", fontWeight: 700 }}>
              {summary.optimizationScore}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              padding: "20px 24px",
              borderRadius: "16px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <div style={{ fontSize: "14px", color: "#94a3b8" }}>Risk level</div>
            <div style={{ marginTop: "8px", fontSize: "26px", fontWeight: 700 }}>
              {summary.riskLevel}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              padding: "20px 24px",
              borderRadius: "16px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <div style={{ fontSize: "14px", color: "#94a3b8" }}>Projected annual savings</div>
            <div style={{ marginTop: "8px", fontSize: "26px", fontWeight: 700 }}>
              {formatCurrency(summary.annualSavings)}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
