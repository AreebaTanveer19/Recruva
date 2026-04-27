import { useState } from "react";
import { Box, Typography, Collapse, ButtonBase } from "@mui/material";
import { InterviewQuestionCard } from "./InterviewQuestionCard";

const difficultyOrder = { easy: 0, medium: 1, hard: 2 };

const difficultyConfig = {
  easy: { color: "#22c55e" },
  medium: { color: "#f59e0b" },
  hard: { color: "#ef4444" },
};

export function TopicSection({
  topic,
  questions,
  questionRefs,
  onDelete,
  onRegenerate,
  regeneratingId,
  deletingId,
  newQuestionIds = new Set(),
}) {
  const [expanded, setExpanded] = useState(true);

  const sorted = [...questions].sort(
    (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <ButtonBase
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1,
          px: 0,
          width: "100%",
          textAlign: "left",
          borderRadius: 1,
          "&:hover .topic-title": { opacity: 0.6 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            className="topic-title"
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "text.secondary",
              transition: "opacity 0.15s",
            }}
          >
            {topic}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              color: "text.disabled",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {questions.length}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Difficulty dots summary */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {Object.entries(difficultyConfig).map(([diff, { color }]) => {
              const count = questions.filter(
                (q) => q.difficulty === diff,
              ).length;
              if (count === 0) return null;
              return (
                <Box
                  key={diff}
                  sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      bgcolor: color,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: "text.disabled",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.disabled",
              transition: "transform 0.2s",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 4L5 7L8 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Box>
      </ButtonBase>

      {/* Divider */}
      <Box sx={{ height: "1px", bgcolor: "divider", mb: 1.5 }} />

      {/* Questions */}
      <Collapse in={expanded} unmountOnExit>
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 2 }}
        >
          {sorted.map((q, index) => (
            <InterviewQuestionCard
              key={q.id}
              question={{
                ...q,
                number: index + 1,
                text: q.question,
                answer: q.briefAnswer,
              }}
              innerRef={(el) => {
                questionRefs.current[q.id] = el;
              }}
              onDelete={onDelete}
              onRegenerate={onRegenerate}
              isRegenerating={regeneratingId === q.id}
              isDeleting={deletingId === q.id}
              isNew={newQuestionIds.has(q.id)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
