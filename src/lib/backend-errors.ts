import { useToastStore } from "./toast-store";

export function showBackendError(error: unknown) {
  const message = error instanceof Error ? error.message : "The server request failed.";
  useToastStore.getState().addToast({
    message: `Could not save changes: ${message}`,
    type: "error",
  });
}
