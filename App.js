import React, { useRef, useEffect, useState } from "react";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";


function App() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Detecting...");

  useEffect(() => {
    // Access webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing webcam:", err));
    const logEventToServer = async (event) => {
        try {
            const response = await fetch("http://localhost:5000/log", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    event: event,
                    time: new Date().toISOString(),
                }),
            });
            const data = await response.json();
            if (data.success) {
                console.log("Event logged successfully:", event);
            }
        } catch (err) {
            console.error("Error logging event:", err);
        }
    };
    // Load face detector
    const runFaceDetection = async () => {
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig = {
        runtime: "tfjs",
        modelType: "short"
      };
      const detector = await faceDetection.createDetector(model, detectorConfig);

      setInterval(async () => {
        if (videoRef.current) {
          const faces = await detector.estimateFaces(videoRef.current);

          if (faces.length === 0) {
            setStatus("❌ No face detected");
          } else if (faces.length > 1) {
            setStatus("⚠️ Multiple faces detected!");
          } else {
            setStatus("✅ Candidate is focused");
          }
    const runObjectDetection = async () => {
    const objectDetector = await cocoSsd.load();
    const predictions = await objectDetector.detect(videoRef.current);
    predictions.forEach(prediction => {
                if (prediction.class === 'cell phone' || prediction.class === 'book') {
                    setStatus(`⚠️ ${prediction.class} detected!`);
                    // Log this event to the backend
                    logEventToServer(`${prediction.class} detected`);
                }
            });
    }
        }
      }, 1000);
    };

    runFaceDetection();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Interview Screen</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: "640px", height: "480px", border: "2px solid black" }} />
      
      <h3 style={{ marginTop: "20px" }}>{status}</h3>
    </div>
  );
}

export default App;
