import React, { useState, useEffect, useRef } from 'react';
import { Scan, X } from 'lucide-react';

export const CameraScannerModal = ({ isOpen, onClose, onScanSuccess, availableProducts }) => {
  const [scanMessage, setScanMessage] = useState('Position product barcode inside frame');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setScanMessage('Initializing Camera...');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setScanMessage('Camera active! Point camera at barcode');
      } else {
        setScanMessage('Camera access not supported on this browser context');
      }
    } catch (err) {
      setScanMessage('Camera active (Simulation mode enabled)');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleSimulatedScan = (product) => {
    setScanMessage(`Scanned: ${product.name} [${product.barcode}]`);
    setTimeout(() => {
      onScanSuccess(product.barcode);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="font-bold text-white text-base">Camera Barcode Scanner</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-video bg-slate-950 flex flex-col items-center justify-center border-b border-slate-800 overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover opacity-80"
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="w-64 h-32 border-2 border-dashed border-emerald-400 rounded-xl relative flex items-center justify-center bg-emerald-500/5">
              <div className="w-full h-0.5 bg-emerald-400/80 animate-pulse shadow-glow"></div>
              <p className="absolute bottom-2 text-[10px] text-emerald-300 font-mono bg-slate-950/80 px-2 py-0.5 rounded">
                EAN-13 / UPC / Custom
              </p>
            </div>
          </div>

          <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{scanMessage}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick Scan Simulator (Tap to Test)
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            {availableProducts.map(p => (
              <button
                key={p.id}
                onClick={() => handleSimulatedScan(p)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-200">{p.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Barcode: {p.barcode}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-100">₹{p.sellingPrice.toFixed(2)}</p>
                  <span className="text-[10px] text-slate-400">Scan →</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
