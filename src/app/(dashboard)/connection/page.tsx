"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface Instance {
  id: string;
  name: string;
  sessionName: string;
  phoneNumber: string | null;
  status: string;
  createdAt: string;
}

export default function ConnectionPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchInstances = useCallback(async () => {
    try {
      const res = await fetch("/api/instances");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInstances(data.instances || []);
    } catch (error) {
      toast.error("Failed to load instances");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  // Poll for QR status when connecting
  useEffect(() => {
    if (!selectedInstance || selectedInstance.status !== "qr_code") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/instances/${selectedInstance.id}/qr`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "connected") {
          setQrCode(null);
          setSelectedInstance((prev) =>
            prev ? { ...prev, status: "connected", phoneNumber: data.phoneNumber } : null
          );
          toast.success("WhatsApp connected!");
          fetchInstances();
          clearInterval(interval);
        } else if (data.qr) {
          setQrCode(data.qr);
        }
      } catch {
        // Ignore poll errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedInstance, fetchInstances]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }
      const data = await res.json();
      setInstances((prev) => [...prev, data.instance]);
      setNewName("");
      toast.success("Instance created");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnect = async (instance: Instance) => {
    setSelectedInstance(instance);
    setIsConnecting(instance.id);
    try {
      const res = await fetch(`/api/instances/${instance.id}/connect`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to connect");
      const data = await res.json();

      setSelectedInstance((prev) =>
        prev ? { ...prev, status: data.status, phoneNumber: data.phoneNumber } : null
      );

      if (data.status === "qr_code" || data.qr) {
        setQrDialogOpen(true);
        setQrCode(data.qr || null);
      } else if (data.status === "connected") {
        toast.success("Already connected!");
        fetchInstances();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/instances/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setInstances((prev) => prev.filter((i) => i.id !== id));
      toast.success("Instance deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
    setDeleteId(null);
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      connected: "default",
      qr_code: "secondary",
      disconnected: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Connections</h1>
          <p className="text-muted-foreground mt-1">
            Manage your WhatsApp instances and scan QR codes to connect.
          </p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Instance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Instance</DialogTitle>
              <DialogDescription>
                Give your WhatsApp instance a name to identify it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="e.g., My WhatsApp"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading instances...</p>
      ) : instances.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No instances yet</CardTitle>
            <CardDescription>
              Create your first WhatsApp instance to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instances.map((instance) => (
            <Card key={instance.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{instance.name}</CardTitle>
                  {statusBadge(instance.status)}
                </div>
                <CardDescription>
                  {instance.phoneNumber || "Not connected"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnect(instance)}
                  disabled={isConnecting === instance.id}
                >
                  {isConnecting === instance.id ? (
                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Smartphone className="mr-1 h-3 w-3" />
                  )}
                  {instance.status === "connected" ? "Reconnect" : "Connect"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteId(instance.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Open WhatsApp on your phone → Linked Devices → Link a Device
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCode ? (
              <QRCodeDisplay qr={qrCode} />
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Waiting for QR code...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instance</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect the WhatsApp session and remove all data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function QRCodeDisplay({ qr }: { qr: string }) {
  // For Baileys, QR is a string that can be rendered as a QR code
  // We'll use a simple display - in production you'd use a QR code renderer
  return (
    <div className="text-center space-y-2">
      <div className="border rounded-lg p-4 bg-white inline-block">
        <pre className="text-xs leading-tight whitespace-pre-wrap font-mono max-h-48 overflow-auto">
          {qr.substring(0, 500)}...
        </pre>
      </div>
      <p className="text-xs text-muted-foreground">
        QR Code data shown above. Use a QR scanner app to connect.
      </p>
    </div>
  );
}
