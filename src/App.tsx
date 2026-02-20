import React, { useState } from 'react';
import { Shield, FileText, Bell, Stethoscope, Menu, X } from 'lucide-react';
import { MedicineScanner } from './components/MedicineScanner';
import { PrescriptionReader } from './components/PrescriptionReader';
import { ReminderSystem } from './components/ReminderSystem';
import { Disclaimer } from './components/Disclaimer';
import { DiagnosticTool } from './components/DiagnosticTool';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'scanner' | 'prescription' | 'reminders';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('scanner');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'scanner', label: 'Medicine Scanner', icon: Shield },
    { id: 'prescription', label: 'Prescription Reader', icon: FileText },
    { id: 'reminders', label: 'Reminders', icon: Bell },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-medical-teal p-2 rounded-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Med-<span className="text-medical-teal">Veritas</span>
            </h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-medical-teal-light text-medical-teal-dark' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as Tab);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-left font-semibold flex items-center gap-3 ${
                      activeTab === tab.id 
                        ? 'bg-medical-teal text-white' 
                        : 'text-slate-600 bg-slate-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Feature */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'scanner' && <MedicineScanner />}
                {activeTab === 'prescription' && <PrescriptionReader />}
                {activeTab === 'reminders' && <ReminderSystem />}
              </motion.div>
            </AnimatePresence>
            
            <Disclaimer />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <DiagnosticTool />
            
            <div className="card-medical p-6 bg-medical-teal-dark text-white">
              <h3 className="font-bold text-lg mb-2">Safety First</h3>
              <ul className="space-y-3 text-sm opacity-90">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                  Always check the physical expiry date on the pack.
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                  Report suspicious medicines to your local health authority.
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                  Don't self-medicate based on AI transcriptions.
                </li>
              </ul>
            </div>

            <div className="card-medical p-6">
              <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Scans Today</span>
                  <span className="font-bold text-medical-teal">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Active Reminders</span>
                  <span className="font-bold text-medical-teal">
                    {JSON.parse(localStorage.getItem('med_reminders') || '[]').filter((r: any) => r.active).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 Med-Veritas AI. Built with Google Gemini Vision.
          </p>
        </div>
      </footer>
    </div>
  );
}
