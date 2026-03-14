import { useState } from "react";
import { Box, Typography, Collapse, ButtonBase } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { InterviewQuestionCard } from "./InterviewQuestionCard";

const difficultyStyles = {
  easy:   { dotColor: "success.main", borderColor: "success.main" },
  medium: { dotColor: "warning.main", borderColor: "warning.main" },
  hard:   { dotColor: "error.main",   borderColor: "error.main"   },
};

export function DifficultySection({
  title,
  difficulty,
  questions,
  askedIds,
  notes,
  onToggleAsked,
  onNoteChange,
  questionRefs,
}) {
  const [expanded, setExpanded] = useState(true);
  const styles = difficultyStyles[difficulty];
  const askedCount = questions.filter((q) => askedIds.has(q.id)).length;

  return (
    <Box
      sx={{
        borderLeft: 2,
        borderColor: styles.borderColor,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Sticky header */}
      <ButtonBase
        onClick={() => setExpanded(!expanded)}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: expanded ? "8px 8px 0 0" : 2,
          px: 2,
          py: 1.5,
          textAlign: "left",
          "&:hover": { bgcolor: "action.hover" },
          transition: "background-color 0.2s",
        }}
      >
        {/* Left side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {expanded ? (
            <ExpandMoreIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          )}

          {/* Difficulty dot */}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: styles.dotColor,
              flexShrink: 0,
            }}
          />

          <Typography variant="body2" fontWeight={600} color="text.primary">
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({questions.length})
          </Typography>
        </Box>

        {/* Right side */}
        <Typography variant="caption" color="text.secondary">
          {askedCount}/{questions.length} asked
        </Typography>
      </ButtonBase>

      {/* Questions */}
      <Collapse in={expanded}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1.5 }}>
          {questions.map((q) => (
            <InterviewQuestionCard
              key={q.id}
              question={q}
              asked={askedIds.has(q.id)}
              note={notes[q.id] || ""}
              onToggleAsked={() => onToggleAsked(q.id)}
              onNoteChange={(note) => onNoteChange(q.id, note)}
              innerRef={(el) => { questionRefs.current[q.id] = el; }}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}