import { useState, useEffect, useCallback, useRef } from 'react';

// ==========================================
//          CORE DATA STRUCTURES
// ==========================================

export type JobType = 'pdf' | 'doc' | 'img';
export type JobStatus = 'Queued' | 'Processing' | 'Completed' | 'Delayed';
export type PrinterStatus = 'Online' | 'Offline' | 'Maintenance' | 'Error';

export interface PrintJob {
  id: string;
  type: JobType;
  priority: number; // 1 (High) - 5 (Low)
  status: JobStatus;
  reason: string;
  createdAt: number;
  completedAt?: number;
  progress: number; // 0-100
  printerId?: number;
}

export interface Printer {
  id: number;
  name: string;
  status: PrinterStatus;
  totalJobsProcessed: number;
  efficiency: number; // 0-100%
}

// MinHeap Implementation for Priority Queue
class MinHeap {
  heap: PrintJob[];
  
  constructor() {
    this.heap = [];
  }

  size(): number {
    return this.heap.length;
  }

  insert(job: PrintJob) {
    this.heap.push(job);
    this.siftUp(this.heap.length - 1);
  }

  extractMin(): PrintJob | undefined {
    if (this.heap.length === 0) return undefined;
    
    const min = this.heap[0];
    const last = this.heap.pop();
    
    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    
    return min;
  }

  peek(): PrintJob | undefined {
    return this.heap[0];
  }

  remove(id: string): PrintJob | undefined {
    const index = this.heap.findIndex(j => j.id === id);
    if (index === -1) return undefined;

    const removed = this.heap[index];
    const last = this.heap.pop();

    if (index < this.heap.length && last) {
      this.heap[index] = last;
      this.siftUp(index);
      this.siftDown(index);
    }

    return removed;
  }

  updatePriority(id: string, newPriority: number) {
    const index = this.heap.findIndex(j => j.id === id);
    if (index !== -1) {
      const oldPriority = this.heap[index].priority;
      this.heap[index].priority = newPriority;
      if (newPriority < oldPriority) {
        this.siftUp(index);
      } else {
        this.siftDown(index);
      }
    }
  }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private siftUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index].priority < this.heap[parent].priority) {
        this.swap(index, parent);
        index = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number) {
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }

      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }
  
  // Helper to get all jobs (unordered for display, or we could sort them)
  getAllJobs(): PrintJob[] {
    return [...this.heap];
  }
  
  clear() {
    this.heap = [];
  }
}

// ==========================================
//           SIMULATION HOOK
// ==========================================

