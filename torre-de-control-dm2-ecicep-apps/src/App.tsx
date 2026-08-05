import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { PrimaryPathologyFilter } from './components/PrimaryPathologyFilter';
import { PrioritizedTable } from './components/PrioritizedTable';
import { PatientDetailPanel } from './components/PatientDetailPanel';
import { OperationalExplicationPanel } from './components/OperationalExplicationPanel';
import { TerritorialCoverageModule } from './components/TerritorialCoverageModule';
import { ClinicalLoadModal } from './components/ClinicalLoadModal';
import { AuditLogModal } from './components/AuditLogModal';
import { AccessRestrictedModal } from './components/AccessRestrictedModal';

import { 
  DATASET_PRESETS, 
  INITIAL_CAPACITY_METRICS, 
  INITIAL_AUDIT_LOGS 
} from './data/mockPatients';
import { Patient, FilterState, AuditLogEntry, CapacityMetrics, UserRole } from './types';
import { getRoleInfo } from './lib/roles';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Info,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<string>('resumen');
  const [activeRole, setActiveRole] = useState<UserRole>('MEDICO_CONTRALOR');
  const [restrictedActionName, setRestrictedActionName] = useState<string | null>(null);

  // Active Dataset & Sector State
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('cesfam-ariztia');
  const activeDataset = DATASET_PRESETS.find(d => d.id === selectedDatasetId) || DATASET_PRESETS[0];

  const [patients, setPatients] = useState<Patient[]>(activeDataset.patients);
  const [metrics, setMetrics] = useState<CapacityMetrics>(INITIAL_CAPACITY_METRICS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Selected Patient & Filters
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('PAT-001');
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('TODOS');

  const [filters, setFilters] = useState<FilterState>({
    cesfam: activeDataset.cesfamName,
    sector: 'TODOS',
    program: 'ALL',
    riskLevel: 'ALL',
    gesOnly: false,
    status: 'ALL',
    searchQuery: '',
    sortBy: 'prioridad_actual'
  });

  // Modals & Async States
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const roleInfo = getRoleInfo(activeRole);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestrictedActionAttempt = (actionName: string) => {
    setRestrictedActionName(actionName);
  };

  // Switch Dataset Preset
  const handleSelectDataset = (presetId: string) => {
    setSelectedDatasetId(presetId);
    const preset = DATASET_PRESETS.find(p => p.id === presetId) || DATASET_PRESETS[0];
    setPatients(preset.patients);
    setSelectedPatientId(preset.patients[0]?.id || null);
    showToast(`Cargado contexto: ${preset.name}`);
  };

  // Filter Patients
  const filteredPatients = patients.filter(p => {
    // Sector filter
    if (selectedSector !== 'TODOS' && p.sector !== selectedSector) return false;

    // Program filter
    if (selectedProgram !== 'ALL' && p.program !== selectedProgram) return false;

    // Risk Level filter
    if (filters.riskLevel !== 'ALL' && p.clinicalRiskLevel !== filters.riskLevel) return false;

    // Status filter
    if (filters.status !== 'ALL' && p.status !== filters.status) return false;

    // GES filter
    if (filters.gesOnly && !p.isGES) return false;

    // Search query
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchRut = p.rut.toLowerCase().includes(q);
      const matchPathology = p.primaryPathology.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      if (!matchName && !matchRut && !matchPathology && !matchId) return false;
    }

    return true;
  });

  // Calculate pathology counts
  const programCounts = patients.reduce((acc, p) => {
    acc['ALL'] = (acc['ALL'] || 0) + 1;
    acc[p.program] = (acc[p.program] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recalculate NT 118 Priorities
  const handleRecalculatePriorities = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      // Re-sort and recalculate positions based on clinical risk score and wait days
      const sorted = [...patients].sort((a, b) => {
        const scoreA = a.clinicalRiskScore + (a.clinicalFactors.vitalRisk ? 50 : 0) + (a.controlBreachMonths * 2);
        const scoreB = b.clinicalRiskScore + (b.clinicalFactors.vitalRisk ? 50 : 0) + (b.controlBreachMonths * 2);
        return scoreB - scoreA;
      });

      const recalculated = sorted.map((p, idx) => {
        const newPos = idx + 1;
        const delta = p.originalPosition - newPos;
        return {
          ...p,
          currentPosition: newPos,
          positionDelta: delta
        };
      });

      setPatients(recalculated);
      setIsRecalculating(false);

      // Add audit log
      const newLog: AuditLogEntry = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        patientId: 'SISTEMA',
        patientRut: 'SYSTEM-APS',
        patientName: 'Ejecución Algoritmo Priorización DM2 ECICEP',
        action: 'RECALCULO_ECICEP',
        performedBy: activeRole,
        role: activeRole,
        details: 'Recálculo completo de matriz de prioridades DM2 según estrategia ECICEP y descompensación biomarcadora.'
      };

      setAuditLogs(prev => [newLog, ...prev]);
      showToast('✓ Priorización algorítmica NT 118 reejecutada exitosamente.');
    }, 1000);
  };

  // Confirm Prioritization (Contralor Action)
  const handleConfirmPrioritization = (patientId: string, notes: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          status: 'PRIORIZADO_VALIDADO',
          contralorValidation: {
            isValidated: true,
            validatedBy: `${activeRole} (CESFAM)`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            notes,
            actionTaken: 'APROBADO'
          }
        };
      }
      return p;
    }));

    // Add audit log
    const target = patients.find(p => p.id === patientId);
    if (target) {
      const newLog: AuditLogEntry = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        patientId: target.id,
        patientRut: target.rut,
        patientName: target.name,
        action: 'VALIDACION_CONTRALOR',
        performedBy: activeRole,
        role: activeRole,
        details: `Validación de posición #${target.currentPosition} aprobada.`,
        contralorNote: notes
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }

    showToast('✓ Priorización validada y firmada digitalmente.');
  };

  // Override Position (Contralor Action)
  const handleOverridePosition = (patientId: string, newPosition: number, notes: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const delta = p.originalPosition - newPosition;
        return {
          ...p,
          currentPosition: newPosition,
          positionDelta: delta,
          status: 'AJUSTE_CONTRALOR',
          contralorValidation: {
            isValidated: true,
            validatedBy: `${activeRole} (CESFAM)`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            notes,
            actionTaken: 'REORDENADO'
          }
        };
      }
      return p;
    }));

    showToast(`✓ Posición ajustada a #${newPosition} por criterio contralor.`);
  };

  // Derive to Hospital
  const handleDeriveToHospital = (patientId: string, notes: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          status: 'DERIVADO_NIVEL_2',
          contralorValidation: {
            isValidated: true,
            validatedBy: `${activeRole} (CESFAM)`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            notes,
            actionTaken: 'DERIVADO_HOSPITAL'
          }
        };
      }
      return p;
    }));

    showToast('✓ Interconsulta emitida a Nivel Secundario / Hospital.');
  };

  // Export Report
  const handleExportReport = () => {
    showToast('Generando informe auditado en PDF para la APDP / MINSAL...');
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden antialiased select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-teal-900 border border-teal-500 text-teal-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        cesfamName={activeDataset.cesfamName}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 2. Top Header Bar */}
        <Header
          selectedDataset={selectedDatasetId}
          onSelectDataset={handleSelectDataset}
          selectedSector={selectedSector}
          onSelectSector={setSelectedSector}
          onOpenLoadModal={() => setIsLoadModalOpen(true)}
          onRecalculatePriorities={handleRecalculatePriorities}
          onExportReport={handleExportReport}
          onOpenAuditLog={() => setIsAuditModalOpen(true)}
          isRecalculating={isRecalculating}
          activeRole={activeRole}
          onSelectRole={(r) => {
            setActiveRole(r);
            const info = getRoleInfo(r);
            showToast(`Perfil cambiado a: ${info.label}`);
          }}
        />

        {/* Workspace Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Top KPI Cards Row */}
          <KPICards metrics={metrics} />

          {/* Primary Pathology Filter Tabs */}
          <PrimaryPathologyFilter
            selectedProgram={selectedProgram}
            onSelectProgram={setSelectedProgram}
            programCounts={programCounts}
          />

          {/* Core Layout Grid: Central Table + Right Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Table Column (7 to 8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 min-h-[550px] flex flex-col">
              <PrioritizedTable
                patients={filteredPatients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={(id) => setSelectedPatientId(id)}
                filters={filters}
                onUpdateFilters={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
                onQuickValidate={(id) => handleConfirmPrioritization(id, 'Validación rápida en tabla.')}
                activeRole={activeRole}
                onRestrictedActionAttempt={handleRestrictedActionAttempt}
              />
            </div>

            {/* Right Detail Panel Column (4 to 5 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 h-[620px] sticky top-4">
              <PatientDetailPanel
                patient={selectedPatient}
                onClose={() => setSelectedPatientId(null)}
                onConfirmPrioritization={handleConfirmPrioritization}
                onOverridePosition={handleOverridePosition}
                onDeriveToHospital={handleDeriveToHospital}
                onAddContralorNote={(id, note) => handleConfirmPrioritization(id, note)}
                activeRole={activeRole}
                onRestrictedActionAttempt={handleRestrictedActionAttempt}
              />
            </div>
          </div>

          {/* Operational Explication & Algorithmic Traceability Module */}
          <OperationalExplicationPanel selectedPatient={selectedPatient} />

          {/* Territorial Coverage & Sector Capacity Module */}
          <TerritorialCoverageModule
            sectors={metrics.sectorCoverage}
            cesfamName={activeDataset.cesfamName}
          />
        </div>
      </div>

      {/* Modals */}
      <ClinicalLoadModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoadSuccess={(count) => {
          showToast(`✓ Importados ${count} registros desde RAYEN APS.`);
        }}
        cesfamName={activeDataset.cesfamName}
      />

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />

      <AccessRestrictedModal
        isOpen={restrictedActionName !== null}
        onClose={() => setRestrictedActionName(null)}
        actionName={restrictedActionName || ''}
        activeRole={activeRole}
        onSwitchRole={(newRole) => {
          setActiveRole(newRole);
          const info = getRoleInfo(newRole);
          showToast(`Perfil actualizado a: ${info.label}`);
        }}
      />
    </div>
  );
}

export default App;
