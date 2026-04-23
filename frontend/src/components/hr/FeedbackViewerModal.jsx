import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";

export function FeedbackViewerModal({ open, onClose, interviewId, candidateName, position }) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && interviewId) {
      fetchFeedback();
    }
  }, [open, interviewId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem(ACCESS_TOKEN);

      const response = await api.get(`/interview/feedback/${interviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setFeedback(response.data.data.interviewFeedback || "No feedback provided");
      } else {
        setError("Failed to fetch feedback");
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Error loading feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Interview Feedback
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
          {candidateName} • {position}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Box sx={{ bgcolor: "#fee2e2", p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              bgcolor: "#f9fafb",
              p: 2,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              minHeight: 200,
            }}
          >
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                wordBreak: "break-word",
              }}
            >
              {feedback}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Box sx={{ px: 3, pb: 3, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{
            bgcolor: "#000",
            color: "#fff",
            "&:hover": { bgcolor: "#222" },
            borderRadius: 1.5,
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
}
