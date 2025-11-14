import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Package, Database, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDevices: 0,
    compromisedDevices: 0,
    pendingPatches: 0,
    blockchainLogs: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadRecentAlerts();
      loadTerminalLogs();
    }
  }, [user]);

  const loadStats = async () => {
    const [devicesRes, alertsRes, logsRes] = await Promise.all([
      supabase.from("devices").select("*", { count: "exact" }).eq("user_id", user!.id),
      supabase.from("devices").select("*", { count: "exact" }).eq("user_id", user!.id).eq("status", "Compromised"),
      supabase.from("blockchain_logs").select("*", { count: "exact" }).eq("user_id", user!.id),
    ]);

    setStats({
      totalDevices: devicesRes.count || 0,
      compromisedDevices: alertsRes.count || 0,
      pendingPatches: 2, // Mock value
      blockchainLogs: logsRes.count || 0,
    });
  };

  const loadRecentAlerts = async () => {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user!.id)
      .order("timestamp", { ascending: false })
      .limit(5);
    setRecentAlerts(data || []);
  };

  const loadTerminalLogs = async () => {
    const { data } = await supabase
      .from("blockchain_logs")
      .select("*")
      .eq("user_id", user!.id)
      .order("timestamp", { ascending: false })
      .limit(10);
    setTerminalLogs(data || []);
  };

  const deviceHealthData = [
    { name: "Healthy", value: stats.totalDevices - stats.compromisedDevices, color: "#39FF14" },
    { name: "Compromised", value: stats.compromisedDevices, color: "#FF4444" },
    { name: "Isolated", value: 0, color: "#C77DFF" },
  ];

  const alertsData = [
    { name: "Critical", count: 2 },
    { name: "High", count: 5 },
    { name: "Medium", count: 8 },
    { name: "Low", count: 3 },
  ];

  const blockchainActivityData = [
    { time: "00:00", logs: 12 },
    { time: "04:00", logs: 19 },
    { time: "08:00", logs: 25 },
    { time: "12:00", logs: 31 },
    { time: "16:00", logs: 28 },
    { time: "20:00", logs: 35 },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Real-time monitoring of your IoT devices</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card className="border-primary/20 hover:border-primary/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Devices</CardTitle>
                <Shield className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalDevices}</div>
                <p className="text-xs text-muted-foreground mt-1">Active monitoring</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="border-destructive/20 hover:border-destructive/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Compromised</CardTitle>
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{stats.compromisedDevices}</div>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <Card className="border-accent/20 hover:border-accent/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Patches</CardTitle>
                <Package className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.pendingPatches}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to deploy</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <Card className="border-secondary/20 hover:border-secondary/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Blockchain Logs</CardTitle>
                <Database className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{stats.blockchainLogs}</div>
                <p className="text-xs text-muted-foreground mt-1">Immutable records</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Device Health Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={deviceHealthData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {deviceHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Alert Severity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={alertsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#161B22", border: "1px solid #00BFFF" }} />
                  <Bar dataKey="count" fill="#00BFFF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-secondary" />
              Blockchain Activity (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={blockchainActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#161B22", border: "1px solid #39FF14" }} />
                <Line type="monotone" dataKey="logs" stroke="#39FF14" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-secondary" />
              Live Terminal Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/80 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
              {terminalLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="text-secondary mb-1"
                >
                  [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                </motion.div>
              ))}
              {terminalLogs.length === 0 && (
                <p className="text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
