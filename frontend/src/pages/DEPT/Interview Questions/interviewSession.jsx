import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  AppBar,
  Toolbar,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FloatingMeetingWindow } from "../../../components/FloatingMeetingWindow"
import { DifficultySection } from "../../../components/DifficultySection";
import { FinishInterviewModal } from "../../../components/FinishInterviewModal";
import { interviewCandidate, interviewQuestions } from "../data/interviewMockData";

export default function InterviewSession() {
  const [askedIds, setAskedIds] = useState(new Set());
  const [notes, setNotes] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const questionRefs = useRef({});

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const easyQs = useMemo(
    () => interviewQuestions.filter((q) => q.difficulty === "easy"),
    []
  );
  const mediumQs = useMemo(
    () => interviewQuestions.filter((q) => q.difficulty === "medium"),
    []
  );
  const hardQs = useMemo(
    () => interviewQuestions.filter((q) => q.difficulty === "hard"),
    []
  );

  const allOrderedIds = useMemo(
    () => [...easyQs, ...mediumQs, ...hardQs].map((q) => q.id),
    [easyQs, mediumQs, hardQs]
  );

  const toggleAsked = useCallback(
    (id) => {
      setAskedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          const currentIdx = allOrderedIds.indexOf(id);
          for (let i = currentIdx + 1; i < allOrderedIds.length; i++) {
            const nextId = allOrderedIds[i];
            if (!next.has(nextId) && questionRefs.current[nextId]) {
              setTimeout(() => {
                questionRefs.current[nextId]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 150);
              break;
            }
          }
        }
        return next;
      });
    },
    [allOrderedIds]
  );

  const updateNote = useCallback((id, note) => {
    setNotes((prev) => ({ ...prev, [id]: note }));
  }, []);

  const askedCount = askedIds.size;
  const totalCount = interviewQuestions.length;
  const progressPercent = totalCount > 0 ? (askedCount / totalCount) * 100 : 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Floating meeting window */}
      <FloatingMeetingWindow
        candidateName={interviewCandidate.name}
        jobTitle={interviewCandidate.jobTitle}
        meetLink={interviewCandidate.meetLink}
      />

      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          backdropFilter: "blur(8px)",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 56,
            display: "flex",
            justifyContent: "space-between",
            px: 3,
          }}
        >
          {/* Left: Title & candidate */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.primary"
            >
              {interviewCandidate.jobTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Candidate: {interviewCandidate.name}
            </Typography>
          </Box>

          {/* Right: Progress */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {askedCount}/{totalCount} questions
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{ width: 128, height: 8, borderRadius: 4 }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, overflowY: "auto", p: 3 }}>
        <Box sx={{ maxWidth: 768, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          <DifficultySection
            title="Easy"
            difficulty="easy"
            questions={easyQs}
            askedIds={askedIds}
            notes={notes}
            onToggleAsked={toggleAsked}
            onNoteChange={updateNote}
            questionRefs={questionRefs}
          />
          <DifficultySection
            title="Medium"
            difficulty="medium"
            questions={mediumQs}
            askedIds={askedIds}
            notes={notes}
            onToggleAsked={toggleAsked}
            onNoteChange={updateNote}
            questionRefs={questionRefs}
          />
          <DifficultySection
            title="Hard"
            difficulty="hard"
            questions={hardQs}
            askedIds={askedIds}
            notes={notes}
            onToggleAsked={toggleAsked}
            onNoteChange={updateNote}
            questionRefs={questionRefs}
          />
        </Box>
      </Box>

      {/* Bottom bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ position: "sticky", bottom: 0, zIndex: 10 }}
      >
        <Paper
          elevation={0}
          square
          sx={{
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 56,
              px: 3,
              maxWidth: 768,
              mx: "auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <CheckCircleIcon
                  sx={{ fontSize: 14, color: "success.main" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {askedCount} asked
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {totalCount - askedCount} remaining
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={() => setShowSummary(true)}
            >
              Finish Interview
            </Button>
          </Box>
        </Paper>
      </motion.div>

      <FinishInterviewModal
        open={showSummary}
        onOpenChange={setShowSummary}
        questions={interviewQuestions}
        askedIds={askedIds}
        notes={notes}
        elapsed={elapsed}
      />
    </Box>
  );
}