export function usePrinterSystem() {
  const [queue, setQueue] = useState<MinHeap>(new MinHeap());
  const [activeJobs, setActiveJobs] = useState<PrintJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<PrintJob[]>([]);
  
  // Enhanced Printer State
  const [printers, setPrinters] = useState<Printer[]>([
    { id: 1, name: "LaserJet Pro M404", status: 'Online', totalJobsProcessed: 124, efficiency: 98 },
    { id: 2, name: "HP Color LaserJet", status: 'Online', totalJobsProcessed: 89, efficiency: 95 },
    { id: 3, name: "Canon ImageRunner", status: 'Online', totalJobsProcessed: 210, efficiency: 92 },
    { id: 4, name: "Brother HL-L2350", status: 'Maintenance', totalJobsProcessed: 45, efficiency: 88 },
    { id: 5, name: "Epson EcoTank", status: 'Online', totalJobsProcessed: 156, efficiency: 96 }
  ]);

  const [nextId, setNextId] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [simulationSpeed, setSimulationSpeed] = useState(500); // ms per tick
  const [autoProcess, setAutoProcess] = useState(false); // Default false as per request

  // Force update for UI when heap changes (since heap is mutable)
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);

  const log = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const addJob = (type: JobType, priority: number) => {
    const id = `${type.toUpperCase()}${nextId}`;
    setNextId(prev => prev + 1);
    
    const newJob: PrintJob = {
      id,
      type,
      priority,
      status: 'Queued',
      reason: 'None',
      createdAt: Date.now(),
      progress: 0
    };

    queue.insert(newJob);
    log(`Job Created: ${id} (Priority: ${priority})`);
    forceUpdate();
  };

  const cancelJob = (id: string) => {
    const removed = queue.remove(id);
    if (removed) {
      log(`Job Cancelled: ${id}`);
      forceUpdate();
    } else {
        const activeIdx = activeJobs.findIndex(j => j.id === id);
        if (activeIdx !== -1) {
            const job = activeJobs[activeIdx];
            setActiveJobs(prev => prev.filter(j => j.id !== id));
            log(`Active Job Cancelled: ${id} on Printer ${job.printerId}`);
        } else {
            log(`Could not find job ${id} to cancel`);
        }
    }
  };

  const delayJob = (id: string, reason: string) => {
      const jobs = queue.getAllJobs();
      const job = jobs.find(j => j.id === id);
      if (job) {
          job.status = 'Delayed';
          job.reason = reason;
          log(`Job ${id} Delayed: ${reason}`);
          forceUpdate();
      }
  };
  
  const resumeJob = (id: string) => {
      const jobs = queue.getAllJobs();
      const job = jobs.find(j => j.id === id);
      if (job) {
          job.status = 'Queued';
          job.reason = 'None';
          log(`Job ${id} Resumed`);
          forceUpdate();
      }
  };

  const startJob = (id: string) => {
      // Manually start a specific job if a printer is free
      const jobs = queue.getAllJobs();
      const job = jobs.find(j => j.id === id);
      
      if (!job) {
          log(`Job ${id} not found in queue.`);
          return;
      }

      // Find free printer
      const availablePrinter = printers.find(p => p.status === 'Online' && !activeJobs.find(j => j.printerId === p.id));
      
      if (!availablePrinter) {
          log(`No available printers to start Job ${id}`);
          return;
      }

      // Remove from queue and add to active
      queue.remove(id);
      job.status = 'Processing';
      job.printerId = availablePrinter.id;
      setActiveJobs(prev => [...prev, job]);
      log(`Manually started Job ${id} on Printer ${availablePrinter.id}`);
      forceUpdate();
  };

  const startNextJob = () => {
      const availablePrinter = printers.find(p => p.status === 'Online' && !activeJobs.find(j => j.printerId === p.id));
      if (!availablePrinter) {
          log("No printers available.");
          return;
      }

      const job = queue.extractMin();
      if (job) {
           job.status = 'Processing';
           job.printerId = availablePrinter.id;
           setActiveJobs(prev => [...prev, job]);
           log(`Started Job ${job.id} on Printer ${availablePrinter.id}`);
           forceUpdate();
      } else {
          log("Queue is empty.");
      }
  }

  const updateJobPriority = (id: string, newPriority: number) => {
      queue.updatePriority(id, newPriority);
      log(`Job ${id} priority updated to ${newPriority}`);
      forceUpdate();
  }

  const togglePrinterStatus = (id: number) => {
      setPrinters(prev => prev.map(p => {
          if (p.id === id) {
              const newStatus = p.status === 'Online' ? 'Offline' : 'Online';
              log(`Printer ${id} is now ${newStatus}`);
              return { ...p, status: newStatus };
          }
          return p;
      }));
  };

  const clearHistory = () => {
      setCompletedJobs([]);
      log("Job History Cleared");
  };

  const clearQueue = () => {
      queue.clear();
      forceUpdate();
      log("Queue Cleared");
  };

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      let updated = false;

      // 1. Assign jobs to free printers (ONLY IF AUTO PROCESS IS ON)
      if (autoProcess) {
          const availablePrinters = printers.filter(p => 
              p.status === 'Online' && !activeJobs.find(j => j.printerId === p.id)
          );

          if (queue.size() > 0 && availablePrinters.length > 0) {
            for (const printer of availablePrinters) {
                const nextJob = queue.peek();
                if (!nextJob) break;

                if (nextJob.status === 'Delayed') break; 

                const job = queue.extractMin();
                if (job) {
                    job.status = 'Processing';
                    job.printerId = printer.id;
                    setActiveJobs(prev => [...prev, job]);
                    log(`Printer ${printer.id} started: ${job.id}`);
                    updated = true;
                } else {
                    break;
                }
            }
          }
      }

      // 2. Process Active Jobs (Always runs, even if auto-process is off, because once started, they should finish)
      if (activeJobs.length > 0) {
        setActiveJobs(prev => prev.map(job => {
            const printer = printers.find(p => p.id === job.printerId);
            const efficiencyMultiplier = printer ? (printer.efficiency / 100) : 1;
            
            const increment = (Math.random() * 10 + 2) * efficiencyMultiplier; 
            const newProgress = Math.min(job.progress + increment, 100);
            
            if (newProgress >= 100) {
                return { ...job, progress: 100, status: 'Completed', completedAt: Date.now() };
            }
            return { ...job, progress: newProgress };
        }));

        const justCompleted = activeJobs.filter(j => j.status === 'Completed' || j.progress >= 100);
        const stillActive = activeJobs.filter(j => j.status !== 'Completed' && j.progress < 100);

        if (justCompleted.length > 0) {
            justCompleted.forEach(j => {
                j.status = 'Completed';
                log(`Job Finished: ${j.id}`);
                
                setPrinters(curr => curr.map(p => {
                    if (p.id === j.printerId) {
                        return { ...p, totalJobsProcessed: p.totalJobsProcessed + 1 };
                    }
                    return p;
                }));
            });
            setCompletedJobs(prev => [...justCompleted, ...prev].slice(0, 100)); 
            setActiveJobs(stillActive);
            updated = true;
        } else {
             updated = true;
        }
      }

      if (updated) forceUpdate();

    }, simulationSpeed); 

    return () => clearInterval(interval);
  }, [queue, activeJobs, printers, simulationSpeed, autoProcess]);

  return {
    queue: queue.getAllJobs().sort((a,b) => a.priority - b.priority), 
    activeJobs,
    completedJobs,
    printers,
    addJob,
    cancelJob,
    delayJob,
    resumeJob,
    startJob,
    startNextJob,
    updateJobPriority,
    togglePrinterStatus,
    clearHistory,
    clearQueue,
    logs,
    setSimulationSpeed,
    simulationSpeed,
    autoProcess,
    setAutoProcess,
    totalPrinters: printers.length
  };
}
