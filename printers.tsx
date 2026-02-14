import { Layout } from "@/components/layout";
import { usePrinter } from "@/context/printer-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Printer, Power, AlertTriangle, Activity, PenTool } from "lucide-react";

export default function PrintersPage() {
  const { printers, togglePrinterStatus, activeJobs } = usePrinter();

  return (
    <Layout>
       <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Printer Management</h1>
          <p className="text-muted-foreground">Monitor and configure connected print hardware.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {printers.map((printer) => {
            const activeJob = activeJobs.find(j => j.printerId === printer.id);
            const isOffline = printer.status === 'Offline' || printer.status === 'Maintenance';
            
            return (
              <Card key={printer.id} className={`transition-all ${isOffline ? 'opacity-70 border-dashed' : 'border-primary/20 shadow-md'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOffline ? 'bg-muted' : 'bg-primary/10'}`}>
                        <Printer className={`w-6 h-6 ${isOffline ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Printer {printer.id}</CardTitle>
                        <CardDescription className="text-xs">{printer.name}</CardDescription>
                      </div>
                    </div>
                    <Switch 
                      checked={printer.status === 'Online'} 
                      onCheckedChange={() => togglePrinterStatus(printer.id)} 
                    />
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      {printer.status === 'Online' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Online</Badge>
                      ) : (
                         <Badge variant="secondary">{printer.status}</Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                       <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Efficiency</span>
                        <span className="font-mono">{printer.efficiency}%</span>
                      </div>
                      <Progress value={printer.efficiency} className="h-1.5" />
                    </div>

                    <div className="p-3 bg-muted/50 rounded-md space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                         {activeJob ? (
                            <>
                                <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                                <span>Processing: <span className="font-mono">{activeJob.id}</span></span>
                            </>
                         ) : (
                            <>
                                <Power className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Idle</span>
                            </>
                         )}
                      </div>
                      {activeJob && <Progress value={activeJob.progress} className="h-1 bg-blue-100" />}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                   <div className="flex justify-between w-full text-xs text-muted-foreground">
                      <span>Total Jobs: {printer.totalJobsProcessed}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <PenTool className="w-3 h-3" />
                      </Button>
                   </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
