import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '../icons/Icons';

declare const Html5QrcodeScanner: any;

interface QRScannerModalProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScanSuccess, onClose }) => {
    const scannerRef = useRef<any>(null);
    const [permissionStatus, setPermissionStatus] = useState<'idle' | 'pending' | 'granted' | 'denied'>('idle');

    // Function to request camera permission
    const requestCameraPermission = async () => {
        setPermissionStatus('pending');
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // Request the stream just to trigger the permission prompt
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // Immediately stop the tracks to free up the camera for the scanner library
                stream.getTracks().forEach(track => track.stop());
                setPermissionStatus('granted');
            } else {
                console.error("Camera access is not supported on this browser.");
                setPermissionStatus('denied');
            }
        } catch (err) {
            console.error("Camera permission was denied:", err);
            setPermissionStatus('denied');
        }
    };
    
    // Request permission on component mount
    useEffect(() => {
        requestCameraPermission();
    }, []);

    // Initialize the scanner only when permission is granted
    useEffect(() => {
        if (permissionStatus === 'granted' && !scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                'qr-reader',
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    rememberLastUsedCamera: true,
                    supportedScanTypes: [0] // SCAN_TYPE_CAMERA
                },
                /* verbose= */ false
            );
            
            const handleSuccess = (decodedText: string) => {
                if (scannerRef.current) {
                    scanner.clear();
                    scannerRef.current = null; // Mark as cleared to prevent re-clearing
                    onScanSuccess(decodedText);
                }
            };

            const handleError = (error: string) => {
                // This callback can be noisy. It's safe to leave it empty if no error handling is needed.
                // console.warn(`QR code scan error = ${error}`);
            };

            scanner.render(handleSuccess, handleError);
            scannerRef.current = scanner;
        }

        // Cleanup function for when the component unmounts
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((err: any) => {
                    console.warn("Failed to clear QR scanner on unmount. This can be expected if it was already cleared.", err);
                });
                scannerRef.current = null;
            }
        };
    }, [permissionStatus, onScanSuccess]);

    const renderContent = () => {
        switch (permissionStatus) {
            case 'pending':
                return (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-600 dark:text-slate-400">
                        <svg className="animate-spin h-8 w-8 text-sky-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Requesting camera access...
                    </div>
                );
            case 'granted':
                return <div id="qr-reader" className="w-full"></div>;
            case 'denied':
                return (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-700 dark:text-slate-300">
                        <p className="mb-4">Camera access is required to scan QR codes. Please grant permission in your browser.</p>
                        <button 
                            onClick={requestCameraPermission}
                            className="py-2 px-4 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors text-sm"
                        >
                            Retry Permission
                        </button>
                    </div>
                );
            default: // 'idle' state
                return <div className="h-48"></div>; // Placeholder to maintain modal size
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-lg relative">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100">Scan Agent QR Code</h3>
                     <button 
                        onClick={onClose} 
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label="Close scanner"
                    >
                        <CloseIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default QRScannerModal;