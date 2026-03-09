import React, { useRef, useState, useEffect } from "react";

export default function FaceVerification({ onVerify, isLoading }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState("");

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const initVideo = async () => {
    // Stop any existing stream first
    stopCamera();
    setError("");
    setIsReady(false);

    try {
      console.log("🎥 Requesting camera access...");
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Use front-facing camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log("✅ Stream obtained");
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("📺 Video loaded, playing...");
          videoRef.current.play().then(() => {
            console.log("🟢 Playing!");
            setIsReady(true);
            setError("");
          }).catch(err => {
            console.error("Play error:", err);
            setError("Failed to start video playback. Please try again.");
          });
        };
      }
    } catch (err) {
      console.error("❌ Camera error:", err);
      let errorMessage = "Camera access failed. ";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += "Please allow camera access in your browser settings and try again.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += "No camera found. Please connect a camera and try again.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += "Camera is being used by another application. Please close other apps using the camera and try again.";
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage += "Camera doesn't support required settings. Trying with default settings...";
        // Retry with simpler constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().then(() => {
                setIsReady(true);
                setError("");
              });
            };
          }
          return;
        } catch (fallbackErr) {
          errorMessage = "Camera access failed. Please check your camera permissions and try again.";
        }
      } else {
        errorMessage += err.message || "Unknown error occurred.";
      }
      
      setError(errorMessage);
      setIsReady(false);
    }
  };

  useEffect(() => {
    initVideo();

    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !isReady) return;
    
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      
      // Draw the video frame to canvas
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convert to base64 image
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageData);
      
      // Stop camera after capture
      stopCamera();
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture photo. Please try again.");
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsReady(false);
    setError("");
    // Reinitialize camera instead of reloading page
    setTimeout(() => {
      initVideo();
    }, 100);
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937" }}>📷 Face Verification</h2>
        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>Position your face in the frame and capture a clear photo</p>
        <p style={{ fontSize: "12px", color: "#dc2626", fontWeight: "600", marginTop: "4px" }}>* Face verification is mandatory for authentication</p>
      </div>

      {error && (
        <div style={{ marginBottom: "16px", padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "14px", color: "#991b1b" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>❌</span>
            <div style={{ flex: 1 }}>
              <strong style={{ display: "block", marginBottom: "8px" }}>Camera Error</strong>
              <p style={{ margin: 0, marginBottom: "12px" }}>{error}</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button 
                  onClick={retakePhoto} 
                  style={{ 
                    padding: "8px 16px", 
                    background: "#dc2626", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "6px", 
                    cursor: "pointer", 
                    fontWeight: "600",
                    fontSize: "13px"
                  }}
                >
                  🔄 Retry Camera
                </button>
                <button 
                  onClick={() => {
                    stopCamera();
                    setTimeout(() => initVideo(), 500);
                  }} 
                  style={{ 
                    padding: "8px 16px", 
                    background: "white", 
                    color: "#991b1b", 
                    border: "1px solid #dc2626", 
                    borderRadius: "6px", 
                    cursor: "pointer", 
                    fontWeight: "600",
                    fontSize: "13px"
                  }}
                >
                  🔧 Reset Camera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "relative", background: "#111827", borderRadius: "10px", overflow: "hidden", aspectRatio: "4/3", marginBottom: "16px" }}>
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay={true}
              playsInline={true}
              muted={true}
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
          <button onClick={capturePhoto} disabled={!isReady}
            style={{ width: "100%", padding: "12px", background: isReady ? "#2563eb" : "#93c5fd", color: "white", fontWeight: "600", border: "none", borderRadius: "8px", cursor: isReady ? "pointer" : "not-allowed", fontSize: "15px" }}>
            {isReady ? "📸 Capture Face Photo" : "Starting Camera..."}
          </button>
        ) : (
          <>
            <button onClick={() => onVerify(capturedImage)} disabled={isLoading}
              style={{ width: "100%", padding: "12px", background: "#16a34a", color: "white", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}>
              {isLoading ? "Verifying..." : "✅ Verify Face"}
            </button>
            <button onClick={retakePhoto} disabled={isLoading}
              style={{ width: "100%", padding: "12px", background: "white", color: "#374151", fontWeight: "600", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}>
              🔄 Retake Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}