import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Checkbox,
  TextField,
  Button,
  Chip,
  Paper,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export function InterviewQuestionCard({
  question,
  asked,
  note,
  onToggleAsked,
  onNoteChange,
  innerRef,
}) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <motion.div
      ref={innerRef}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          opacity: asked ? 0.6 : 1,
          transition: "opacity 0.2s",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {/* Checkbox */}
          <Checkbox
            checked={asked}
            onChange={onToggleAsked}
            size="small"
            sx={{ mt: 0.25, p: 0, flexShrink: 0 }}
          />

          {/* Content */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>

            {/* Question text */}
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.6,
                textDecoration: asked ? "line-through" : "none",
                color: asked ? "text.secondary" : "text.primary",
              }}
            >
              <Box
                component="span"
                sx={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "text.secondary",
                  mr: 1,
                }}
              >
                Q{question.number}
              </Box>
              {question.text}
            </Typography>

            {/* Tags */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {question.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 500,
                    bgcolor: "action.selected",
                    color: "text.primary",
                    borderRadius: 99,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              ))}
            </Box>

            {/* Notes input */}
            <TextField
              placeholder="Add interviewer notes..."
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              size="small"
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true }}
              sx={{
                "& .MuiFilledInput-root": {
                  bgcolor: "action.hover",
                  borderRadius: 1.5,
                  fontSize: 12,
                  py: 0,
                  "&:hover": { bgcolor: "action.selected" },
                  "&.Mui-focused": { bgcolor: "action.selected" },
                },
                "& .MuiFilledInput-input": {
                  py: 1,
                  px: 1.5,
                  fontSize: 12,
                },
              }}
            />

            {/* Show/Hide Answer toggle */}
            <Button
              size="small"
              onClick={() => setShowAnswer(!showAnswer)}
              startIcon={
                showAnswer ? (
                  <ExpandLessIcon sx={{ fontSize: "14px !important" }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: "14px !important" }} />
                )
              }
              sx={{
                alignSelf: "flex-start",
                fontSize: 11,
                color: "text.secondary",
                px: 0,
                minWidth: 0,
                "&:hover": { color: "text.primary", bgcolor: "transparent" },
              }}
            >
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </Button>

            {/* Answer panel */}
            <Collapse in={showAnswer} unmountOnExit>
              <Box
                sx={{
                  bgcolor: "action.hover",
                  borderRadius: 1.5,
                  p: 1.5,
                  fontSize: 12,
                  color: "text.secondary",
                  lineHeight: 1.6,
                }}
              >
                <Typography variant="caption" sx={{ lineHeight: 1.6, color: "text.secondary" }}>
                  {question.answer}
                </Typography>
              </Box>
            </Collapse>

          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
}