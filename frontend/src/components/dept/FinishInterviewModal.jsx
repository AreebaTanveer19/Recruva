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
  const [decision, setDecision] = useState("interviewed");

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

      // Call the finishInterview endpoint with feedback and decision
      const response = await api.post(
        "/interview/finish-interview",
        {
          interviewId,
          interviewFeedback: feedback,
          interviewStatus: decision,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Close the modal and reset
        setFeedback("");
        setDecision("interviewed");
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

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="sm"
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
          Duration: {formatTime(elapsed)} · {questions.length} questions
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3, mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Interview Decision */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Interview Decision
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Decision</InputLabel>
              <Select
                value={decision}
                label="Decision"
                onChange={(e) => setDecision(e.target.value)}
              >
                <MenuItem value="interviewed">Pending Decision</MenuItem>
                <MenuItem value="accepted">
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Accepted</span>
                </MenuItem>
                <MenuItem value="rejected">
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>✗ Rejected</span>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* Feedback Input */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Interview Feedback
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 1.5 }}>
              Add detailed feedback about the interview for the hiring manager
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Add your interview feedback here... (e.g., candidate's technical skills, communication, problem-solving approach, strengths, areas for improvement)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleFinishInterview}
            disabled={isSubmitting || !feedback.trim()}
            sx={{
              bgcolor: "#000",
              color: "#fff",
              "&:hover": { bgcolor: "#222" },
              "&:disabled": { bgcolor: "#ccc", color: "#999" },
              borderRadius: 1.5,
              py: 1.25,
              fontWeight: 600,
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
              borderRadius: 1.5,
              py: 1.25,
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}