import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Eye, AlertTriangle, Package, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Devices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDevices();
    }
  }, [user]);

  const loadDevices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load devices");
    } else {
      setDevices(data || []);
    }
    setLoading(false);
  };

  const handleIsolate = async (deviceId: string) => {
    const { error } = await supabase
      .from("devices")
      .update({ status: "Isolated", reputation: 50 })
      .eq("id", deviceId);

    if (error) {
      toast.error("Failed to isolate device");
    } else {
      toast.success("Device isolated successfully");
      await supabase.from("blockchain_logs").insert({
        user_id: user!.id,
        message: `Device ${deviceId} isolated due to suspicious activity`,
        timestamp: new Date().toISOString(),
      });
      loadDevices();
    }
  };

  const handleApplyPatch = async (deviceId: string) => {
    const { error } = await supabase
      .from("devices")
      .update({ status: "Healthy", reputation: 100, patch_version: "1.0.1" })
      .eq("id", deviceId);

    if (error) {
      toast.error("Failed to apply patch");
    } else {
      toast.success("Patch applied successfully");
      await supabase.from("blockchain_logs").insert({
        user_id: user!.id,
        message: `Patch v1.0.1 applied to device ${deviceId}`,
        timestamp: new Date().toISOString(),
      });
      loadDevices();
    }
  };

  const addSampleDevices = async () => {
    const sampleDevices = [
      { name: "Smart Lock Alpha", type: "Smart Lock", status: "Healthy", reputation: 100 },
      { name: "CCTV Cam 01", type: "CCTV", status: "Healthy", reputation: 100 },
      { name: "Sensor Node 42", type: "Sensor", status: "Compromised", reputation: 45 },
      { name: "Gateway Device", type: "Gateway", status: "Healthy", reputation: 98 },
    ];

    for (const device of sampleDevices) {
      await supabase.from("devices").insert({
        ...device,
        user_id: user!.id,
      });
    }

    toast.success("Sample devices added!");
    loadDevices();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy":
        return "bg-secondary/20 text-secondary hover:bg-secondary/30";
      case "Compromised":
        return "bg-destructive/20 text-destructive hover:bg-destructive/30";
      case "Isolated":
        return "bg-accent/20 text-accent hover:bg-accent/30";
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
              Device Management
            </h1>
            <p className="text-muted-foreground mt-2">Monitor and manage your IoT devices</p>
          </div>
          <Button onClick={addSampleDevices} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Sample Devices
          </Button>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Active Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading devices...</p>
            ) : devices.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No devices found. Add sample devices to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reputation</TableHead>
                      <TableHead>Patch Version</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device, index) => (
                      <motion.tr
                        key={device.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TableCell className="font-medium">{device.name}</TableCell>
                        <TableCell>{device.type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(device.status)}>
                            {device.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-destructive via-accent to-secondary"
                                style={{ width: `${device.reputation}%` }}
                              />
                            </div>
                            <span className="text-sm">{device.reputation}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{device.patch_version}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(device.last_seen).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/devices/${device.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {device.status !== "Isolated" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleIsolate(device.id)}
                                className="text-accent hover:text-accent"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            )}
                            {device.status === "Compromised" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApplyPatch(device.id)}
                                className="text-secondary hover:text-secondary"
                              >
                                <Package className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
