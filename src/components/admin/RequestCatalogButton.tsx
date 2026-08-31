"use client";

import { useState } from "react";
import { useCreateCatalogRequestMutation } from "@/lib/redux/features/catalogRequests/catalogRequestApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  type: "brand" | "category";
}

// Vendor-facing button: opens a dialog to request a new brand/category.
// Submitting emails the platform admin (does not create anything directly).
export default function RequestCatalogButton({ type }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentName, setParentName] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  const [createRequest, { isLoading }] = useCreateCatalogRequestMutation();

  const label = type === "brand" ? "Brand" : "Category";

  const reset = () => {
    setName("");
    setParentName("");
    setNote("");
    setMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!name.trim()) {
      setMsg({ type: "err", text: `${label} name is required.` });
      return;
    }
    try {
      await createRequest({
        type,
        name: name.trim(),
        note: note.trim() || undefined,
        parentName:
          type === "category" && parentName.trim()
            ? parentName.trim()
            : undefined,
      }).unwrap();
      setMsg({
        type: "ok",
        text: "Request sent to the platform admin. You'll be notified once it's added.",
      });
      setName("");
      setParentName("");
      setNote("");
    } catch (err: any) {
      setMsg({
        type: "err",
        text: err?.data?.message || "Failed to send request.",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Request {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a new {label.toLowerCase()}</DialogTitle>
          <DialogDescription>
            You can&apos;t create {label.toLowerCase()}s directly. Send a request
            and the platform admin will review and add it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="req-name">{label} name</Label>
            <Input
              id="req-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "brand" ? "e.g. Anker" : "e.g. Wireless Chargers"
              }
              className="mt-2"
            />
          </div>

          {type === "category" && (
            <div>
              <Label htmlFor="req-parent">Parent category (optional)</Label>
              <Input
                id="req-parent"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Accessories"
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label htmlFor="req-note">Note (optional)</Label>
            <Textarea
              id="req-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything the admin should know…"
              rows={3}
              className="mt-2"
            />
          </div>

          {msg && (
            <p
              className={
                "text-sm flex items-center gap-1 " +
                (msg.type === "ok" ? "text-green-600" : "text-primary")
              }
            >
              {msg.type === "ok" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {msg.text}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
