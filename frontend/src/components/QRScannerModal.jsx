import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, AlertCircle, Loader2, ImageUp, ScanLine, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─── Scan line animation ───────────────────────────────────────── */
const ScanAnimation = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {['top-3 left-3 border-t-[3px] border-l-[3px] rounded-tl-lg',
            'top-3 right-3 border-t-[3px] border-r-[3px] rounded-tr-lg',
            'bottom-3 left-3 border-b-[3px] border-l-[3px] rounded-bl-lg',
            'bottom-3 right-3 border-b-[3px] border-r-[3px] rounded-br-lg',
        ].map((cls, i) => (
            <div key={i} className={`absolute w-7 h-7 border-violet-400 ${cls}`} />
        ))}
        <motion.div
            className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent rounded-full shadow-[0_0_8px_2px_rgba(139,92,246,0.7)]"
            initial={{ top: '8%' }}
            animate={{ top: '92%' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        />
    </div>
);

/* ─── QR decode helpers ─────────────────────────────────────────── */
const hasBarcodeDetector = () =>
    typeof window !== 'undefined' && 'BarcodeDetector' in window;

async function decodeQR(source) {
    if (hasBarcodeDetector()) {
        try {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const codes = await detector.detect(source);
            if (codes.length > 0) return codes[0].rawValue;
        } catch { /* fall through */ }
    }
    const { default: jsQR } = await import('jsqr');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (source instanceof HTMLVideoElement) {
        canvas.width = source.videoWidth;
        canvas.height = source.videoHeight;
        ctx.drawImage(source, 0, 0);
    } else if (source instanceof ImageBitmap || source instanceof HTMLImageElement) {
        canvas.width = source.width || source.naturalWidth;
        canvas.height = source.height || source.naturalHeight;
        ctx.drawImage(source, 0, 0);
    } else {
        return null;
    }
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: 'dontInvert',
    });
    return code?.data ?? null;
}

function extractUsername(raw) {
    try {
        const url = new URL(raw);
        const m = url.pathname.match(/^\/portal\/store\/([^/]+)/);
        return m?.[1] ?? null;
    } catch {
        return null;
    }
}

/* ─── Navigate helper — full page to avoid React teardown crash ─── */
function gotoStore(username) {
    toast.success(`Opening @${username}'s store…`);
    window.location.href = `/portal/store/${username}`;
}

