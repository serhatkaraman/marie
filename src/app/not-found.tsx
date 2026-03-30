export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Georgia, serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          margin: 0,
          color: "#222",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "4rem", marginBottom: "0.5rem", fontWeight: "normal" }}>
            404
          </h1>
          <p style={{ color: "#999" }}>Page not found</p>
        </div>
      </body>
    </html>
  );
}
