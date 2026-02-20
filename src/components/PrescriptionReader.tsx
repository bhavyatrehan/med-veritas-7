import React, { useState, useRef } from 'react';
import { FileText, Upload, Loader2, AlertTriangle, ClipboardList, Info } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import { AnalysisType, PrescriptionInfo } from '../types';
import ReactMarkdown from 'react-markdown';

export const PrescriptionReader: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrescriptionInfo | null>(null);
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

  const handleRead = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeImage(image, AnalysisType.PRESCRIPTION_READ);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to read prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-medical p-6">
        <h2 className="text-xl font-semibold text-medical-teal-dark mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Handwritten Prescription Reader
        </h2>
        
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          {image ? (
            <div className="relative w-full max-w-xs aspect-[3/4] rounded-lg overflow-hidden shadow-sm">
              <img src={image} alt="Prescription" className="w-full h-full object-cover" />
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
              <p className="text-slate-600 font-medium">Upload prescription photo</p>
              <p className="text-slate-400 text-sm">Clear photo of handwritten prescription</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
        </div>

        {image && !result && !loading && (
          <button 
            onClick={handleRead}
            className="w-full mt-4 bg-medical-teal hover:bg-medical-teal-dark text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-5 h-5" />
            Extract Medicines
          </button>
        )}

        {loading && (
          <div className="mt-8 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-medical-teal animate-spin mx-auto" />
            <p className="text-slate-600 animate-pulse">Transcribing handwriting and fetching info...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Identified Medicines</h3>
              <div className="space-y-4">
                {result.medicines.map((med, idx) => (
                  <div key={idx} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-medical-teal-dark">{med.name}</h4>
                        <p className="text-slate-600 font-medium">{med.dosage} • {med.frequency} • {med.duration}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                      <MedDetail label="Uses" content={med.uses} />
                      <MedDetail label="Side Effects" content={med.sideEffects} />
                      <MedDetail label="Warnings" content={med.warnings} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-300 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Raw Transcription</span>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {result.rawText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MedDetail = ({ label, content }: { label: string, content?: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <div className="text-xs text-slate-700 leading-relaxed">
      <ReactMarkdown>{content || 'Information not available'}</ReactMarkdown>
    </div>
  </div>
);
