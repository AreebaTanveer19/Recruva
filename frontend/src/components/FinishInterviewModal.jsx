import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export function FinishInterviewModal({ open, onOpenChange, questions, askedIds, notes, elapsed }) {
  const asked = questions.filter((q) => askedIds.has(q.id));
  const remaining = questions.filter((q) => !askedIds.has(q.id));

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { maxHeight: "80vh" },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 20, color: "success.main" }} />
          <Typography variant="h6" fontWeight={600}>
            Interview Summary
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
          Duration: {formatTime(elapsed)} · {asked.length} of {questions.length} questions asked
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Stats */}
          <Grid container spacing={1.5}>
            {[
              { label: "Asked", value: asked.length, mono: false },
              { label: "Remaining", value: remaining.length, mono: false },
              { label: "Duration", value: formatTime(elapsed), mono: true },
            ].map(({ label, value, mono }) => (
              <Grid item xs={4} key={label}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    textAlign: "center",
                    bgcolor: "action.hover",
                    border: "none",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    fontFamily={mono ? "monospace" : "inherit"}
                  >
                    {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    {label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Questions & Notes */}
          {asked.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.primary"
                sx={{ textTransform: "uppercase", letterSpacing: 1 }}
              >
                Questions & Notes
              </Typography>

              {asked.map((q) => (
                <Paper
                  key={q.id}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2, display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Typography variant="caption" fontWeight={600} color="text.primary">
                    Q{q.number}: {q.text}
                  </Typography>
                  {notes[q.id] ? (
                    <Typography variant="caption" color="text.secondary" fontStyle="italic">
                      Note: {notes[q.id]}
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: "text.disabled" }}>
                      No notes recorded
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={() => onOpenChange(false)}
          >
            Close Summary
          </Button>

        </Box>
      </DialogContent>
    </Dialog>
  );
}