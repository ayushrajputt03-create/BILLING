import React, { useState, useEffect, useRef } from 'react';
import { Scan, X, Camera, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export const CameraScannerModal = ({ isOpen, onClose, onScanSuccess, availableProducts }) => {
  const [scanMessage, setScanMessage] = useState('Initializing camera...');
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const html5QrcodeRef = useRef(null);
  const hasScannedRef = useRef(false);

  // Audio Beep Feedback
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1800;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio feedback unavailable', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      hasScannedRef.current = false;
      // Short delay to ensure container element '#reader' is rendered in DOM
      const timer = setTimeout(() => {
        startHtml5Scanner();
      }, 200);
      return () => {
        clearTimeout(timer);
        stopHtml5Scanner();
      };
    } else {
      stopHtml5Scanner();
    }
  }, [isOpen]);

  const startHtml5Scanner = async () => {
    try {
      const readerElem = document.getElementById('reader');
      if (!readerElem) return;

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      const html5Qrcode = new Html5Qrcode('reader', {
        formatsToSupport,
        verbose: false
      });
      html5QrcodeRef.current = html5Qrcode;

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 140 },
        aspectRatio: 1.777778
      };

      setIsScanning(true);
      setScanMessage('Point camera at product barcode');

      await html5Qrcode.start(
        { facingMode: 'environment' },
        config,
        (decodedText, decodedResult) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          playScanBeep();
          setScanMessage(`Scanned Barcode: ${decodedText}`);

          stopHtml5Scanner().then(() => {
            onScanSuccess(decodedText);
            onClose();
          });
        },
        (errorMessage) => {
          // Continuous frame parsing error (normal while searching for barcode)
        }
      );
    } catch (err) {
      console.warn('Camera failed or permission denied, enabling simulation mode', err);
      setIsScanning(false);
      setScanMessage('Camera permission denied or unavailable. Use simulation or manual entry below.');
    }
  };

  const stopHtml5Scanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
        html5QrcodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner', e);
      }
      html5QrcodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleSimulatedScan = (product) => {
    playScanBeep();
    setScanMessage(`Scanned: ${product.name} [${product.barcode}]`);
    setTimeout(() => {
      onScanSuccess(product.barcode);
      onClose();
    }, 300);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    playScanBeep();
    onScanSuccess(manualCode.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-white text-base">Live Camera Barcode Scanner</h3>
              <p className="text-[11px] text-slate-400">EAN-13, CODE-128, UPC Real-Time Detector</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Live HTML5 Scanner Container */}
        <div className="relative bg-slate-950 min-h-[220px] flex flex-col items-center justify-center border-b border-slate-800 overflow-hidden">
          <div id="reader" className="w-full h-full text-white font-mono text-xs text-center"></div>

          {/* Status Message Overlay */}
          <div className="absolute top-3 left-3 right-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-medium flex items-center gap-2 justify-center shadow-lg">
            <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className="truncate">{scanMessage}</span>
          </div>
        </div>

        {/* Manual Barcode Input Fallback */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-2">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter barcode manually (e.g. 8901030300001)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Add
            </button>
          </form>
        </div>

        {/* Quick Product Tap Simulator */}
        <div className="p-4 bg-slate-900/90 space-y-2 overflow-y-auto flex-1 max-h-48">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Scan Simulator (Tap to Test)
          </p>
          <div className="grid grid-cols-1 gap-2">
            {availableProducts.map(p => (
              <button
                key={p.id}
                onClick={() => handleSimulatedScan(p)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-200">{p.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Barcode: {p.barcode}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-100">₹{p.sellingPrice.toFixed(2)}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Tap to Scan →</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
