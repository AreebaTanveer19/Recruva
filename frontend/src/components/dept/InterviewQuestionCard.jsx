import { motion } from "framer-motion";
import { Box, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";

const difficultyColor = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
};

export function InterviewQuestionCard({
  question,
  innerRef,
  onDelete,
  onRegenerate,
    isRegenerating,
  isDeleting,
}) {
  return (
    <motion.div
      ref={innerRef}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* <Box
        sx={{
          display: "flex",
          gap: 1.25,
          px: 1.25,
          py: 1.25,
          borderRadius: 1.5,
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: "action.hover" },
        }}
      > */}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          px: 1.25,
          py: 1.25,
          borderRadius: 1.5,
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: "action.hover" },

         
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Question number + difficulty dot + text */}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
              <Typography
                component="span"
                sx={{
                  fontSize: 16,
                  fontFamily: "monospace",
                  color: "text.disabled",
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                {question.number}
              </Typography>

              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor:
                    difficultyColor[question.difficulty] || "text.disabled",
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

            {/* Answer */}
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
            <Box sx={{ height: "1px", bgcolor: "divider", mb: 1.5 }} />
          </Box>
        </Box>
       <Box
  sx={{
    display: "flex",
    gap: 0.25,
    alignItems: "center",
  }}
>
          <IconButton
            size="small"
            onClick={() => onRegenerate?.(question)}
            disabled={isRegenerating || isDeleting}
            sx={{
              color: isRegenerating ? "primary.main" : "text.disabled",
              transition: "all 0.15s",
              "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
              "&:hover": { color: "primary.main", bgcolor: "action.hover" },
            }}
          >
            <RefreshIcon
              sx={{
                fontSize: 18,
                animation: isRegenerating ? "spin 1s linear infinite" : "none",
              }}
            />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => onDelete?.(question)}
            disabled={isDeleting || isRegenerating}
            sx={{
              color: isDeleting ? "error.main" : "text.disabled",
              transition: "all 0.15s",
              "&:hover": { color: "error.main", bgcolor: "action.hover" },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
</Box>
      </Box>
    </motion.div>
  );
}
