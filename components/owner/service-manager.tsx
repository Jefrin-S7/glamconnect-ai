"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { updateSalonServices } from "@/actions/salons";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";

interface ServiceManagerProps {
  salonId: string;
  ownerId: string;
  initialServices: SalonService[];
}

type EditingRow = SalonService & { isNew?: boolean };

const EMPTY_SERVICE: () => SalonService = () => ({
  id: `svc-${Date.now()}`,
  name: "",
  category: "hair",
  price: 0,
  durationMinutes: 30,
});

export function ServiceManager({ salonId, ownerId, initialServices }: ServiceManagerProps) {
  const [services, setServices] = useState<SalonService[]>(initialServices);
  const [editing, setEditing] = useState<EditingRow | null>(null);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, startSave] = useTransition();

  function startEdit(svc: SalonService) {
    setEditing({ ...svc });
    setSaveError("");
    setSaveSuccess(false);
  }

  function startAdd() {
    setEditing({ ...EMPTY_SERVICE(), isNew: true });
    setSaveError("");
    setSaveSuccess(false);
  }

  function cancelEdit() {
    setEditing(null);
  }

  function handleFieldChange<K extends keyof SalonService>(key: K, value: SalonService[K]) {
    if (!editing) return;
    setEditing((prev) => prev && { ...prev, [key]: value });
  }

  function commitEdit() {
    if (!editing) return;
    if (!editing.name.trim()) { setSaveError("Service name is required."); return; }
    if (editing.price < 1) { setSaveError("Price must be at least ₹1."); return; }
    if (editing.durationMinutes < 5) { setSaveError("Duration must be at least 5 minutes."); return; }

    const updated = editing.isNew
      ? [...services, { ...editing, isNew: undefined } as SalonService]
      : services.map((s) => (s.id === editing.id ? ({ ...editing, isNew: undefined } as SalonService) : s));

    setSaveError("");
    startSave(async () => {
      try {
        await updateSalonServices(salonId, ownerId, updated);
        setServices(updated);
        setEditing(null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Save failed — please try again.");
      }
    });
  }

  function deleteService(id: string) {
    const updated = services.filter((s) => s.id !== id);
    startSave(async () => {
      try {
        await updateSalonServices(salonId, ownerId, updated);
        setServices(updated);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Delete failed — please try again.");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-paper">Services</h2>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-violet-light flex items-center gap-1">
              <Check size={13} /> Saved
            </span>
          )}
          <Button size="sm" onClick={startAdd} disabled={!!editing || saving}>
            <Plus size={15} /> Add service
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {services.map((svc) =>
          editing?.id === svc.id ? (
            <ServiceForm
              key={svc.id}
              value={editing}
              saving={saving}
              error={saveError}
              onChange={handleFieldChange}
              onSave={commitEdit}
              onCancel={cancelEdit}
            />
          ) : (
            <div key={svc.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-paper font-medium text-sm">{svc.name}</p>
                <p className="text-paper/50 text-xs mt-0.5">
                  {svc.durationMinutes} min · {svc.category} · ₹{svc.price.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(svc)}
                  disabled={!!editing || saving}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 focus-ring disabled:opacity-40"
                  aria-label={`Edit ${svc.name}`}
                >
                  <Pencil size={14} className="text-paper/70" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteService(svc.id)}
                  disabled={!!editing || saving}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-destructive/20 focus-ring disabled:opacity-40"
                  aria-label={`Delete ${svc.name}`}
                >
                  {saving ? <Loader2 size={14} className="animate-spin text-paper/50" /> : <Trash2 size={14} className="text-paper/70" />}
                </button>
              </div>
            </div>
          )
        )}

        {editing?.isNew && (
          <ServiceForm
            value={editing}
            saving={saving}
            error={saveError}
            onChange={handleFieldChange}
            onSave={commitEdit}
            onCancel={cancelEdit}
          />
        )}

        {services.length === 0 && !editing && (
          <p className="text-paper/40 text-sm text-center py-8">
            No services yet — add your first one above.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Inline form ────────────────────────────────────────────────────

interface ServiceFormProps {
  value: EditingRow;
  saving: boolean;
  error: string;
  onChange: <K extends keyof SalonService>(key: K, value: SalonService[K]) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ServiceForm({ value, saving, error, onChange, onSave, onCancel }: ServiceFormProps) {
  const inputClass =
    "bg-white/5 border border-line rounded-lg px-3 py-2 text-sm text-paper outline-none focus-ring w-full placeholder:text-paper/40";

  return (
    <div className="glass rounded-xl p-4 border border-violet/30">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-paper/50 mb-1 block">Service name *</label>
          <input
            value={value.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g. Curtain Bangs for Curly Hair"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-paper/50 mb-1 block">Category</label>
          <select
            value={value.category}
            onChange={(e) => onChange("category", e.target.value as SalonService["category"])}
            className={cn(inputClass, "bg-ink")}
          >
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-ink">{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-paper/50 mb-1 block">Price (₹) *</label>
          <input
            type="number"
            min={1}
            value={value.price || ""}
            onChange={(e) => onChange("price", Number(e.target.value))}
            placeholder="900"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-paper/50 mb-1 block">Duration (minutes) *</label>
          <input
            type="number"
            min={5}
            step={5}
            value={value.durationMinutes || ""}
            onChange={(e) => onChange("durationMinutes", Number(e.target.value))}
            placeholder="45"
            className={inputClass}
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
          <X size={14} /> Cancel
        </Button>
      </div>
    </div>
  );
}
