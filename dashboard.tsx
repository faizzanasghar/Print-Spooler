import { useState } from "react";
import { Layout } from "@/components/layout";
import { usePrinter } from "@/context/printer-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Printer, 
  Clock, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  File,
  Trash2,
  PlayCircle,
  Activity,
  PauseCircle,
  Play,
  Rocket
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

// Helper to get icon by type
const JobIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
    case 'img': return <ImageIcon className="w-4 h-4 text-blue-500" />;
    default: return <File className="w-4 h-4 text-gray-500" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Queued': return <Badge variant="outline" className="border-slate-400 text-slate-600">Queued</Badge>;
    case 'Processing': return <Badge className="bg-blue-500 hover:bg-blue-600 animate-pulse">Printing</Badge>;
    case 'Completed': return <Badge className="bg-green-500 hover:bg-green-600">Done</Badge>;
    case 'Delayed': return <Badge variant="destructive">Delayed</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function Dashboard() {
  const { 
    queue, 
    activeJobs, 
    completedJobs, 
    addJob, 
    cancelJob, 
    delayJob,
    resumeJob,
    startJob,
    startNextJob,
    autoProcess,
    logs, 
    totalPrinters 
  } = usePrinter();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newJobType, setNewJobType] = useState<string>("doc");
  const [newJobPrio, setNewJobPrio] = useState<string>("3");

  const handleAddJob = () => {
    addJob(newJobType as any, parseInt(newJobPrio));
    setIsAddOpen(false);
  };

  // Calculate Stats
  const pendingCount = queue.length;
  const activeCount = activeJobs.length;
  const completedCount = completedJobs.length;
  
  // Sort active jobs by printer ID for consistent display
  const sortedActiveJobs = [...activeJobs].sort((a, b) => (a.printerId || 0) - (b.printerId || 0));

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Top Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Jobs waiting in heap</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Printers</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount} <span className="text-muted-foreground text-sm font-normal">/ {totalPrinters}</span></div>
              <p className="text-xs text-muted-foreground">Currently processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <Printer className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">Optimal Performance</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Job Queue & Active Jobs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Printers Section */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Live Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active print jobs. Printers are idle.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                      {sortedActiveJobs.map((job) => (
                        <motion.div 
                          key={job.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-card border border-border rounded-lg p-4 shadow-sm flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold">
                            P{job.printerId}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-mono font-bold text-sm">{job.id}</span>
                              <span className="text-xs text-muted-foreground">{Math.round(job.progress)}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                          <div className="text-xs text-muted-foreground w-16 text-right">
                            {job.type.toUpperCase()}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Queue Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <CardTitle>Job Queue</CardTitle>
                        <CardDescription>Priority-based execution list</CardDescription>
                    </div>
                    {!autoProcess && queue.length > 0 && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={startNextJob}>
                            <Rocket className="w-4 h-4 mr-2" />
                            Process Next
                        </Button>
                    )}
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Print Job</DialogTitle>
                      <DialogDescription>Add a document to the priority queue.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select value={newJobType} onValueChange={setNewJobType}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="doc">Document (DOC)</SelectItem>
                            <SelectItem value="pdf">PDF File</SelectItem>
                            <SelectItem value="img">Image (JPG/PNG)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="prio" className="text-right">Priority</Label>
                        <Select value={newJobPrio} onValueChange={setNewJobPrio}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Critical (Top)</SelectItem>
                            <SelectItem value="2">2 - High</SelectItem>
                            <SelectItem value="3">3 - Normal</SelectItem>
                            <SelectItem value="4">4 - Low</SelectItem>
                            <SelectItem value="5">5 - Background</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddJob}>Submit Job</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Queue is empty.
                        </TableCell>
                      </TableRow>
                    ) : (
                      queue.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium font-mono">{job.id}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            <JobIcon type={job.type} />
                            <span className="capitalize">{job.type}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.priority <= 2 ? "default" : "outline"}>
                              P{job.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={job.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                {!autoProcess && job.status === 'Queued' && (
                                     <Tooltip>
                                     <TooltipTrigger asChild>
                                       <Button variant="outline" size="icon" className="text-green-600" onClick={() => startJob(job.id)}>
                                         <Play className="w-4 h-4" />
                                       </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>
                                       <p>Start This Job</p>
                                     </TooltipContent>
                                   </Tooltip>
                                )}
                                {job.status === 'Delayed' ? (
                                     <Tooltip>
                                     <TooltipTrigger asChild>
                                       <Button variant="ghost" size="icon" onClick={() => resumeJob(job.id)}>
                                         <Play className="w-4 h-4 text-green-500" />
                                       </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>
                                       <p>Resume Job</p>
                                     </TooltipContent>
                                   </Tooltip>
                                ) : (
                                    <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => delayJob(job.id, "Manual hold")}>
                                        <PauseCircle className="w-4 h-4 text-amber-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delay/Hold Job</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => cancelJob(job.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Cancel Job</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats & Logs */}
          <div className="space-y-6">
            
            {/* AI Suggestions Panel */}
            <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-background border-indigo-100 dark:border-indigo-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <PlayCircle className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {!autoProcess ? "Manual Mode Active" : "Based on current queue velocity:"}
                </div>
                {!autoProcess ? (
                     <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900 text-sm text-amber-800 dark:text-amber-200">
                     ⚠️ <strong>Manual Mode:</strong> Jobs will wait in queue until you click "Start" or "Process Next".
                   </div>
                ) : (
                    <>
                    {pendingCount > 3 ? (
                        <div className="p-3 bg-white dark:bg-card rounded-lg border border-border shadow-sm text-sm">
                        ⚠️ <strong>Optimization:</strong> High load detected. Prioritizing short PDF tasks to clear buffer.
                        </div>
                        ) : (
                        <div className="p-3 bg-white dark:bg-card rounded-lg border border-border shadow-sm text-sm">
                        ✅ <strong>Status:</strong> System operating at normal capacity. No delays predicted.
                        </div>
                        )}
                    </>
                )}
                 <div className="p-3 bg-white dark:bg-card rounded-lg border border-border shadow-sm text-sm">
                  💡 <strong>Tip:</strong> Jobs with Priority 1 bypass the standard queue.
                </div>
              </CardContent>
            </Card>

            {/* System Logs */}
            <Card className="h-[400px] flex flex-col">
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-2 font-mono text-xs">
                    {logs.map((log, i) => (
                      <div key={i} className="text-muted-foreground border-b border-border/50 pb-1 last:border-0">
                        {log}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
