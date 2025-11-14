import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("alerts")
      .select("*, devices(name)")
      .eq("user_id", user!.id)
      .order("timestamp", { ascending: false });

    if (error) {
      toast.error("Failed to load alerts");
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const addSampleAlerts = async () => {
    const { data: devices } = await supabase
      .from("devices")
      .select("id")
      .eq("user_id", user!.id)
      .limit(3);

    if (!devices || devices.length === 0) {
      toast.error("Please add devices first");
      return;
    }

    const sampleAlerts = [
      { severity: "Critical", message: "Unauthorized access attempt detected", device_id: devices[0].id },
      { severity: "High", message: "Abnormal network traffic pattern", device_id: devices[1]?.id || devices[0].id },
      { severity: "Medium", message: "CPU usage spike detected", device_id: devices[2]?.id || devices[0].id },
      { severity: "Low", message: "Firmware update available", device_id: devices[0].id },
    ];

    for (const alert of sampleAlerts) {
      await supabase.from("alerts").insert({
        ...alert,
        user_id: user!.id,
        timestamp: new Date().toISOString(),
      });
    }

    toast.success("Sample alerts added!");
    loadAlerts();
  };

  const markResolved = async (alertId: string) => {
    const { error } = await supabase
      .from("alerts")
      .update({ resolved: true })
      .eq("id", alertId);

    if (error) {
      toast.error("Failed to mark as resolved");
    } else {
      toast.success("Alert marked as resolved");
      loadAlerts();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-destructive/20 text-destructive hover:bg-destructive/30";
      case "High":
        return "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30";
      case "Medium":
        return "bg-accent/20 text-accent hover:bg-accent/30";
      case "Low":
        return "bg-secondary/20 text-secondary hover:bg-secondary/30";
      default:
        return "bg-muted/20 text-muted-foreground hover:bg-muted/30";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Security Alerts
            </h1>
            <p className="text-muted-foreground mt-2">Monitor and respond to security events</p>
          </div>
          <Button onClick={addSampleAlerts} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Sample Alerts
          </Button>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No alerts found. Add sample alerts to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`border ${alert.resolved ? "border-muted/30 opacity-60" : "border-primary/30"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {alert.resolved && (
                                <Badge className="bg-muted/20 text-muted-foreground">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <p className="text-foreground font-medium">{alert.message}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Device: {alert.devices?.name || "Unknown"}</span>
                              <span>•</span>
                              <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          {!alert.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markResolved(alert.id)}
                              className="border-secondary text-secondary hover:bg-secondary/10"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
