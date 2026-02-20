export enum AnalysisType {
  MEDICINE_SCAN = 'MEDICINE_SCAN',
  PRESCRIPTION_READ = 'PRESCRIPTION_READ',
}

export interface MedicineInfo {
  brandName: string;
  saltComposition: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  authenticityStatus: 'Likely Authentic' | 'Suspicious' | 'Unable to Determine';
  reason: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  uses?: string;
  sideEffects?: string;
  warnings?: string;
}

export interface PrescriptionInfo {
  medicines: PrescriptionMedicine[];
  rawText: string;
}

export interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  frequency: string;
  active: boolean;
}
