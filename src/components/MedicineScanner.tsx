import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertTriangle, HelpCircle, FileSearch } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import { AnalysisType, MedicineInfo } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MedicineScanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicineInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeImage(image, AnalysisType.MEDICINE_SCAN);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-medical p-6">
        <h2 className="text-xl font-semibold text-medical-teal-dark mb-4 flex items-center gap-2">
          <Camera className="w-6 h-6" />
          Medicine Authenticity Scanner
        </h2>
        
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          {image ? (
            <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden shadow-sm">
              <img src={image} alt="Medicine" className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); }}
                className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white"
              >
                <Loader2 className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">Click to upload or take a photo</p>
              <p className="text-slate-400 text-sm">Medicine strip, packaging, or bottle</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment"
            onChange={handleImageUpload} 
          />
        </div>

        {image && !result && !loading && (
          <button 
            onClick={handleScan}
            className="w-full mt-4 bg-medical-teal hover:bg-medical-teal-dark text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <FileSearch className="w-5 h-5" />
            Analyze Medicine
          </button>
        )}

        {loading && (
          <div className="mt-8 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-medical-teal animate-spin mx-auto" />
            <p className="text-slate-600 animate-pulse">Analyzing authenticity features...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={cn(
              "p-4 rounded-xl flex items-center gap-3 border",
              result.authenticityStatus === 'Likely Authentic' ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
              result.authenticityStatus === 'Suspicious' ? "bg-red-50 border-red-100 text-red-800" :
              "bg-slate-50 border-slate-200 text-slate-800"
            )}>
              {result.authenticityStatus === 'Likely Authentic' ? <CheckCircle2 className="w-6 h-6" /> :
               result.authenticityStatus === 'Suspicious' ? <AlertTriangle className="w-6 h-6" /> :
               <HelpCircle className="w-6 h-6" />}
              <div>
                <p className="font-bold text-lg">{result.authenticityStatus}</p>
                <p className="text-sm opacity-90">{result.reason}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Brand Name" value={result.brandName} />
              <InfoItem label="Salt Composition" value={result.saltComposition} />
              <InfoItem label="Manufacturer" value={result.manufacturer} />
              <InfoItem label="Batch Number" value={result.batchNumber} />
              <InfoItem label="Expiry Date" value={result.expiryDate} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string, value: string }) => (
  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-slate-900 font-medium">{value || 'N/A'}</p>
  </div>
);
