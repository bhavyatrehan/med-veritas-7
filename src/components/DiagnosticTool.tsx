import React, { useState } from 'react';
import { Activity, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { testConnection } from '../services/gemini';

export const DiagnosticTool: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleTest = async () => {
    setStatus('loading');
    const result = await testConnection();
    setStatus(result ? 'success' : 'error');
  };

  return (
    <div className="card-medical p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-medical-teal" />
        <div>
          <p className="text-sm font-bold text-slate-700">API Connection Diagnostic</p>
          <p className="text-xs text-slate-500">Verify your Gemini API key status</p>
        </div>
      </div>
      
      <button 
        onClick={handleTest}
        disabled={status === 'loading'}
        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
          status === 'loading' ? 'bg-slate-100 text-slate-400' :
          status === 'success' ? 'bg-emerald-100 text-emerald-700' :
          status === 'error' ? 'bg-red-100 text-red-700' :
          'bg-medical-teal text-white hover:bg-medical-teal-dark'
        }`}
      >
        {status === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
        {status === 'success' && <CheckCircle2 className="w-3 h-3" />}
        {status === 'error' && <XCircle className="w-3 h-3" />}
        {status === 'loading' ? 'Testing...' : status === 'success' ? 'Connected' : status === 'error' ? 'Failed' : 'Test Connection'}
      </button>
    </div>
  );
};
