import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BlockchainLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLogs();
      const interval = setInterval(loadLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blockchain_logs")
      .select("*")
      .eq("user_id", user!.id)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to load logs:", error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const addSampleLogs = async () => {
    const sampleLogs = [
      "System initialized - Blockchain security layer activated",
      "Device CCTV-01 registered on blockchain",
      "Smart Lock Alpha health check completed - Status: HEALTHY",
      "Anomaly detection scan completed - 0 threats found",
      "Patch v1.0.1 metadata recorded to blockchain",
      "Peer consensus protocol activated for device validation",
      "Device reputation score updated: Sensor-42 (85%)",
      "Self-healing workflow initiated for compromised device",
      "Blockchain integrity check passed - All hashes valid",
      "Security audit log: 24 events recorded in last hour",
    ];

    for (const message of sampleLogs) {
      await supabase.from("blockchain_logs").insert({
        user_id: user!.id,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    toast.success("Sample logs added!");
    loadLogs();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Blockchain Logs
            </h1>
            <p className="text-muted-foreground mt-2">Immutable security event records</p>
          </div>
          <Button onClick={addSampleLogs} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Sample Logs
          </Button>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-secondary" />
              Terminal Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && logs.length === 0 ? (
              <div className="bg-black/90 rounded-lg p-4 font-mono text-sm">
                <p className="text-secondary animate-pulse">Connecting to blockchain...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No blockchain logs found. Add sample logs to get started.</p>
              </div>
            ) : (
              <div className="bg-black/90 rounded-lg p-4 font-mono text-sm max-h-[600px] overflow-y-auto space-y-1">
                {logs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.5) }}
                    className="text-secondary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                  >
                    <span className="text-accent">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                    <span className="text-primary">BLOCK#{String(index + 1).padStart(6, "0")}</span>{" "}
                    <span className="text-secondary">{log.message}</span>
                  </motion.div>
                ))}
                {logs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    className="text-secondary"
                  >
                    ▊
                  </motion.div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Blockchain Security Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-accent font-semibold">Immutable Records</p>
                  <p className="text-muted-foreground">All security events are permanently logged</p>
                </div>
                <div className="space-y-1">
                  <p className="text-secondary font-semibold">Hash Verification</p>
                  <p className="text-muted-foreground">Cryptographic proof of data integrity</p>
                </div>
                <div className="space-y-1">
                  <p className="text-primary font-semibold">Distributed Trust</p>
                  <p className="text-muted-foreground">Peer consensus for validation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
