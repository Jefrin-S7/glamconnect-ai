"use client";

import { useId, useState, useTransition } from "react";
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

const EMPTY_SERVICE = (): SalonService => ({
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
  const statusId = useId();

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

  function handleFieldChange<K extends keyof SalonService>(key: K, value: SalonService[K]) {
    setEditing((prev) => prev && { ...prev, [key]: value });
  }

  function commitEdit() {
    if (!editing) return;
    if (!editing.name.trim()) { setSaveError("Service name is required."); return; }
    if (editing.price < 1) { setSaveError("Price must be at least ₹1."); return; }
    if (editing.durationMinutes < 5) { setSaveError("Duration must be at least 5 minutes."); return; }

    const { isNew, ...clean } = editing;
    const updated = isNew
      ? [...services, clean as SalonService]
      : services.map((s) => (s.id === editing.id ? (clean as SalonService) : s));

    setSaveError("");
    startSave(async () => {
      try {
        await updateSalonServices(salonId, ownerId, updated);
        setServices(updated);
        setEditing(null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Save failed — please try again.");
      }
    });
  }

  function deleteService(svc: SalonService) {
    const updated = services.filter((s) => s.id !== svc.id);
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
    <section aria-labelledby="service-manager-heading">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 id="service-manager-heading" className="font-display text-xl font-semibold text-paper">
          Services
        </h2>
        <div className="flex items-center gap-3">
          {/* Polite live region — announces save/error without interrupting */}
          <div
            id={statusId}
            aria-live="polite"
            aria-atomic="true"
            className="text-xs min-w-[3rem]"
          >
            {saveSuccess && (
              <span className="text-violet-light flex items-center gap-1">
                <Check size={13} aria-hidden="true" /> Saved
              </span>
            )}
            {saveError && !editing && (
              <span className="text-destructive">{saveError}</span>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={startAdd}
            disabled={!!editing || saving}
            aria-label="Add new service"
          >
            <Plus size={15} aria-hidden="true" /> Add service
          </Button>
        </div>
      </div>

      <ul className="space-y-3" aria-label="Service list">
        {services.map((svc) =>
          editing?.id === svc.id ? (
            <li key={svc.id}>
              <ServiceForm
                value={editing}
                saving={saving}
                error={saveError}
                onChange={handleFieldChange}
                onSave={commitEdit}
                onCancel={() => setEditing(null)}
              />
            </li>
          ) : (
            <li
              key={svc.id}
              className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            >
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
                  aria-label={`Edit ${svc.name}`}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 focus-ring disabled:opacity-40"
                >
                  <Pencil size={14} className="text-paper/70" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteService(svc)}
                  disabled={!!editing || saving}
                  aria-label={`Delete ${svc.name}`}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-destructive/20 focus-ring disabled:opacity-40"
                >
                  {saving
                    ? <Loader2 size={14} className="animate-spin text-paper/50" aria-hidden="true" />
                    : <Trash2 size={14} className="text-paper/70" aria-hidden="true" />}
                </button>
              </div>
            </li>
          )
        )}

        {editing?.isNew && (
          <li>
            <ServiceForm
              value={editing}
              saving={saving}
              error={saveError}
              onChange={handleFieldChange}
              onSave={commitEdit}
              onCancel={() => setEditing(null)}
            />
          </li>
        )}
      </ul>

      {services.length === 0 && !editing && (
        <p className="text-paper/40 text-sm text-center py-8">
          No services yet — add your first one above.
        </p>
      )}
    </section>
  );
}

/* ── Inline form ── */
interface ServiceFormProps {
  value: EditingRow;
  saving: boolean;
  error: string;
  onChange: <K extends keyof SalonService>(key: K, value: SalonService[K]) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ServiceForm({ value, saving, error, onChange, onSave, onCancel }: ServiceFormProps) {
  const uid = useId();
  const inputClass =
    "bg-white/5 border border-line rounded-lg px-3 py-2 text-sm text-paper outline-none focus-ring w-full placeholder:text-paper/40";
  const errorId = `${uid}-error`;

  return (
    <div
      className="glass rounded-xl p-4 border border-violet/30"
      role="group"
      aria-label={value.isNew ? "Add new service" : `Edit ${value.name}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${uid}-name`} className="text-xs text-paper/50 mb-1 block">
            Service name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id={`${uid}-name`}
            value={value.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g. Curtain Bangs for Curly Hair"
            aria-required="true"
            aria-describedby={error ? errorId : undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-category`} className="text-xs text-paper/50 mb-1 block">
            Category
          </label>
          <select
            id={`${uid}-category`}
            value={value.category}
            onChange={(e) => onChange("category", e.target.value as SalonService["category"])}
            className={cn(inputClass, "bg-ink cursor-pointer")}
          >
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-price`} className="text-xs text-paper/50 mb-1 block">
            Price (₹) <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id={`${uid}-price`}
            type="number"
            min={1}
            value={value.price || ""}
            onChange={(e) => onChange("price", Number(e.target.value))}
            placeholder="900"
            aria-required="true"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-duration`} className="text-xs text-paper/50 mb-1 block">
            Duration (minutes) <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id={`${uid}-duration`}
            type="number"
            min={5}
            step={5}
            value={value.durationMinutes || ""}
            onChange={(e) => onChange("durationMinutes", Number(e.target.value))}
            placeholder="45"
            aria-required="true"
            className={inputClass}
          />
        </div>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive mt-2">
          {error}
        </p>
      )}
      <div className="flex gap-2 mt-4">
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving
            ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            : <Check size={14} aria-hidden="true" />}
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
          <X size={14} aria-hidden="true" /> Cancel
        </Button>
      </div>
    </div>
  );
}
