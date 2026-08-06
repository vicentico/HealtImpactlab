import React, { useState, useEffect } from 'react';
import { Header, AppTheme } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KPICards } from './components/KPICards';
import { PressureMap } from './components/PressureMap';
import { PrioritizedTable } from './components/PrioritizedTable';
import { PatientDetailPanel } from './components/PatientDetailPanel';
import { OperationalExplicationPanel } from './components/OperationalExplicationPanel';
import { CapacityDashboard } from './components/CapacityDashboard';
import { GlobalAuditView } from './components/GlobalAuditView';
import { Patient, ContraloriaStatus } from './types/patient';
import { UserRole, CapacitySummary } from './types/capacity';
import { fetchPacientes, updateContraloriaStatus, calcularNT118, fetchCapacitySummary } from './services/api';
import { Layers, ClipboardCheck, FileSpreadsheet, Download, Shield, Loader2, Building2 } from 'lucide-react';

export function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [cesfamName, setCesfamName] = useState<string>('CESFAM Carol Urzúa');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isExplicationOpen, setIsExplicationOpen] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<UserRole>('MEDICO_CONTRALOR');
  const [capacityData, setCapacityData] = useState<CapacitySummary | null>(null);
  const [loadingCapacity, setLoadingCapacity] = useState<boolean>(false);
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('health_os_theme') as AppTheme) || 'light';
  });

  // Apply Theme class to document root (light by default)
  useEffect(() => {
    localStorage.setItem('health_os_theme', theme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isSystemDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const loadCapacity = async () => {
      setLoadingCapacity(true);
      try {
        const data = await fetchCapacitySummary();
        setCapacityData(data);
      } catch (err) {
        console.error('Error fetching capacity summary:', err);
      } finally {
        setLoadingCapacity(false);
      }
    };
    loadCapacity();
  }, [cesfamName]);

  // Fetch Patients Asynchronously on mount and when CESFAM selection changes
  useEffect(() => {
    let isMounted = true;
    const loadPatients = async () => {
      setLoading(true);
      try {
        const data = await fetchPacientes(
          undefined,
          undefined,
          undefined,
          cesfamName !== 'ALL' ? cesfamName : undefined
        );
        if (isMounted) {
          setPatients(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching patients:', err);
          setError('Error al cargar la lista de pacientes.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPatients();
    return () => {
      isMounted = false;
    };
  }, [cesfamName]);

  // Handle Contraloría Action Update via API service
  const handleUpdateStatus = async (patientId: string, newStatus: ContraloriaStatus, clinicalNote: string) => {
    try {
      const updatedPatient = await updateContraloriaStatus(patientId, {
        new_status: newStatus,
        clinical_note: clinicalNote,
        physician_name: 'Dr. Alejandro Silva',
        physician_role: 'Médico Contralor APS'
      });

      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? updatedPatient : p))
      );

      if (selectedPatient && selectedPatient.id === patientId) {
        setSelectedPatient(updatedPatient);
      }
    } catch (err) {
      console.error('Error al registrar acción de contraloría:', err);
    }
  };

  const pendingCount = patients.filter((p) => p.contraloriaStatus === 'PENDIENTE').length;
  const criticalCount = patients.filter((p) => p.nt118Risk?.riskLevel === 'CRITICO').length;
  const avgNt118Score = patients.length > 0
    ? Math.round(patients.reduce((sum, p) => sum + (p.nt118Risk?.totalScore ?? 0), 0) / patients.length)
    : 0;

  // E2E Hook: recalculate live NT118 score when patient is selected from table
  const handleSelectPatient = async (p: Patient) => {
    setSelectedPatient(p);
    try {
      const liveScore = await calcularNT118({
        patientId: p.id,
        hba1c: p.hba1c,
        systolicBP: p.systolicBP,
        diastolicBP: p.diastolicBP,
        vfg: p.vfg,
        hasFootUlcer: p.hasFootUlcer,
        hasRetinopathy: p.hasRetinopathy,
        daysInWaitingList: p.daysInWaitingList,
        age: p.age,
        gender: p.gender,
        sector: p.sector,
        cesfamName: p.cesfamName,
      });
      setSelectedPatient({ ...p, nt118Risk: liveScore });
    } catch {
      // Fallback: keep cached score — already set above
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Header */}
      <Header
        cesfamName={cesfamName}
        onCesfamChange={setCesfamName}
        pendingCount={pendingCount}
        criticalCount={criticalCount}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        theme={theme}
        onThemeChange={setTheme}
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
          
          {activeTab === 'capacity' && (
            <CapacityDashboard
              capacityData={capacityData}
              loading={loadingCapacity}
            />
          )}

          {activeTab === 'dashboard' && (
            <>
              {/* Top Banner Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold apple-title">Health OS — Control de Listas de Espera APS</h2>
                    <span className="flex items-center gap-1 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/30 px-3 py-0.5 text-xs font-bold text-[#0071e3] dark:text-cyan-400">
                      <Shield className="h-3.5 w-3.5 text-[#0071e3]" /> Privacy by Design
                    </span>
                  </div>
                  <p className="text-xs font-medium apple-subtitle mt-1">
                    Priorización algorítmica por riesgo de descompensación (Norma Técnica 118 MINSAL)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsExplicationOpen(true)}
                    className="flex items-center gap-1.5 apple-control px-4 py-2 text-xs font-bold hover:opacity-90 transition-all"
                  >
                    <span>Criterios Algoritmo</span>
                  </button>
                  <button 
                    onClick={() => alert('Exportando reporte oficial SIGTE en formato Excel/CSV...')}
                    className="flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0066cc] px-4.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Exportar Lista Aprobada</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="glass-panel rounded-xl p-12 text-center space-y-3">
                  <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">Cargando lista de espera priorizada...</p>
                </div>
              ) : error ? (
                <div className="glass-panel rounded-xl p-6 text-center border-red-500/30 text-red-400">
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              ) : (
                <>
                  {/* KPI Summary Grid */}
                  <KPICards patients={patients} avgNt118Score={avgNt118Score} />

                  {/* Pressure Map APS */}
                  <PressureMap patients={patients} />

                  {/* Main Prioritized Table */}
                  <PrioritizedTable
                    patients={patients}
                    onSelectPatient={handleSelectPatient}
                  />
                </>
              )}
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
            <GlobalAuditView patients={patients} />
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
