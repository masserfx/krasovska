import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function createOgImage(
  title: string,
  subtitle: string,
  accent: string = "#f59e0b",
) {
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
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "#1e40af",
            }}
          >
            K
          </div>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "22px" }}>
            Hala Krasovská
          </span>
        </div>
        <div
          style={{
            width: "80px",
            height: "4px",
            background: accent,
            borderRadius: "2px",
            marginBottom: "24px",
          }}
        />
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            margin: 0,
            maxWidth: "900px",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "26px",
            color: "rgba(255,255,255,0.75)",
            marginTop: "20px",
            lineHeight: 1.4,
            maxWidth: "800px",
          }}
        >
          {subtitle}
        </p>
        <p
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.4)",
            marginTop: "auto",
          }}
        >
          Krašovská 32, Plzeň-Bolevec · halakrasovska.cz
        </p>
      </div>
    ),
    { ...ogSize }
  );
}
