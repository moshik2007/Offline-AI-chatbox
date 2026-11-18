import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Check,
  Trash2,
  AlertCircle,
  SwitchCamera,
} from 'lucide-react';
import { ImageAttachment } from '../types';
import { VisionService } from '../services/visionService';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachImage: (attachment: ImageAttachment) => void;
  existingAttachment: ImageAttachment | null;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onAttachImage,
  existingAttachment,
}) => {
  const [mode, setMode] = useState<'camera' | 'preview'>(
    existingAttachment ? 'preview' : 'camera'
  );
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [previewAttachment, setPreviewAttachment] = useState<ImageAttachment | null>(
    existingAttachment
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCameraStream = useCallback(
    async (requestedFacing: 'environment' | 'user') => {
      stopCameraStream();
      setErrorMsg(null);

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setErrorMsg(
          'Camera API is unavailable in this browser context. You can still upload an image from your gallery.'
        );
        return;
      }

      setIsStartingCamera(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: requestedFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err: unknown) {
        const name = err instanceof Error ? err.name : '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setErrorMsg(
            'Camera permission was denied. Please allow camera access in browser settings or upload an image from your gallery.'
          );
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          setErrorMsg(
            'No camera hardware was detected on this device. Use "Upload from Gallery" below.'
          );
        } else {
          setErrorMsg(
            `Could not start camera: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      } finally {
        setIsStartingCamera(false);
      }
    },
    [stopCameraStream]
  );

  useEffect(() => {
    if (isOpen) {
      if (existingAttachment) {
        setPreviewAttachment(existingAttachment);
        setMode('preview');
      } else {
        setPreviewAttachment(null);
        setMode('camera');
        startCameraStream(facingMode);
      }
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen, existingAttachment, facingMode, startCameraStream, stopCameraStream]);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setErrorMsg(null);
    try {
      const captured = await VisionService.captureVideoFrame(videoRef.current);
      stopCameraStream();
      setPreviewAttachment(captured);
      setMode('preview');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorMsg(null);
    try {
      const processed = await VisionService.processFileToAttachment(file);
      stopCameraStream();
      setPreviewAttachment(processed);
      setMode('preview');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRetake = () => {
    setPreviewAttachment(null);
    setErrorMsg(null);
    setMode('camera');
    startCameraStream(facingMode);
  };

  const handleSwitchCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    if (mode === 'camera') {
      startCameraStream(next);
    }
  };

  const handleConfirm = () => {
    if (!previewAttachment) return;
    onAttachImage(previewAttachment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Camera and Image Question Assistant"
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Camera &amp; Image Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Capture exam papers, math problems, code, or diagrams locally
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close camera assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            {mode === 'camera' ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isStartingCamera && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-xs text-slate-300">
                    Starting camera...
                  </div>
                )}
                {!isStartingCamera && !streamRef.current && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 gap-2">
                    <Camera className="w-8 h-8 opacity-40" />
                    <span>Camera preview unavailable. Upload an image from your gallery below.</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-slate-900/75 hover:bg-slate-800 text-white border border-white/15 cursor-pointer transition-colors"
                  title="Switch front/back camera"
                  aria-label="Switch camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </>
            ) : previewAttachment ? (
              <img
                src={previewAttachment.dataUrl}
                alt={previewAttachment.fileName}
                className="w-full h-full object-contain bg-slate-950"
              />
            ) : null}
          </div>

          {previewAttachment && mode === 'preview' && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span className="truncate font-medium">{previewAttachment.fileName}</span>
              <span className="font-mono tabular-nums shrink-0">
                {previewAttachment.width}×{previewAttachment.height} ·{' '}
                {(previewAttachment.sizeBytes / 1024).toFixed(0)} KB
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>Upload from Gallery</span>
            </button>

            <div className="flex items-center gap-2">
              {mode === 'camera' ? (
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={!streamRef.current}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewAttachment(null);
                      setMode('camera');
                      startCameraStream(facingMode);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Use Photo</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
