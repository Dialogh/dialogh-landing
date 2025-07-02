// Global type declarations for Toast functionality
declare global {
  interface Window {
    toastManager: {
      show: (options: ToastOptions) => void;
      hide: (toastId: string) => void;
    };
    showToast: (options: ToastOptions) => void;
  }
}

interface ToastOptions {
  type?: "success" | "error" | "info";
  title?: string;
  message: string;
  duration?: number;
  showClose?: boolean;
}

export {};
