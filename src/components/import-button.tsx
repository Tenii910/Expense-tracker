"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { showBackendError } from "@/lib/backend-errors";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { Expense } from "@/lib/types";

function parseCSV(text: string): Partial<Expense>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const results: Partial<Expense>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });

    const amount = parseFloat(row["amount"] || row["total"] || "0");
    if (isNaN(amount) || amount <= 0) continue;

    results.push({
      amount,
      category: row["category"],
      description: row["description"] || row["desc"] || "",
      date: row["date"] || new Date().toISOString().split("T")[0],
    });
  }
  return results;
}

function parseJSON(text: string): Partial<Expense>[] {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

export function ImportButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addExpenses = useExpenseStore((s) => s.addExpenses);
  const addToast = useToastStore((s) => s.addToast);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<Partial<Expense>[] | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed =
        file.name.endsWith(".json") ? parseJSON(text) : parseCSV(text);
      setPreview(parsed);
      setShowModal(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleImport() {
    if (!preview) return;
    const valid = preview.filter((item) => item.amount && item.category && item.date).map((item) => ({
      amount: item.amount!,
      category: item.category!,
      description: item.description || "",
      date: item.date!,
    }));
    try {
      const imported = await addExpenses(valid);
      setShowModal(false);
      setPreview(null);
      addToast({
        message: `Imported ${imported.length} expense${imported.length !== 1 ? "s" : ""}`,
        type: "success",
      });
    } catch (error) {
      showBackendError(error);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <Upload size={14} className="inline mr-2" />
        Import CSV/JSON
      </button>

      {showModal && (
        <Modal
          open={true}
          onClose={() => {
            setShowModal(false);
            setPreview(null);
          }}
          title="Import Expenses"
        >
          {preview && preview.length > 0 ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-tertiary">
                Found {preview.length} valid expense{preview.length !== 1 ? "s" : ""}.
              </p>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border text-sm">
                {preview.slice(0, 20).map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2">
                    <span className="text-text-primary truncate">
                      {item.description || item.category}
                    </span>
                    <span className="text-text-secondary shrink-0 ml-2">
                      ₦{item.amount?.toFixed(2)}
                    </span>
                  </div>
                ))}
                {preview.length > 20 && (
                  <div className="px-3 py-2 text-xs text-text-tertiary text-center">
                    ...and {preview.length - 20} more
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleImport} className="flex-1">
                  Import {preview.length} expense{preview.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-danger">
                No valid expenses found in the file.
              </p>
              <p className="text-xs text-text-tertiary">
                CSV format: Date,Category,Description,Amount (one per line).
              </p>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
