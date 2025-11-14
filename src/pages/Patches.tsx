import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Download, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Patches() {
  const { user } = useAuth();
  const [patches, setPatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPatches();
    }
  }, [user]);

  const loadPatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("patches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load patches");
    } else {
      setPatches(data || []);
    }
    setLoading(false);
  };

  const addSamplePatches = async () => {
    const samplePatches = [
      {
        version: "1.0.1",
        hash: "a3f5c9e2d8b1f4a7c6e9d2b5f8a1c4e7",
        description: "Security patch for authentication vulnerability",
      },
      {
        version: "1.0.2",
        hash: "b2d8f1a4c7e9d2b5f8a1c4e7a3f5c9e2",
        description: "Performance improvements and bug fixes",
      },
      {
        version: "1.1.0",
        hash: "c4e7a3f5c9e2d8b1f4a7c6e9d2b5f8a1",
        description: "New encryption algorithm implementation",
      },
    ];

    for (const patch of samplePatches) {
      await supabase.from("patches").insert(patch);
    }

    toast.success("Sample patches added!");
    loadPatches();
  };

  const applyPatchToDevices = async (patchVersion: string, patchHash: string) => {
    const { data: devices } = await supabase
      .from("devices")
      .select("id, name")
      .eq("user_id", user!.id)
      .eq("status", "Compromised");

    if (!devices || devices.length === 0) {
      toast.info("No compromised devices to patch");
      return;
    }

    for (const device of devices) {
      await supabase
        .from("devices")
        .update({ status: "Healthy", reputation: 100, patch_version: patchVersion })
        .eq("id", device.id);

      await supabase.from("blockchain_logs").insert({
        user_id: user!.id,
        message: `Patch ${patchVersion} (${patchHash}) applied to ${device.name}`,
        timestamp: new Date().toISOString(),
      });
    }

    toast.success(`Patch ${patchVersion} applied to ${devices.length} device(s)`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Security Patches
            </h1>
            <p className="text-muted-foreground mt-2">Manage and deploy security updates</p>
          </div>
          <Button onClick={addSamplePatches} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Sample Patches
          </Button>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" />
              Available Patches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading patches...</p>
            ) : patches.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No patches found. Add sample patches to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patches.map((patch, index) => (
                  <motion.div
                    key={patch.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30">
                                v{patch.version}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-mono">
                                {patch.hash}
                              </span>
                            </div>
                            <p className="text-foreground">{patch.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Released: {new Date(patch.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => applyPatchToDevices(patch.version, patch.hash)}
                            className="bg-secondary hover:bg-secondary/90"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Apply to Devices
                          </Button>
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
