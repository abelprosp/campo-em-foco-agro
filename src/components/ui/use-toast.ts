
import { useToast } from "@/hooks/use-toast";

export { useToast };

// Re-export toast function for backward compatibility
export const toast = (options: any) => {
  const { toast: toastFn } = useToast();
  return toastFn(options);
};
