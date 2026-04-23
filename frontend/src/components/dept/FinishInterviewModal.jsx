import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import { useState } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";

export function FinishInterviewModal({ open, onOpenChange, questions, elapsed, interviewId, onFinish }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleFinishInterview = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem(ACCESS_TOKEN);

      // Call the new finishInterview endpoint
      const response = await api.post(
        "/interview/finish-interview",
        { interviewId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Close the modal
        onOpenChange(false);
        if (onFinish) {
          onFinish();
        }
      }
    } catch (error) {
      console.error("Error finishing interview:", error);
      alert("Failed to finish interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const easy   = questions.filter((q) => q.difficulty === "easy").length;
  const medium = questions.filter((q) => q.difficulty === "medium").length;
  const hard   = questions.filter((q) => q.difficulty === "hard").length;

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        },
      }}
    >
      <DialogTitle sx={{ pb: 0, pt: 3, px: 3 }}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Interview Complete
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
          {formatTime(elapsed)} · {questions.length} questions
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3, mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Duration stat */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "#000",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase", fontSize: 10 }}>
              Duration
            </Typography>
            <Typography variant="h6" fontWeight={700} fontFamily="monospace" sx={{ color: "#fff" }}>
              {formatTime(elapsed)}
            </Typography>
          </Paper>

          {/* Difficulty breakdown */}
          <Grid container spacing={1}>
            {[
              { label: "Easy",   value: easy,   color: "#22c55e" },
              { label: "Medium", value: medium, color: "#f59e0b" },
              { label: "Hard",   value: hard,   color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <Grid item xs={4} key={label}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    textAlign: "center",
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color, mx: "auto", mb: 0.75 }} />
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    {value}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 10, color: "text.disabled" }}>
                    {label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            fullWidth
            onClick={handleFinishInterview}
            disabled={isSubmitting}
            sx={{
              bgcolor: "#000",
              color: "#fff",
              "&:hover": { bgcolor: "#222" },
              borderRadius: 1.5,
              py: 1.25,
              fontWeight: 600,
            }}
          >
            {isSubmitting ? "Finishing..." : "Finish Interview"}
          </Button>

        </Box>
      </DialogContent>
    </Dialog>
  );
}