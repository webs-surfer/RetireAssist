import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, CheckCircle } from 'lucide-react';

export default function PhotoCapture({ onCapture, capturedPhoto }) {
    const [streaming, setStreaming] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [error, setError] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Once the video element is rendered and we have a stream, attach it
    useEffect(() => {
        if (streaming && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play().then(() => setCameraReady(true)).catch(() => {});
            };
        }
    }, [streaming]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const startCamera = useCallback(async () => {
        setError('');
        setCameraReady(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
            });
            streamRef.current = stream;
            setStreaming(true); // This triggers re-render → video element mounts → useEffect attaches stream
        } catch (err) {
            setError(
                err.name === 'NotAllowedError'
                    ? 'Camera access denied. Please allow camera in your browser settings.'
                    : 'Could not access camera. Please check your device.'
            );
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setStreaming(false);
        setCameraReady(false);
    }, []);

    const capture = useCallback(() => {
        const v = videoRef.current;
        if (!v || !v.videoWidth || !v.videoHeight) return;

        const canvas = document.createElement('canvas');
        const size = Math.min(v.videoWidth, v.videoHeight);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Mirror horizontally to match the preview, then center-crop
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
        const sx = (v.videoWidth - size) / 2;
        const sy = (v.videoHeight - size) / 2;
        ctx.drawImage(v, sx, sy, size, size, 0, 0, size, size);

        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        stopCamera();
        onCapture(base64);
    }, [onCapture, stopCamera]);

    const retake = useCallback(() => {
        onCapture(null);
        startCamera();
    }, [onCapture, startCamera]);

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Preview Area */}
            <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-4 border-border bg-gray-100 flex items-center justify-center">
                {capturedPhoto ? (
                    <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                ) : streaming ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                ) : (
                    <div className="text-center p-4">
                        <Camera size={40} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-text-muted">Your photo will appear here</p>
                    </div>
                )}
                {capturedPhoto && (
                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle size={14} className="text-white" />
                    </div>
                )}
            </div>

            {/* Controls */}
            {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg text-center">{error}</p>
            )}

            {capturedPhoto ? (
                <button
                    type="button"
                    onClick={retake}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-border text-sm font-semibold text-text-dark hover:border-primary transition-all cursor-pointer bg-white"
                >
                    <RotateCcw size={14} /> Retake Photo
                </button>
            ) : streaming ? (
                <button
                    type="button"
                    onClick={capture}
                    disabled={!cameraReady}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-all border-none disabled:opacity-50"
                >
                    <Camera size={14} /> {cameraReady ? 'Capture' : 'Starting...'}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-all border-none"
                >
                    <Camera size={14} /> Open Camera
                </button>
            )}
        </div>
    );
}
