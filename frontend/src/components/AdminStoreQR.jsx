import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Share2, Copy, Check, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

/**
 * AdminStoreQR - Shows a QR code card for the admin's store.
 * When scanned, leads to /portal/store/:username (login required first).
 * Props: { username, name }
 */
const AdminStoreQR = ({ username, name }) => {
    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const svgRef = useRef(null);

    if (!username) return null;

    // The URL the QR encodes — works locally and in production
    const storeUrl = `${window.location.origin}/portal/store/${username}`;

    const copyLink = async () => {
        await navigator.clipboard.writeText(storeUrl);
        setCopied(true);
        toast.success('Store link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQR = () => {
        const svg = document.getElementById('admin-store-qr');
        if (!svg) return;

        // Render SVG → Image → Canvas with card styling
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
            const PADDING = 48;
            const QR_SIZE = 400;
            const TOTAL = QR_SIZE + PADDING * 2;
            const RADIUS = 40;

            const canvas = document.createElement('canvas');
            // 2× pixel density for crisp output
            canvas.width = TOTAL * 2;
            canvas.height = TOTAL * 2;
            const ctx = canvas.getContext('2d');
            ctx.scale(2, 2);

            // ── Drop shadow ──
            ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
            ctx.shadowBlur = 30;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 8;

            // ── White rounded card ──
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(RADIUS, 0);
            ctx.lineTo(TOTAL - RADIUS, 0);
            ctx.quadraticCurveTo(TOTAL, 0, TOTAL, RADIUS);
            ctx.lineTo(TOTAL, TOTAL - RADIUS);
            ctx.quadraticCurveTo(TOTAL, TOTAL, TOTAL - RADIUS, TOTAL);
            ctx.lineTo(RADIUS, TOTAL);
            ctx.quadraticCurveTo(0, TOTAL, 0, TOTAL - RADIUS);
            ctx.lineTo(0, RADIUS);
            ctx.quadraticCurveTo(0, 0, RADIUS, 0);
            ctx.closePath();
            ctx.fill();

            // ── Reset shadow before drawing QR ──
            ctx.shadowColor = 'transparent';

            // ── Draw QR code ──
            ctx.drawImage(img, PADDING, PADDING, QR_SIZE, QR_SIZE);

            URL.revokeObjectURL(url);
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `${username}-store-qr.png`;
            a.click();
            toast.success('QR code downloaded!');
        };
        img.src = url;
    };

    return (
        <>
            {/* Trigger Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <QrCode className="text-indigo-600" size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Your Store QR Code</h3>
                            <p className="text-xs text-gray-500">Let customers scan to visit your store</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        View QR
                    </button>
                </div>

                {/* Mini Preview */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                        <QRCodeSVG
                            value={storeUrl}
                            size={60}
                            level="M"
                            fgColor="#4f46e5"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">@{username}</p>
                        <p className="text-xs text-gray-400 truncate">{storeUrl}</p>
                    </div>
                    <button
                        onClick={copyLink}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Full Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                                {/* Modal header */}
                                <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center">
                                    {/* ✕ Close button */}
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                                        aria-label="Close"
                                    >
                                        <X size={18} />
                                    </button>
                                    <QrCode size={32} className="mx-auto mb-2 text-indigo-200" />
                                    <h2 className="text-xl font-bold">{name}'s Store</h2>
                                    <p className="text-indigo-200 text-sm">@{username}</p>
                                </div>

                                {/* QR Code */}
                                <div className="flex flex-col items-center px-8 py-8">
                                    <div className="p-4 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg mb-6">
                                        <QRCodeSVG
                                            id="admin-store-qr"
                                            value={storeUrl}
                                            size={220}
                                            level="H"
                                            fgColor="#3730a3"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 text-center mb-6 px-4">
                                        Customers scan this to visit your store. They'll need to log in or create an account first.
                                    </p>

                                    {/* URL display */}
                                    <div className="w-full bg-gray-50 rounded-xl p-3 flex items-center gap-2 mb-4">
                                        <ExternalLink size={14} className="text-gray-400 shrink-0" />
                                        <p className="text-xs text-gray-600 truncate flex-1">{storeUrl}</p>
                                        <button onClick={copyLink} className="shrink-0">
                                            {copied
                                                ? <Check size={14} className="text-green-500" />
                                                : <Copy size={14} className="text-gray-400 hover:text-indigo-500" />
                                            }
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={downloadQR}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-indigo-200 text-indigo-600 font-semibold rounded-xl text-sm hover:bg-indigo-50 transition-colors"
                                        >
                                            <Download size={16} /> Download
                                        </button>
                                        <button
                                            onClick={copyLink}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors"
                                        >
                                            {copied ? <Check size={16} /> : <Share2 size={16} />}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminStoreQR;
