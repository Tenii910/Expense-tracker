"use client";

import { useState } from "react";
import { Plus, Trash2, Palette } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoryStore } from "@/lib/category-store";
import { DEFAULT_CATEGORIES } from "@/lib/types";
import { showBackendError } from "@/lib/backend-errors";

const CUSTOM_COLORS = [
  "#FF6B35",
  "#00B4D8",
  "#FF006E",
  "#8338EC",
  "#3A86FF",
  "#06D6A0",
  "#FFBE0B",
  "#FB5607",
  "#E5989B",
  "#98C1D9",
  "#6B9080",
  "#A98467",
];

export function CategoryManager() {
  const { customs, addCustom, removeCustom, recolorCustom } = useCategoryStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(CUSTOM_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (DEFAULT_CATEGORIES.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError("A default category with this name already exists");
      return;
    }
    try {
      const result = await addCustom(trimmed, color);
      if (result === null) {
        setError("A custom category with this name already exists");
        return;
      }
      setName("");
      setColor(CUSTOM_COLORS[0]);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save this category.");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-2"
      >
        <Palette size={14} />
        Manage categories
      </button>

      {open && (
        <Modal open={true} onClose={() => setOpen(false)} title="Custom Categories">
          <div className="flex flex-col gap-4">
            {customs.length === 0 ? (
              <p className="text-sm text-text-tertiary">
                No custom categories yet. Add your own categories and assign colors.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customs.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
                  >
                    <div className="relative">
                      <div
                        className="h-5 w-5 rounded-full cursor-pointer"
                        style={{ backgroundColor: cat.color }}
                      />
                      <input
                        type="color"
                        value={cat.color}
                        onChange={(e) => void recolorCustom(cat.id, e.target.value).catch(showBackendError)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <span className="flex-1 text-sm text-text-primary">{cat.name}</span>
                    <button
                      onClick={() => void removeCustom(cat.id).catch(showBackendError)}
                      className="rounded-lg p-1 text-text-tertiary hover:text-danger transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium text-text-tertiary mb-2">Add new category</p>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Category name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    error={error ?? undefined}
                  />
                </div>
                <div className="flex gap-1">
                  {CUSTOM_COLORS.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                        color === c ? "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <label className="relative h-7 w-7 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-surface-hover transition-colors">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-xs text-text-tertiary">+</span>
                  </label>
                </div>
                <Button size="sm" onClick={handleAdd} disabled={!name.trim()}>
                  <Plus size={14} />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
