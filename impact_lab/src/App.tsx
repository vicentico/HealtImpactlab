import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KPICards } from './components/KPICards';
import { PrioritizedTable } from './components/PrioritizedTable';
import { PatientDetailPanel } from './components/PatientDetailPanel';
import { OperationalExplicationPanel } from './components/OperationalExplicationPanel';
import { INITIAL_MOCK_PATIENTS } from './data/mockPatients';
import { Patient, ContraloriaStatus, AuditLogEntry } from './types/patient';
import { Layers, ClipboardCheck, FileSpreadsheet, Plus, Download } from 'lucide-react';

export function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_MOCK_PATIENTS);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [cesfamName, setCesfamName] = useState<string>('CESFAM Carol Urzúa');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isExplicationOpen, setIsExplicationOpen] = useState<boolean>(false);

  // Handle Contraloría Action Update
  const handleUpdateStatus = (patientId: string, newStatus: ContraloriaStatus, clinicalNote: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const newAuditEntry: AuditLogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: nowStr,
            userName: 'Dr. Alejandro Silva',
            userRole: 'Médico Contralor APS',
            action: `Cambio Estado Contraloría a ${newStatus}`,
            previousStatus: p.contraloriaStatus,
            newStatus: newStatus,
            clinicalNote: clinicalNote
          };

          const updatedPatient: Patient = {
            ...p,
            contraloriaStatus: newStatus,
            lastReviewDate: nowStr,
            auditHistory: [newAuditEntry, ...p.auditHistory]
          };

          if (selectedPatient && selectedPatient.id === patientId) {
            setSelectedPatient(updatedPatient);
          }

          return updatedPatient;
        }
        return p;
      })
    );
  };

  const pendingCount = patients.filter((p) => p.contraloriaStatus === 'PENDIENTE').length;
  const criticalCount = patients.filter((p) => p.nt118Risk.riskLevel === 'CRITICO').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        cesfamName={cesfamName}
        onCesfamChange={setCesfamName}
        pendingCount={pendingCount}
        criticalCount={criticalCount}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenExplication={() => setIsExplicationOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {activeTab === 'dashboard' && (
            <>
              {/* Top Banner Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel rounded-xl p-4 border border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white">Torre de Control de Listas de Espera APS</h2>
                  <p className="text-xs text-slate-400">
                    Priorización algorítmica por riesgo de descompensación (Norma Técnica 118 MINSAL)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsExplicationOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <span>Criterios Algoritmo</span>
                  </button>
                  <button 
                    onClick={() => alert('Exportando reporte oficial SIGTE en formato Excel/CSV...')}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Exportar Lista Aprobada</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Grid */}
              <KPICards patients={patients} />

              {/* Main Prioritized Table */}
              <PrioritizedTable
                patients={patients}
                onSelectPatient={(p) => setSelectedPatient(p)}
              />
            </>
          )}

          {activeTab === 'matrix' && (
            <div className="glass-panel rounded-xl p-8 text-center space-y-3">
              <Layers className="h-10 w-10 text-cyan-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Matriz Completa de Riesgo NT 118</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Visualización tridimensional de variables clínicas (HbA1c, VFG, Presión Arterial y Factores Sociales).
              </p>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="glass-panel rounded-xl p-8 text-center space-y-3">
              <ClipboardCheck className="h-10 w-10 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Bitácora Global de Contraloría</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Registro inmutable de trazabilidad auditable con firma digital de profesionales médicos contralores.
              </p>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="glass-panel rounded-xl p-8 text-center space-y-3">
              <FileSpreadsheet className="h-10 w-10 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Importador de Archivos SIGTE / MINSAL</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Carga de planillas Excel o conexión API directa con la Ficha Electrónica CESFAM.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* Patient Detail Drawer */}
      <PatientDetailPanel
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Algorithm Explication Modal */}
      <OperationalExplicationPanel
        isOpen={isExplicationOpen}
        onClose={() => setIsExplicationOpen(false)}
      />

    </div>
  );
}

export default App;
