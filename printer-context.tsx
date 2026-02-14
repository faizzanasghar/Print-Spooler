import React, { createContext, useContext, ReactNode } from 'react';
import { usePrinterSystem, PrintJob, JobType, Printer } from '@/lib/printer-system';

interface PrinterContextType {
  queue: PrintJob[];
  activeJobs: PrintJob[];
  completedJobs: PrintJob[];
  printers: Printer[];
  addJob: (type: JobType, priority: number) => void;
  cancelJob: (id: string) => void;
  delayJob: (id: string, reason: string) => void;
  resumeJob: (id: string) => void;
  startJob: (id: string) => void;
  startNextJob: () => void;
  updateJobPriority: (id: string, newPriority: number) => void;
  togglePrinterStatus: (id: number) => void;
  clearHistory: () => void;
  clearQueue: () => void;
  setSimulationSpeed: (ms: number) => void;
  simulationSpeed: number;
  autoProcess: boolean;
  setAutoProcess: (val: boolean) => void;
  logs: string[];
  totalPrinters: number;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export function PrinterProvider({ children }: { children: ReactNode }) {
  const printerSystem = usePrinterSystem();

  return (
    <PrinterContext.Provider value={printerSystem}>
      {children}
    </PrinterContext.Provider>
  );
}

export function usePrinter() {
  const context = useContext(PrinterContext);
  if (context === undefined) {
    throw new Error('usePrinter must be used within a PrinterProvider');
  }
  return context;
}
