import { ImageResponse } from "next/og";

const font =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans TC", sans-serif';

function StatCard({
  bg,
  label,
  value,
}: {
  bg: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "16px 18px",
        borderRadius: 18,
        background: bg,
        color: "#0f172a",
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>
        {label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
        {value}
      </span>
    </div>
  );
}

function SubRow({ name, meta, price }: { name: string; meta: string; price: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 14px",
        borderRadius: 14,
        background: "#f8fafc",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
          {name}
        </span>
        <span style={{ fontSize: 12, color: "#64748b" }}>{meta}</span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
        {price}
      </span>
    </div>
  );
}

export function pwaScreenshotWideResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f1f5f9",
          padding: 36,
          fontFamily: font,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 26,
                fontWeight: 900,
              }}
            >
              S
            </div>
            <span style={{ fontSize: 30, fontWeight: 800, color: "#0f172a" }}>
              Subtrack
            </span>
          </div>
          <div
            style={{
              padding: "12px 22px",
              borderRadius: 9999,
              background: "linear-gradient(90deg, #6366f1, #a855f7)",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            新增訂閱
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
          <StatCard bg="#ffe4e6" label="每月支出" value="NT$2,729" />
          <StatCard bg="#ffedd5" label="每年支出" value="NT$32,748" />
          <StatCard bg="#dbeafe" label="下次扣款" value="Netflix · 4/24" />
          <StatCard bg="#ccfbf1" label="訂閱數量" value="4 項" />
        </div>

        <div style={{ display: "flex", gap: 20, flex: 1, minHeight: 0 }}>
          <div
            style={{
              flex: 1,
              background: "white",
              borderRadius: 22,
              padding: 22,
              boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 14,
              }}
            >
              我的訂閱
            </span>
            <SubRow
              name="Netflix"
              meta="娛樂 · 4 月 24 日"
              price="NT$330"
            />
            <SubRow
              name="Spotify"
              meta="音樂 · 4 月 30 日"
              price="NT$99"
            />
            <SubRow
              name="ChatGPT Plus"
              meta="工作 · 5 月 5 日"
              price="NT$620"
            />
          </div>
          <div
            style={{
              width: 300,
              background: "white",
              borderRadius: 22,
              padding: 22,
              boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 18,
              }}
            >
              分類支出
            </span>
            <div
              style={{
                width: "100%",
                height: 140,
                borderRadius: 18,
                background:
                  "linear-gradient(135deg, #dbeafe 0%, #e9d5ff 45%, #fce7f3 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#475569",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.12)",
                }}
              >
                月計
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "#3b82f6",
                  }}
                />
                <span style={{ fontSize: 13, color: "#475569" }}>工作 84%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "#f43f5e",
                  }}
                />
                <span style={{ fontSize: 13, color: "#475569" }}>娛樂 12%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "#a855f7",
                  }}
                />
                <span style={{ fontSize: 13, color: "#475569" }}>音樂 4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1280, height: 720 }
  );
}

export function pwaScreenshotNarrowResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f1f5f9",
          padding: 20,
          fontFamily: font,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              S
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
              Subtrack
            </span>
          </div>
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              background: "linear-gradient(90deg, #6366f1, #a855f7)",
              color: "white",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            新增
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <StatCard bg="#ffe4e6" label="每月支出" value="NT$2,729" />
          <StatCard bg="#ffedd5" label="每年支出" value="NT$32,748" />
          <StatCard bg="#dbeafe" label="下次扣款" value="Netflix" />
          <StatCard bg="#ccfbf1" label="訂閱數" value="4 項" />
        </div>

        <div
          style={{
            flex: 1,
            background: "white",
            borderRadius: 20,
            padding: 16,
            boxShadow: "0 6px 24px rgba(15,23,42,0.07)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            我的訂閱
          </span>
          <SubRow name="Netflix" meta="娛樂" price="NT$330" />
          <SubRow name="Spotify" meta="音樂" price="NT$99" />
          <SubRow name="ChatGPT Plus" meta="工作" price="NT$620" />
        </div>
      </div>
    ),
    { width: 390, height: 844 }
  );
}
