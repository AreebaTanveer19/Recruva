import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { useState } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";

export function FinishInterviewModal({ open, onOpenChange, questions, elapsed, interviewId, onFinish }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState("waiting");
  const [attended, setAttended] = useState(null);

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

      const response = await api.post(
        "/interview/finish-interview",
        {
          interviewId,
          interviewFeedback: attended === false ? null : feedback,
          interviewStatus: attended === false ? "missed" : decision,
          ...(attended !== null && { attended }),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setFeedback("");
        setDecision("waiting");
        onOpenChange(false);
        if (onFinish) onFinish();
      }
    } catch (error) {
      console.error("Error finishing interview:", error);
      alert("Failed to finish interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid #f3f4f6",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 0, pt: 3, px: 3, borderBottom: "1px solid #f3f4f6" }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "#171717", letterSpacing: "-0.01em" }}
        >
          Interview Complete
        </Typography>
        <Typography
          variant="caption"
          sx={{ mt: 0.5, display: "block", color: "#9ca3af", pb: 2 }}
        >
          Duration: {formatTime(elapsed)} · {questions.length} questions
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3, mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Attendance */}
          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 1.5 }}
            >
              Did the candidate attend?{" "}
              <Typography component="span" variant="caption" sx={{ fontWeight: 400, color: "#9ca3af", textTransform: "none" }}>
                (optional)
              </Typography>
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant={attended === true ? "contained" : "outlined"}
                size="small"
                onClick={() => setAttended(attended === true ? null : true)}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "0.8125rem",
                  ...(attended === true
                    ? { bgcolor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", "&:hover": { bgcolor: "#dcfce7" } }
                    : { borderColor: "#e5e7eb", color: "#6b7280", "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" } }),
                }}
              >
                Yes
              </Button>
              <Button
                variant={attended === false ? "contained" : "outlined"}
                size="small"
                onClick={() => setAttended(attended === false ? null : false)}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "0.8125rem",
                  ...(attended === false
                    ? { bgcolor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", "&:hover": { bgcolor: "#fee2e2" } }
                    : { borderColor: "#e5e7eb", color: "#6b7280", "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" } }),
                }}
              >
                No
              </Button>
            </Box>
            {attended === false && (
              <Typography
                variant="caption"
                sx={{ mt: 1.5, display: "block", color: "#92400e", bgcolor: "#fffbeb", px: 1.5, py: 0.75, borderRadius: "6px", border: "1px solid #fde68a" }}
              >
                Status will be set to <strong>Candidate Missed</strong>
              </Typography>
            )}
          </Box>

          <Divider sx={{ borderColor: "#f3f4f6" }} />

          {/* Decision */}
          {attended !== false && (
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 1.5 }}
              >
                Interview Decision
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "0.875rem" }}>Decision</InputLabel>
                <Select
                  value={decision}
                  label="Decision"
                  onChange={(e) => setDecision(e.target.value)}
                  sx={{ borderRadius: "8px", bgcolor: "#f9fafb", fontSize: "0.875rem" }}
                >
                  <MenuItem value="waiting">
                    <span style={{ color: "#d97706", fontWeight: 500 }}>Waiting</span>
                  </MenuItem>
                  <MenuItem value="accepted">
                    <span style={{ color: "#15803d", fontWeight: 500 }}>Accepted</span>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <span style={{ color: "#dc2626", fontWeight: 500 }}>Rejected</span>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {attended !== false && (
            <>
              <Divider sx={{ borderColor: "#f3f4f6" }} />

              {/* Feedback */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 0.5 }}
                >
                  Interview Feedback
                </Typography>
                <Typography variant="caption" sx={{ color: "#9ca3af", display: "block", mb: 1.5 }}>
                  Add detailed feedback about the interview for the hiring manager
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="e.g., candidate's technical skills, communication, problem-solving approach, strengths, areas for improvement"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#f9fafb",
                      fontSize: "0.875rem",
                    },
                  }}
                />
              </Box>
            </>
          )}

          {/* Submit */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleFinishInterview}
            disabled={isSubmitting || (attended !== false && !feedback.trim())}
            sx={{
              bgcolor: "#111827",
              color: "#fff",
              "&:hover": { bgcolor: "#1f2937", boxShadow: "none" },
              "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
              borderRadius: "8px",
              py: 1.25,
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.875rem",
              boxShadow: "none",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            sx={{
              borderRadius: "8px",
              py: 1.25,
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.875rem",
              borderColor: "#e5e7eb",
              color: "#6b7280",
              "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
            }}
          >
            Cancel
          </Button>

        </Box>
      </DialogContent>
    </Dialog>
  );
}
