import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RemoveIcon from "@mui/icons-material/Remove";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export function FloatingMeetingWindow({ candidateName, jobTitle, meetLink }) {
  const [minimized, setMinimized] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const openMeet = () => {
    window.open(
      meetLink,
      "_blank",
      "width=1200,height=800,toolbar=no,menubar=no",
    );
  };

  // const copyLink = () => {
  //   navigator.clipboard.writeText(meetLink);
  //   setToastOpen(true);
  // };

  /* ── Pulsing green dot ── */
  const PulseDot = ({ size = 10 }) => (
    <Box
      sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          bgcolor: "success.main",
          opacity: 0.75,
          animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
          "@keyframes ping": {
            "0%": { transform: "scale(1)", opacity: 0.75 },
            "75%, 100%": { transform: "scale(2)", opacity: 0 },
          },
        }}
      />
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          bgcolor: "success.main",
        }}
      />
    </Box>
  );

  /* ── Minimized pill ── */
  if (minimized) {
    return (
      <>
        <motion.div
          drag
          dragMomentum={false}
          style={{
            position: "fixed",
            top: 76,
            right: 24,
            zIndex: 1300,
            cursor: "grab",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Paper
            elevation={4}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderRadius: 99,
              px: 2,
              py: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <PulseDot size={8} />
            <Typography variant="caption" fontWeight={600} color="text.primary">
              {candidateName}
            </Typography>
            <Typography
              variant="caption"
              fontFamily="monospace"
              color="text.secondary"
            >
              {formatTime(elapsed)}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setMinimized(false)}
              sx={{ p: 0.25 }}
            >
              <OpenInFullIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Paper>
        </motion.div>

        <Snackbar
          open={toastOpen}
          autoHideDuration={3000}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity="success"
            onClose={() => setToastOpen(false)}
            sx={{ width: "100%" }}
          >
            Google Meet link copied to clipboard.
          </Alert>
        </Snackbar>
      </>
    );
  }

  /* ── Expanded card ── */
  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        style={{
          position: "fixed",
          top: 76,
          right: 24,
          zIndex: 1300,
          width: 350,
          cursor: "grab",
        }}
        initial={{ scale: 0.9, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: 1,
              borderColor: "divider",
              px: 2,
              py: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PulseDot size={10} />
              <Typography
                variant="caption"
                fontWeight={600}
                color="success.main"
              >
                Live Interview
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setMinimized(true)}
              sx={{ p: 0.25 }}
            >
              <RemoveIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          {/* Body */}
          <Box
            sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            {/* Candidate info */}
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {candidateName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {jobTitle}
              </Typography>
            </Box>

            {/* Timer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "action.hover",
                borderRadius: 2,
                px: 1.5,
                py: 1,
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography
                variant="body2"
                fontFamily="monospace"
                fontWeight={600}
              >
                {formatTime(elapsed)}
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                size="small"
                startIcon={<VideocamIcon />}
                onClick={openMeet}
                sx={{
                  bgcolor: "#000",
                  "&:hover": { bgcolor: "#222" },
                  py: 1,
                  px: 2,
                }}
              >
                Open Google Meet
              </Button>
              {/* <Button
                variant="outlined"
                fullWidth
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={copyLink}
                sx={{
                  borderColor: "#000",
                  color: "#000",
                  "&:hover": {
                    borderColor: "#222",
                    color: "#222",
                    bgcolor: "transparent",
                  },
                  py: 1,
                  px: 2,
                }}
              >
                Copy Link
              </Button> */}
            </Box>
          </Box>
        </Paper>
      </motion.div>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          onClose={() => setToastOpen(false)}
          sx={{ width: "100%" }}
        >
          Google Meet link copied to clipboard.
        </Alert>
      </Snackbar>
    </>
  );
}