/* ═══════════════════════════════════════════════════════════════════
   Main modal
═══════════════════════════════════════════════════════════════════ */
const QRScannerModal = ({ onClose }) => {
    const [tab, setTab] = useState('camera');
    const [camStatus, setCamStatus] = useState('loading');
    const [camError, setCamError] = useState('');
    const [uploadState, setUploadState] = useState('idle');
    const [uploadMsg, setUploadMsg] = useState('');

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);
    const mountedRef = useRef(true);
    const fileRef = useRef(null);

    /* ── Decoded callback ── */
    const onDecoded = useCallback((raw) => {
        const username = extractUsername(raw);
        if (!username) return null;
        stopCamera();
        gotoStore(username);   // full page redirect — no React crash
        return username;
    }, []);

    /* ── Stop camera ── */
    const stopCamera = () => {
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    };

    /* ── Scan RAF loop ── */
    const scanFrame = useCallback(async () => {
        if (!mountedRef.current || !videoRef.current) return;
        const video = videoRef.current;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            try {
                const raw = await decodeQR(video);
                if (raw && onDecoded(raw)) return;
            } catch { /* ignore frame errors */ }
        }
        if (mountedRef.current) rafRef.current = requestAnimationFrame(scanFrame);
    }, [onDecoded]);

    /* ── Start camera ── */
    const startCamera = useCallback(async () => {
        setCamStatus('loading');
        setCamError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCamStatus('scanning');
            rafRef.current = requestAnimationFrame(scanFrame);
        } catch (err) {
            if (!mountedRef.current) return;
            setCamError(
                err.name === 'NotAllowedError' ? 'Camera permission denied. Please allow camera access in browser settings.'
                    : err.name === 'NotFoundError' ? 'No camera found on this device.'
                        : 'Could not start camera. Try the "Upload Image" tab instead.'
            );
            setCamStatus('error');
        }
    }, [scanFrame]);

    /* ── Lifecycle ── */
    useEffect(() => {
        mountedRef.current = true;
        if (tab === 'camera') startCamera();
        return () => {
            mountedRef.current = false;
            stopCamera();
        };
    }, [tab, startCamera]);

    /* ── Image upload ── */
    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadState('scanning');
        setUploadMsg('');
        try {
            const bitmap = await createImageBitmap(file);
            const raw = await decodeQR(bitmap);
            if (!raw) throw new Error('No QR found');
            const username = extractUsername(raw);
            if (!username) {
                setUploadState('error');
                setUploadMsg("QR found but it's not a store code. Use a QR from an admin dashboard.");
                return;
            }
            setUploadState('success');
            setUploadMsg(`Found @${username}'s store!`);
            setTimeout(() => gotoStore(username), 700);
        } catch {
            setUploadState('error');
            setUploadMsg('No QR code detected. Try a higher-resolution screenshot taken closer to the QR.');
        } finally {
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    /* ─── Render ──────────────────────────────────────────────────── */
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <ScanLine size={20} /><span className="font-bold">Scan Store QR Code</span>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/25 rounded-full transition-colors" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {[
                        { id: 'camera', icon: Camera, label: 'Live Camera' },
                        { id: 'upload', icon: ImageUp, label: 'Upload Image' },
                    ].map(t => (
                        <button key={t.id}
                            onClick={() => {
                                if (tab === t.id) return;
                                stopCamera();
                                setCamStatus('loading');
                                setUploadState('idle');
                                setTab(t.id);
                            }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors
                ${tab === t.id ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/40' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <t.icon size={15} /> {t.label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {/* CAMERA */}
                    {tab === 'camera' && (
                        <>
                            {camStatus === 'error' && (
                                <div className="flex flex-col items-center py-6 text-center gap-3">
                                    <AlertCircle size={44} className="text-red-400" />
                                    <p className="text-sm text-gray-600">{camError}</p>
                                    <button onClick={() => setTab('upload')}
                                        className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
                                        Try Upload Instead
                                    </button>
                                </div>
                            )}
                            <div className={camStatus === 'error' ? 'hidden' : 'block'}>
                                <div className="relative rounded-2xl overflow-hidden bg-black mb-3">
                                    {camStatus === 'loading' && (
                                        <div className="flex items-center justify-center" style={{ height: 220 }}>
                                            <Loader2 size={32} className="animate-spin text-violet-400" />
                                        </div>
                                    )}
                                    <video ref={videoRef} muted playsInline autoPlay
                                        className="w-full object-cover"
                                        style={{ maxHeight: 300, display: camStatus === 'scanning' ? 'block' : 'none' }}
                                    />
                                    {camStatus === 'scanning' && <ScanAnimation />}
                                </div>
                                {camStatus === 'scanning' && (
                                    <p className="text-center text-xs text-violet-600 flex items-center justify-center gap-1.5">
                                        <motion.span className="inline-block w-2 h-2 rounded-full bg-violet-500"
                                            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                                        Point camera at an admin's store QR code
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* UPLOAD */}
                    {tab === 'upload' && (
                        <div className="flex flex-col items-center gap-3 py-2">
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile}
                                className="hidden" id="qr-upload-input" />
                            <label htmlFor="qr-upload-input"
                                className={`w-full cursor-pointer flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-9 px-5 transition-all
                  ${uploadState === 'error' ? 'border-red-300 bg-red-50'
                                        : uploadState === 'success' ? 'border-green-400 bg-green-50'
                                            : 'border-violet-300 hover:border-violet-500 hover:bg-violet-50/60'}`}
                            >
                                {uploadState === 'scanning' && <><Loader2 size={38} className="text-violet-500 animate-spin" /><p className="text-sm font-semibold text-violet-600">Detecting QR code…</p></>}
                                {uploadState === 'success' && <><CheckCircle2 size={38} className="text-green-500" /><p className="text-sm font-semibold text-green-600">{uploadMsg}</p></>}
                                {uploadState === 'error' && <><AlertCircle size={38} className="text-red-400" /><p className="text-sm font-semibold text-red-500">Try again</p></>}
                                {uploadState === 'idle' && (
                                    <>
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                                            <ImageUp size={28} className="text-violet-600" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700">Click to upload QR image</p>
                                        <p className="text-xs text-gray-400">PNG · JPG · WEBP screenshot</p>
                                    </>
                                )}
                            </label>
                            {uploadState === 'error' && <p className="text-xs text-red-500 text-center">{uploadMsg}</p>}
                            <p className="text-xs text-gray-400 text-center leading-relaxed mt-1">
                                💡 Screenshot the QR from the admin's dashboard and upload it here.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default QRScannerModal;
