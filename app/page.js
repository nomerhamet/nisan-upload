"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// QRCode bileşenini SSR dışında yükle
const QRCode = dynamic(() => import("qrcode.react"), { ssr: false });

export default function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus("Lütfen bir fotoğraf seçin.");
      return;
    }

    setStatus("Yükleniyor...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("Fotoğraf başarıyla yüklendi! ID: " + data.fileId);
        setUploadedUrl(URL.createObjectURL(file));
      } else {
        setStatus("Hata: " + data.error);
        setUploadedUrl("");
      }
    } catch (err) {
      setStatus("Hata: " + err.message);
      setUploadedUrl("");
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Fotoğraf Yükleme</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" style={{ marginLeft: "1rem" }}>Yükle</button>
      </form>

      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}

      {uploadedUrl && (
        <div style={{ marginTop: "1rem" }}>
          <p>Önizleme:</p>
          <img src={uploadedUrl} alt="Yüklenen foto" style={{ maxWidth: "300px" }} />
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <p>QR kodu tarayarak siteye ulaşabilirsiniz:</p>
        <QRCode value={typeof window !== "undefined" ? window.location.href : ""} />
      </div>
    </main>
  );
}
