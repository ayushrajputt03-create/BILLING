import React, { useState, useEffect, useRef } from 'react';
import { Scan, X, CheckCircle2, Tag, ShoppingCart } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export const CameraScannerModal = ({ isOpen, onClose, onScanSuccess, availableProducts }) => {
  const [scanMessage, setScanMessage] = useState('Point camera at product barcode');
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [detectedProduct, setDetectedProduct] = useState(null);

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
      setDetectedProduct(null);
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
          
          const matched = availableProducts.find(p => p.barcode === decodedText);
          if (matched) {
            setDetectedProduct(matched);
            setScanMessage(`Found: ${matched.name} — ₹${matched.sellingPrice}`);
          } else {
            setScanMessage(`Barcode: ${decodedText}`);
          }

          stopHtml5Scanner().then(() => {
            setTimeout(() => {
              onScanSuccess(decodedText);
              onClose();
            }, 500);
          });
        },
        (errorMessage) => {
          // Frame search
        }
      );
    } catch (err) {
      console.warn('Camera permission or availability issue', err);
      setIsScanning(false);
      setScanMessage('Camera unavailable. Select product below or enter barcode manually.');
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
    setDetectedProduct(product);
    setScanMessage(`Scanned: ${product.name} — ₹${product.sellingPrice}`);
    setTimeout(() => {
      onScanSuccess(product.barcode);
      onClose();
    }, 400);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    playScanBeep();

    const matched = availableProducts.find(p => p.barcode === manualCode.trim() || p.name.toLowerCase().includes(manualCode.trim().toLowerCase()));
    if (matched) {
      setDetectedProduct(matched);
    }

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
              <p className="text-[11px] text-slate-400">Scans barcode & auto-populates product name & price</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Live HTML5 Scanner Viewport */}
        <div className="relative bg-slate-950 min-h-[210px] flex flex-col items-center justify-center border-b border-slate-800 overflow-hidden">
          <div id="reader" className="w-full h-full text-white font-mono text-xs text-center"></div>

          {/* Status Message */}
          <div className="absolute top-3 left-3 right-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-medium flex items-center gap-2 justify-center shadow-lg">
            <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className="truncate">{scanMessage}</span>
          </div>

          {/* Scanned Product Banner Overlay */}
          {detectedProduct && (
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-emerald-950/95 border border-emerald-500/50 rounded-xl text-white flex items-center justify-between shadow-2xl animate-bounce">
              <div>
                <p className="font-bold text-xs text-emerald-300">{detectedProduct.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-300">
                  <span>MRP: <span className="line-through">₹{detectedProduct.mrp}</span></span>
                  <span>GST: {detectedProduct.taxRate}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold font-mono text-emerald-400">₹{detectedProduct.sellingPrice.toFixed(2)}</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                  ADDED TO BILL
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Manual Input Fallback */}
        <div className="p-3 bg-slate-900 border-b border-slate-800">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Type Product Barcode or Name..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Product Catalog List with Name & Price Details */}
        <div className="p-3 bg-slate-900/90 space-y-2 overflow-y-auto flex-1 max-h-52">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Product Catalog (Tap to Scan & Bill)</span>
            <span>{availableProducts.length} Items</span>
          </p>

          <div className="grid grid-cols-1 gap-2">
            {availableProducts.map(p => (
              <button
                key={p.id}
                onClick={() => handleSimulatedScan(p)}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 text-xs flex items-center justify-between transition-all group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Barcode: <span className="text-emerald-400 font-bold">{p.barcode}</span> • HSN: {p.hsnCode || '—'}
                  </p>
                </div>

                <div className="text-right ml-2 flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 line-through">₹{p.mrp}</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">₹{p.sellingPrice.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold group-hover:underline">
                    Scan Item →
                  </span>
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
