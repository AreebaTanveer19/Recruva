import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "error",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmSx =
    confirmColor === "error"
      ? { bgcolor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", "&:hover": { bgcolor: "#fee2e2" } }
      : { bgcolor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", "&:hover": { bgcolor: "#dbeafe" } };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: { borderRadius: "16px", border: "1px solid #f3f4f6", boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)" },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: "#171717", letterSpacing: "-0.01em", pb: 0.5 }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: "#737373", lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "#e5e7eb",
            color: "#6b7280",
            fontWeight: 500,
            fontSize: "0.875rem",
            "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 500,
            fontSize: "0.875rem",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
            ...confirmSx,
          }}
        >
          {loading ? "Please wait..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
