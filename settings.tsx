import { Layout } from "@/components/layout";
import { usePrinter } from "@/context/printer-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Trash2, RotateCcw, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

export default function SettingsPage() {
  const { clearQueue, clearHistory, simulationSpeed, setSimulationSpeed, autoProcess, setAutoProcess } = usePrinter();
  const { theme, setTheme } = useTheme();

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure simulation parameters and data management.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of PrintPilot.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Dark Mode</h4>
                        <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4 text-muted-foreground" />
                        <Switch 
                            checked={theme === "dark"}
                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                        />
                        <Moon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulation Control</CardTitle>
            <CardDescription>Adjust the speed and automation of the printer engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h4 className="text-sm font-medium">Auto-Process Queue</h4>
                    <p className="text-xs text-muted-foreground">Automatically assign jobs to free printers.</p>
                 </div>
                 <Switch 
                    checked={autoProcess}
                    onCheckedChange={setAutoProcess}
                 />
            </div>
            <Separator />
            <div className="space-y-4">
               <div className="flex justify-between">
                  <Label>Tick Rate (Speed)</Label>
                  <span className="text-sm text-muted-foreground font-mono">{simulationSpeed}ms</span>
               </div>
               <Slider 
                 defaultValue={[simulationSpeed]} 
                 max={2000} 
                 min={100} 
                 step={100} 
                 onValueChange={(val) => setSimulationSpeed(val[0])}
               />
               <p className="text-xs text-muted-foreground">
                 Lower values mean faster simulation. 100ms is very fast, 2000ms is slow.
               </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Data Management</CardTitle>
             <CardDescription>Manage queues and historical data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                   <h4 className="text-sm font-medium">Clear Job Queue</h4>
                   <p className="text-xs text-muted-foreground">Remove all pending jobs from the heap.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => clearQueue()}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Queue
                </Button>
             </div>

             <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                   <h4 className="text-sm font-medium">Clear History</h4>
                   <p className="text-xs text-muted-foreground">Delete logs of completed jobs.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => clearHistory()}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset History
                </Button>
             </div>
          </CardContent>
        </Card>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Advanced Zone</AlertTitle>
          <AlertDescription>
            Resetting the system will also reset printer efficiency stats and IDs.
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
}
