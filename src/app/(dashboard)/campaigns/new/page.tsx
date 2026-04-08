"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

interface Instance {
  id: string;
  name: string;
  status: string;
}

interface Contact {
  phone: string;
  name: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data
          .filter((row: any) => row.phone || row.Phone || row.phone_number)
          .map((row: any) => ({
            phone: (row.phone || row.Phone || row.phone_number || "").trim(),
            name: (row.name || row.Name || row.firstName || "").trim(),
          }))
          .filter((c) => c.phone);

        setContacts((prev) => [...prev, ...parsed]);
        toast.success(`Imported ${parsed.length} contacts`);
      },
      error: () => {
        toast.error("Failed to parse CSV");
      },
    });
  };

  const addContact = () => {
    if (!newPhone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    setContacts((prev) => [...prev, { phone: newPhone.trim(), name: newName.trim() }]);
    setNewPhone("");
    setNewName("");
  };

  const removeContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    if (!selectedInstance) {
      toast.error("Please select an instance");
      return;
    }
    if (!messageTemplate.trim()) {
      toast.error("Message template is required");
      return;
    }
    if (contacts.length === 0) {
      toast.error("At least one contact is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create campaign
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          instanceId: selectedInstance,
          messageTemplate,
          contactSource: "csv",
          contacts,
          delayMs: 1500,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create campaign");
      }

      const data = await res.json();
      toast.success("Campaign created!");
      router.push(`/campaigns`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  const connectedInstances = instances.filter((i) => i.status === "connected");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Campaign</h1>
          <p className="text-muted-foreground mt-1">
            Create a new WhatsApp blast campaign.
          </p>
        </div>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Set the name, instance, and message template.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              placeholder="e.g., April Promo Blast"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instance">WhatsApp Instance</Label>
            <Select value={selectedInstance} onValueChange={setSelectedInstance}>
              <SelectTrigger id="instance">
                <SelectValue placeholder="Select an instance" />
              </SelectTrigger>
              <SelectContent>
                {instances.map((inst) => (
                  <SelectItem
                    key={inst.id}
                    value={inst.id}
                    disabled={inst.status !== "connected"}
                  >
                    {inst.name} ({inst.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {connectedInstances.length === 0 && (
              <p className="text-sm text-destructive">
                No connected instances. Please connect one first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Template</Label>
            <Textarea
              id="message"
              placeholder={"Hi {{name}},\n\nCheck out our latest offer!\nReply STOP to opt out."}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Use variables like {"{{name}}"}, {"{{phone}}"} for personalization.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts ({contacts.length})</CardTitle>
          <CardDescription>Upload CSV or add contacts manually.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CSV Upload */}
          <div className="flex items-center gap-4">
            <Label htmlFor="csv-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 rounded-md border border-dashed px-4 py-3 hover:bg-muted transition-colors">
                <Upload className="h-4 w-4" />
                <span>Upload CSV</span>
              </div>
            </Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
            />
            <p className="text-xs text-muted-foreground">
              CSV should have columns: phone, name (optional)
            </p>
          </div>

          <Separator />

          {/* Manual Add */}
          <div className="flex gap-2">
            <Input
              placeholder="Phone (e.g., 6281234567890)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="max-w-xs"
            />
            <Input
              placeholder="Name (optional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="outline" size="icon" onClick={addContact}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Contact List */}
          {contacts.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <span className="font-mono text-sm">{contact.phone}</span>
                    {contact.name && (
                      <Badge variant="secondary" className="ml-2">
                        {contact.name}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting || contacts.length === 0}
        >
          {isSubmitting ? "Creating..." : `Create Campaign (${contacts.length} contacts)`}
        </Button>
      </div>
    </div>
  );
}
