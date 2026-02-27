import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Hala Krasovská — Sportovní hala Plzeň-Bolevec";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "#1e40af",
            }}
          >
            K
          </div>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "24px" }}>
            Hala Krasovská
          </span>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Sportovní hala
        </h1>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Plzeň-Bolevec
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.8)",
            marginTop: "24px",
            lineHeight: 1.4,
          }}
        >
          Badminton · Florbal · Sauna · Bistro · E-shop
        </p>
        <p
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.5)",
            marginTop: "auto",
          }}
        >
          Krašovská 32 · halakrasovska.cz
        </p>
      </div>
    ),
    { ...size }
  );
}
