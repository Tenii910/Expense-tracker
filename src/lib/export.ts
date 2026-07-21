import type { Expense } from "./types";

function toCSV(expenses: Expense[]): string {
  const headers = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map(
    (e) =>
      `${e.date},${e.category},"${e.description.replace(/"/g, '""')}",${e.amount}`,
  );
  return [headers.join(","), ...rows].join("\n");
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(expenses: Expense[]) {
  download(toCSV(expenses), `expenses-${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
}

export function exportJSON(expenses: Expense[]) {
  const json = JSON.stringify(expenses, null, 2);
  download(json, `expenses-${new Date().toISOString().split("T")[0]}.json`, "application/json");
}
