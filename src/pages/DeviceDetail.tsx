import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Package, Activity, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      loadDevice();
    }
  }, [user, id]);

  const loadDevice = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();

    if (error) {
      toast.error("Failed to load device");
      navigate("/devices");
    } else {
      setDevice(data);
    }
    setLoading(false);
  };

  const handleValidate = async () => {
    toast.info("Validating with peer network...");
    setTimeout(async () => {
      const { error } = await supabase
        .from("devices")
        .update({ status: "Compromised", reputation: 45 })
        .eq("id", id);

      if (!error) {
        toast.warning("Device validated as compromised!");
        await supabase.from("alerts").insert({
          user_id: user!.id,
          device_id: id,
          severity: "High",
          message: "Peer validation confirmed device compromise",
          timestamp: new Date().toISOString(),
        });
        await supabase.from("blockchain_logs").insert({
          user_id: user!.id,
          message: `Peer consensus: Device ${device?.name} validated as compromised`,
          timestamp: new Date().toISOString(),
        });
        loadDevice();
      }
    }, 2000);
  };

  const handleIsolate = async () => {
    const { error } = await supabase
      .from("devices")
      .update({ status: "Isolated", reputation: 50 })
      .eq("id", id);

    if (!error) {
      toast.success("Device isolated successfully");
      await supabase.from("blockchain_logs").insert({
        user_id: user!.id,
        message: `Device ${device?.name} isolated from network`,
        timestamp: new Date().toISOString(),
      });
      loadDevice();
    }
  };

  const handleApplyPatch = async () => {
    const { error } = await supabase
      .from("devices")
      .update({ status: "Healthy", reputation: 100, patch_version: "1.0.1" })
      .eq("id", id);

    if (!error) {
      toast.success("Patch applied! Device recovered.");
      await supabase.from("blockchain_logs").insert({
        user_id: user!.id,
        message: `Self-healing complete: Device ${device?.name} patched and recovered`,
        timestamp: new Date().toISOString(),
      });
      loadDevice();
    }
  };

  const reputationData = [
    { time: "00:00", score: 100 },
    { time: "04:00", score: 98 },
    { time: "08:00", score: 95 },
    { time: "12:00", score: 75 },
    { time: "16:00", score: device?.reputation || 100 },
  ];

  const telemetryData = [
    { time: "00:00", cpu: 45, memory: 62, network: 34 },
    { time: "04:00", cpu: 52, memory: 68, network: 41 },
    { time: "08:00", cpu: 78, memory: 85, network: 92 },
    { time: "12:00", cpu: 95, memory: 92, network: 98 },
    { time: "16:00", cpu: 48, memory: 65, network: 38 },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading device details...</p>
        </div>
      </Layout>
    );
  }

  if (!device) {
    return (
      <Layout>
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Device not found</p>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy":
        return "bg-secondary/20 text-secondary";
      case "Compromised":
        return "bg-destructive/20 text-destructive";
      case "Isolated":
        return "bg-accent/20 text-accent";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/devices")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {device.name}
            </h1>
            <p className="text-muted-foreground mt-2">Device ID: {device.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(device.status)}>{device.status}</Badge>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Type</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground">{device.type}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground">{device.reputation}%</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Patch Version</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground">{device.patch_version}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Self-Healing Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleValidate}
                disabled={device.status === "Compromised"}
                className="bg-primary hover:bg-primary/90"
              >
                <Shield className="w-4 h-4 mr-2" />
                Validate with Peers
              </Button>
              <Button
                onClick={handleIsolate}
                disabled={device.status === "Isolated"}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Isolate Device
              </Button>
              <Button
                onClick={handleApplyPatch}
                disabled={device.status === "Healthy"}
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary/10"
              >
                <Package className="w-4 h-4 mr-2" />
                Apply Patch
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Reputation Score Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={reputationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#161B22", border: "1px solid #00BFFF" }} />
                <Line type="monotone" dataKey="score" stroke="#00BFFF" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" />
              Telemetry Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#161B22", border: "1px solid #00BFFF" }} />
                <Line type="monotone" dataKey="cpu" stroke="#00BFFF" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#39FF14" strokeWidth={2} name="Memory %" />
                <Line type="monotone" dataKey="network" stroke="#C77DFF" strokeWidth={2} name="Network %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
