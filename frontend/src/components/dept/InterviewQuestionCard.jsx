import { useState } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Collapse } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";

const difficultyColor = {
  easy:   "#22c55e",
  medium: "#f59e0b",
  hard:   "#ef4444",
};

export function InterviewQuestionCard({ question, innerRef }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <motion.div
      ref={innerRef}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1.25,
          px: 1.25,
          py: 1.25,
          borderRadius: 1.5,
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Question number + difficulty dot + text */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
            <Typography
              component="span"
              sx={{ fontSize: 16, fontFamily: "monospace", color: "text.disabled", flexShrink: 0, userSelect: "none" }}
            >
              {question.number}
            </Typography>

            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: difficultyColor[question.difficulty] || "text.disabled",
                flexShrink: 0,
                mb: "-1px",
              }}
            />

            <Typography
              variant="body2"
              sx={{ fontSize: 16, lineHeight: 1.6, color: "text.primary" }}
            >
              {question.text}
            </Typography>
          </Box>

          {/* Show answer toggle */}
          <Box
            component="button"
            onClick={() => setShowAnswer(!showAnswer)}
            sx={{
              mt: 0.75,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              background: "none",
              border: "none",
              cursor: "pointer",
              p: 0,
              color: "text.disabled",
              fontSize: 14,
              fontFamily: "inherit",
              transition: "color 0.15s",
              "&:hover": { color: "text.secondary" },
            }}
          >
            <Box
              sx={{
                transition: "transform 0.2s",
                transform: showAnswer ? "rotate(180deg)" : "rotate(0deg)",
                display: "flex",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            {showAnswer ? "Hide answer" : "Show answer"}
          </Box>

          {/* Answer */}
          <Collapse in={showAnswer} unmountOnExit>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 1,
                px: 1.25,
                py: 1,
                bgcolor: "action.hover",
                borderRadius: 1,
                fontSize: 14,
                lineHeight: 1.65,
                color: "text.secondary",
                borderLeft: "2px solid",
                borderColor: "divider",
              }}
            >
              {question.answer}
            </Typography>
          </Collapse>
      <Box sx={{ height: "1px", bgcolor: "divider", mb: 1.5 }} />
        </Box>
      </Box>
    </motion.div>
  );
}