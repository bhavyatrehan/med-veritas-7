import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <div className="disclaimer-banner flex items-start gap-3 my-4">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p>
        <strong>Disclaimer:</strong> This tool is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medicine authenticity.
      </p>
    </div>
  );
};
