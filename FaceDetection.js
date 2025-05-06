import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [expressionEnabled, setExpressionEnabled] = useState(true);

  useEffect(() => {
    startVideo();
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Error accessing webcam: ', err));
  };

  const loadModels = async () => {
    const MODEL_URL = '/models'; // put models inside public/models
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  const startDetection = () => {
    setIsDetecting(true);
    detectFaceLoop();
  };

  const stopDetection = () => {
    setIsDetecting(false);
  };

  const detectFaceLoop = async () => {
    const options = new faceapi.TinyFaceDetectorOptions();
    while (isDetecting) {
      if (videoRef.current && canvasRef.current) {
        const result = await faceapi.detectAllFaces(videoRef.current, options)
          .withFaceExpressions();

        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
        const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
        const resizedResults = faceapi.resizeResults(result, dims);

        canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        faceapi.draw.drawDetections(canvasRef.current, resizedResults);
        if (expressionEnabled) {
          faceapi.draw.drawFaceExpressions(canvasRef.current, resizedResults);
        }
      }
      await new Promise(r => setTimeout(r, 100)); // wait for 100ms
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Face Detection + Expression Recognition</h2>
      <video ref={videoRef} autoPlay muted width="640" height="480" style={{ border: '1px solid black' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0 ,left:60}} />

      <div style={{ marginTop: 10 }}>
        <button onClick={startDetection}>Start Detection</button>
        <button onClick={stopDetection}>Stop Detection</button>
        <button onClick={() => setExpressionEnabled(!expressionEnabled)}>
          {expressionEnabled ? 'Hide Expressions' : 'Show Expressions'}
        </button>
      </div>
    </div>
  );
};

export default FaceDetection;
