import { Layout } from "@/components/layout";
import { usePrinter } from "@/context/printer-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, Download, FileText, Image as ImageIcon, File } from "lucide-react";
import { useState } from "react";

const JobIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
    case 'img': return <ImageIcon className="w-4 h-4 text-blue-500" />;
    default: return <File className="w-4 h-4 text-gray-500" />;
  }
};

export default function HistoryPage() {
  const { completedJobs, clearHistory } = usePrinter();
  const [search, setSearch] = useState("");

  const filteredJobs = completedJobs.filter(job => 
    job.id.toLowerCase().includes(search.toLowerCase()) ||
    job.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    if (completedJobs.length === 0) return;

    const headers = ["Job ID", "Type", "Printer", "Priority", "Completed At", "Status"];
    const rows = completedJobs.map(job => [
        job.id,
        job.type,
        `Printer ${job.printerId}`,
        job.priority,
        job.completedAt ? new Date(job.completedAt).toLocaleString() : '',
        "Success"
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "print_job_history.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job History</h1>
            <p className="text-muted-foreground">Archive of all processed print tasks.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => clearHistory()} disabled={completedJobs.length === 0}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
            <Button variant="secondary" onClick={handleExportCSV} disabled={completedJobs.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Completed Jobs</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search job ID..." 
                  className="pl-8" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Printer</TableHead>
                  <TableHead>Completed At</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono font-medium">{job.id}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <JobIcon type={job.type} />
                        <span className="capitalize">{job.type}</span>
                      </TableCell>
                      <TableCell>Printer {job.printerId}</TableCell>
                      <TableCell>
                        {job.completedAt ? new Date(job.completedAt).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline">P{job.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
