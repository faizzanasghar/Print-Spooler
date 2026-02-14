import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  LogOut, 
  Printer, 
  Settings, 
  History,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@assets/logo.jpg";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: History, label: "Job History", href: "/history" },
    { icon: Printer, label: "Printers", href: "/printers" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const NavContent = () => (
    <>
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-sidebar-primary/50">
              <img src={logo} alt="FORT TECH" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight text-sidebar-foreground">PrintPilot</h1>
              <span className="text-[10px] font-bold tracking-widest text-sidebar-primary opacity-90">FORT TECH</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  location === item.href
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-8 h-8 border border-sidebar-border">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">Admin User</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">admin@forttech.com</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </Link>
        </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar border-r-sidebar-border text-sidebar-foreground border-none">
             <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Mobile Header */}
        <div className="md:hidden border-b p-4 flex items-center justify-between bg-card">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/50">
                    <img src={logo} alt="FORT TECH" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold">PrintPilot</span>
             </div>
             <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                 <Menu className="w-5 h-5" />
             </Button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
