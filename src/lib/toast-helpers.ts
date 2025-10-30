import { toast } from "sonner";

/**
 * Show a success toast notification
 * @param message - The success message to display
 * @param duration - Duration in milliseconds (default: 3000)
 */
export const showSuccess = (message: string, duration: number = 3000) => {
  toast.success(message, {
    duration,
  });
};

/**
 * Show an error toast notification
 * @param message - The error message to display
 * @param duration - Duration in milliseconds (default: 5000)
 */
export const showError = (message: string, duration: number = 5000) => {
  toast.error(message, {
    duration,
  });
};
