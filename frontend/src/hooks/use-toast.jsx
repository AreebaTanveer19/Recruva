import { useState } from "react";
import { Snackbar, Alert } from "@mui/material";

export function useToast() {
  const [open, setOpen] = useState(false);
  const [toastOptions, setToastOptions] = useState({
    message: "",
    severity: "info",
  });

  const toast = ({ title, description, severity = "info" }) => {
    setToastOptions({ message: `${title}: ${description}`, severity });
    setOpen(true);
  };

  const ToastComponent = (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity={toastOptions.severity}
        sx={{ width: "100%" }}
      >
        {toastOptions.message}
      </Alert>
    </Snackbar>
  );

  return { toast, ToastComponent };
}
