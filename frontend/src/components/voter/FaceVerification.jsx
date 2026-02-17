import React, { useRef, useState, useEffect, useCallback } from "react";

export default function FaceVerification({ onVerify, isLoading }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState("");

  // Callback ref - attaches stream the moment video element exists
  const setVideoRef = useCallback((node) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
    }
  }, []);

  useEffect(() => {
    let active = true;
    console.log("🎥 FaceVerification mounted");

    const startCam = async () => {
      try {
        // Stop any old stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }

        console.log("📹 Getting camera...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        console.log("✅ Stream ready:", stream);

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        // Attach to video element if already mounted
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("📺 Stream attached to video");
        }

      } catch (e) {
        console.error("❌ Camera error:", e);
        if (active) setError("Camera error: " + e.message);
      }
    };

    startCam();

    return () => {
      active = false;
      console.log("🛑 Cleanup - stopping stream");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageData);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsReady(false);
    setError("");
    window.location.reload();
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>

      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937" }}>
          📷 Face Verification
        </h2>
        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
          Position your face in the frame and capture a clear photo
        </p>
        <p style={{ fontSize: "12px", color: "#dc2626", fontWeight: "600", marginTop: "4px" }}>
          * Face verification is mandatory for authentication
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "14px", color: "#991b1b" }}>
          ❌ {error}
          <button onClick={retakePhoto} style={{ marginLeft: "8px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontWeight: "bold" }}>
            Retry
          </button>
        </div>
      )}

      <div style={{ position: "relative", background: "#111827", borderRadius: "10px", overflow: "hidden", aspectRatio: "4/3", marginBottom: "16px" }}>
        {!capturedImage ? (
          <>
            <video
              ref__={setVideoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={() => {
                console.log("🟢 onCanPlay fired - video is ready!");
                setIsReady(true);
              }}
              onLoadedMetadata={() => {
                console.log("📐 onLoadedMetadata fired");
                if (videoRef.current) videoRef.current.play();
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: "block" }}
            />
            {!isReady && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#111827" }}>
                <span style={{ color: "white", fontSize: "14px" }}>Loading camera...</span>
              </div>
            )}
            {isReady && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ width: "180px", height: "180px", border: "4px solid #22c55e", borderRadius: "50%", opacity: 0.6 }} />
              </div>
            )}
          </>
        ) : (
          <img src={capturedImage} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {!capturedImage ? (
          <button
            onClick={capturePhoto}
            disabled={!isReady}
            style={{ width: "100%", padding: "12px", background: isReady ? "#2563eb" : "#93c5fd", color: "white", fontWeight: "600", border: "none", borderRadius: "8px", cursor: isReady ? "pointer" : "not-allowed", fontSize: "15px" }}
          >
            {isReady ? "📸 Capture Face Photo" : "Starting Camera..."}
          </button>
        ) : (
          <>
            <button
              onClick={() => onVerify(capturedImage)}
              disabled={isLoading}
              style={{ width: "100%", padding: "12px", background: "#16a34a", color: "white", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
            >
              {isLoading ? "Verifying..." : "✅ Verify Face"}
            </button>
            <button
              onClick={retakePhoto}
              disabled={isLoading}
              style={{ width: "100%", padding: "12px", background: "white", color: "#374151", fontWeight: "600", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
            >
              🔄 Retake Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}