import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, AlertCircle, Loader2, ImageUp, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/* Animated scan line that sweeps top→bottom inside the viewfinder      */
/* ------------------------------------------------------------------ */
const ScanAnimation = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {/* Corner brackets */}
        {[
            'top-3 left-3 border-t-[3px] border-l-[3px] rounded-tl-lg',
            'top-3 right-3 border-t-[3px] border-r-[3px] rounded-tr-lg',
            'bottom-3 left-3 border-b-[3px] border-l-[3px] rounded-bl-lg',
            'bottom-3 right-3 border-b-[3px] border-r-[3px] rounded-br-lg',
        ].map((cls, i) => (
            <div key={i} className={`absolute w-7 h-7 border-violet-400 ${cls}`} />
        ))}

        {/* Sweeping scan line */}
        <motion.div
            className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent rounded-full shadow-[0_0_8px_2px_rgba(139,92,246,0.7)]"
            initial={{ top: '10%' }}
            animate={{ top: '90%' }}
            transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        />
    </div>
);

/* ------------------------------------------------------------------ */
/* Main modal                                                           */
/* ------------------------------------------------------------------ */
const QRScannerModal = ({ onClose }) => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('camera'); // 'camera' | 'upload'
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('loading');
    const [uploadStatus, setUploadStatus] = useState(null); // null | 'scanning' | 'success' | 'error'
    const scannerRef = useRef(null);
    const mountedRef = useRef(true);
    const hasStarted = useRef(false);
    const fileInputRef = useRef(null);

    /* Resolve the scanned/decoded URL and navigate */
    const handleDecoded = (decodedText, scanner) => {
        try {
            const url = new URL(decodedText);
            const match = url.pathname.match(/^\/portal\/store\/([^/]+)/);
            if (match?.[1]) {
                scanner?.stop?.().catch(() => { });
                if (mountedRef.current) {
                    onClose();
                    toast.success(`Opening @${match[1]}'s store…`);
                    navigate(`/portal/store/${match[1]}`);
                }
            } else {
                toast.error('Not a valid store QR code');
            }
        } catch {
            toast.error('Could not read QR code URL');
        }
    };

    /* ---- Start live camera scanner ---- */
    useEffect(() => {
        if (tab !== 'camera') return;
        mountedRef.current = true;
        if (hasStarted.current) return;
        hasStarted.current = true;

        const startScanner = async () => {
            try {
                const { Html5Qrcode } = await import('html5-qrcode');
                const container = document.getElementById('qr-reader-container');
                if (!container || !mountedRef.current) return;

                const html5QrCode = new Html5Qrcode('qr-reader-container', { verbose: false });
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 30,           // ← faster scanning
                        qrbox: { width: 230, height: 230 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => handleDecoded(decodedText, html5QrCode),
                    () => { }
                );

                if (mountedRef.current) setStatus('scanning');
            } catch (err) {
                if (mountedRef.current) {
                    setError(
                        err.message?.toLowerCase().includes('permission')
                            ? 'Camera permission denied. Please allow camera access in your browser settings.'
                            : 'Could not start the camera. Make sure no other app is using it.'
                    );
                    setStatus('error');
                }
            }
        };

        startScanner();

        return () => {
            mountedRef.current = false;
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
                scannerRef.current = null;
            }
        };
    }, [tab]);

    /* ---- Handle image upload ---- */
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadStatus('scanning');
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            // Temporary off-screen element required by html5-qrcode for file scanning
            const tempId = 'qr-file-scanner-temp';
            let div = document.getElementById(tempId);
            if (!div) {
                div = document.createElement('div');
                div.id = tempId;
                div.style.display = 'none';
                document.body.appendChild(div);
            }
            const scanner = new Html5Qrcode(tempId, { verbose: false });
            const result = await scanner.scanFile(file, true);
            scanner.clear();
            setUploadStatus('success');
            handleDecoded(result, null);
        } catch {
            setUploadStatus('error');
            toast.error('No QR code found in this image. Try a clearer photo.');
        } finally {
            // Reset so user can re-upload
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    /* ---------------------------------------------------------------- */
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <ScanLine size={20} />
                        <span className="font-bold">Scan Store QR Code</span>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/25 rounded-full transition-colors" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Tab switcher */}
                <div className="flex border-b border-gray-100">
                    {[
                        { id: 'camera', icon: Camera, label: 'Camera' },
                        { id: 'upload', icon: ImageUp, label: 'Upload Image' },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors
                ${tab === t.id
                                    ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/40'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <t.icon size={15} /> {t.label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {/* ---- CAMERA TAB ---- */}
                    {tab === 'camera' && (
                        <>
                            {status === 'error' && (
                                <div className="flex flex-col items-center py-6 text-center">
                                    <AlertCircle size={44} className="text-red-400 mb-3" />
                                    <p className="text-sm text-gray-600 px-2">{error}</p>
                                    <button onClick={onClose} className="mt-5 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
                                        Close
                                    </button>
                                </div>
                            )}

                            {status === 'loading' && (
                                <div className="flex flex-col items-center py-10 gap-3">
                                    <Loader2 size={36} className="animate-spin text-violet-600" />
                                    <p className="text-sm text-gray-500">Starting camera…</p>
                                </div>
                            )}

                            {/* Camera viewport — always rendered so html5-qrcode can mount */}
                            <div className={status === 'error' ? 'hidden' : 'relative'}>
                                <div className="relative rounded-2xl overflow-hidden bg-black">
                                    <div id="qr-reader-container" className="w-full" style={{ minHeight: 260 }} />
                                    {status === 'scanning' && <ScanAnimation />}
                                </div>
                                {status === 'scanning' && (
                                    <p className="mt-3 text-center text-xs text-violet-600 flex items-center justify-center gap-1.5">
                                        <motion.span
                                            className="inline-block w-2 h-2 rounded-full bg-violet-500"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                        Point camera at an admin's store QR code
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* ---- UPLOAD TAB ---- */}
                    {tab === 'upload' && (
                        <div className="flex flex-col items-center py-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="qr-image-upload"
                            />

                            <label
                                htmlFor="qr-image-upload"
                                className="w-full cursor-pointer flex flex-col items-center justify-center gap-3 border-2 border-dashed border-violet-300 rounded-2xl py-10 px-6 hover:border-violet-500 hover:bg-violet-50/50 transition-all group"
                            >
                                {uploadStatus === 'scanning' ? (
                                    <>
                                        <Loader2 size={40} className="text-violet-500 animate-spin" />
                                        <p className="text-sm font-semibold text-violet-600">Scanning image…</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <ImageUp size={30} className="text-violet-600" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700">Click to upload a QR image</p>
                                        <p className="text-xs text-gray-400">PNG, JPG, WEBP — any QR screenshot</p>
                                    </>
                                )}
                            </label>

                            {uploadStatus === 'error' && (
                                <p className="mt-3 text-xs text-red-500 text-center">
                                    No QR code found. Try a clearer or larger image.
                                </p>
                            )}
                            {uploadStatus === 'success' && (
                                <p className="mt-3 text-xs text-green-600 text-center font-medium">
                                    ✓ QR code found! Redirecting…
                                </p>
                            )}

                            <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
                                Upload a screenshot or photo of any admin's store QR code and we'll detect it instantly.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default QRScannerModal;
