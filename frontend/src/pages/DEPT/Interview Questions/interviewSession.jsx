import { useState, useRef, useEffect, useMemo } from "react";
import api from "../../../api";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";

import { FloatingMeetingWindow } from "../../../components/dept/FloatingMeetingWindow";
import { TopicSection } from "../../../components/dept/TopicSection";
import { FinishInterviewModal } from "../../../components/dept/FinishInterviewModal";
import AlertDisplay from "../../../components/AlertDisplay";
import { interviewCandidate } from "../data/interviewMockData";
import { fetchOpenJobs, deleteQuestion, regenerateQuestion } from "../../../helper";

export default function InterviewSession() {
  const [jobs, setJobs]               = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [grouped, setGrouped]         = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const [alert, setAlert]             = useState({ type: "", title: "", message: "" });
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [deletingId, setDeletingId]         = useState(null);
  const questionRefs = useRef({});


  const showAlert = (type, title, message) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert({ type: "", title: "", message: "" }), 3000);
  };

  /* ---------------- Fetch Jobs ---------------- */

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsData = await fetchOpenJobs();
        setJobs(jobsData);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    loadJobs();
  }, []);

  /* ---------------- Fetch Questions ---------------- */

  useEffect(() => {
    if (!selectedJob) return;

    const fetchQuestions = async () => {
      try {
        const res = await api.post(`/jobs/${selectedJob}/generate-questions`);
        setGrouped(res.data.questions.grouped || {});
      } catch (err) {
        console.error("Error fetching questions", err);
      }
    };

    fetchQuestions();
  }, [selectedJob]);

  /* ---------------- Timer ---------------- */

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

 /* ---------------- Delete Question ---------------- */

  const handleDeleteQuestion = async (question) => {
    try {
      setDeletingId(question.id);
      await deleteQuestion(selectedJob, question.id);

      setGrouped((prev) => {
        const updated = { ...prev };
        for (const topic in updated) {
          const filtered = updated[topic].filter((q) => q.id !== question.id);
          if (filtered.length === 0) {
            delete updated[topic];
          } else {
            updated[topic] = filtered;
          }
        }
        return updated;
      });

      showAlert("success", "Question Deleted", "Question has been removed successfully.");
    } catch (err) {
      console.error("Error deleting question:", err);
      showAlert("error", "Delete Failed", "Failed to delete the question. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- Regenerate Question ---------------- */

  const handleRegenerateQuestion = async (question) => {
    try {
      setRegeneratingId(question.id);
      showAlert("info", "Regenerating", "Generating a new question, please wait...");

      const res = await regenerateQuestion(selectedJob, question.id);
      const newQuestion = res.question;

      setGrouped((prev) => {
        const updated = { ...prev };
        for (const topic in updated) {
          const idx = updated[topic].findIndex((q) => q.id === question.id);
          if (idx !== -1) {
            updated[topic] = updated[topic].map((q) =>
              q.id === question.id ? newQuestion : q
            );
            break;
          }
        }
        return updated;
      });

      showAlert("success", "Question Regenerated", "A new question has been generated successfully.");
    } catch (err) {
      console.error("Error regenerating question:", err);
      showAlert("error", "Regeneration Failed", "Failed to regenerate the question. Please try again.");
    } finally {
      setRegeneratingId(null);
    }
  };
  /* ---------------- Flat list for finish modal ---------------- */

  const allQuestions = useMemo(() => Object.values(grouped).flat(), [grouped]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>

      {/* Floating Meeting Window */}
      <FloatingMeetingWindow
        candidateName={interviewCandidate.name}
        jobTitle={interviewCandidate.jobTitle}
        meetLink={interviewCandidate.meetLink}
      />

      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ minHeight: 56, display: "flex", justifyContent: "space-between", px: 3 }}>

          {/* Left */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {interviewCandidate.jobTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Candidate: {interviewCandidate.name}
            </Typography>
          </Box>

          {/* Right */}
          <Select
            size="small"
            value={selectedJob}
            onChange={(e) => {
              setSelectedJob(e.target.value);
              setGrouped({});
            }}
            displayEmpty
          >
            <MenuItem value="">Select Job</MenuItem>
            {jobs.map((job) => (
              <MenuItem key={job.id} value={job.id}>{job.title}</MenuItem>
            ))}
          </Select>

        </Toolbar>
      </AppBar>
 {/* Alert */}
      {alert.message && (
        <Box sx={{ px: 3, pt: 2 }}>
          <AlertDisplay
            type={alert.type}
            title={alert.title}
            message={alert.message}
          />
        </Box>
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, overflowY: "auto", p: 3 }}>
        <Box sx={{ maxWidth: 768, ml: 4, display: "flex", flexDirection: "column", gap: 1 }}>

          {Object.keys(grouped).length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: "center", mt: 8 }}>
              {selectedJob ? "Loading questions..." : "Select a job to load questions"}
            </Typography>
          ) : (
            Object.entries(grouped).map(([topic, questions]) => (
              <TopicSection
                key={topic}
                topic={topic}
                questions={questions}
                questionRefs={questionRefs}
                onDelete={handleDeleteQuestion}
                onRegenerate={handleRegenerateQuestion}
                regeneratingId={regeneratingId}
                deletingId={deletingId}
              />
            ))
          )}

        </Box>
      </Box>

      {/* Bottom Bar */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ position: "sticky", bottom: 0 }}>
        <Paper elevation={0} square sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", height: 56, px: 3 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowSummary(true)}
              sx={{ bgcolor: "#000", color: "#fff", "&:hover": { bgcolor: "#222" }, borderRadius: 1.5, px: 2.5 }}
            >
              Finish Interview
            </Button>
          </Box>
        </Paper>
      </motion.div>

      <FinishInterviewModal
        open={showSummary}
        onOpenChange={setShowSummary}
        questions={allQuestions}
        elapsed={elapsed}
      />

    </Box>
  );
}