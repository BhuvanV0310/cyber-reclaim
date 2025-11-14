import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield, Activity, AlertTriangle, Package, Database, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Activity },
    { path: "/devices", label: "Devices", icon: Shield },
    { path: "/alerts", label: "Alerts", icon: AlertTriangle },
    { path: "/patches", label: "Patches", icon: Package },
    { path: "/blockchain", label: "Blockchain", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-primary via-accent to-secondary rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Shield className="w-5 h-5 text-background" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  IoT Security
                </span>
              </Link>
              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={
                          isActive
                            ? "text-secondary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
            {user && (
              <Button
                variant="ghost"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
