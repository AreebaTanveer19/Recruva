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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { FloatingMeetingWindow } from "../../../components/dept/FloatingMeetingWindow";
import { TopicSection } from "../../../components/dept/TopicSection";
import { FinishInterviewModal } from "../../../components/dept/FinishInterviewModal";
import AlertDisplay from "../../../components/AlertDisplay";
// import { fetchOpenJobs, deleteQuestion, regenerateQuestion, generateMoreQuestions } from "../../../helper";
import { fetchOpenJobs, generateMoreQuestions, deleteQuestion } from "../../../helper";
export default function InterviewSession() {
  const [jobs, setJobs]               = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [grouped, setGrouped]         = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const [alert, setAlert]             = useState({ type: "", title: "", message: "" });
  // const [regeneratingId, setRegeneratingId] = useState(null);
   const [deletingId, setDeletingId]         = useState(null);
  const [timerStopped, setTimerStopped]     = useState(false);
  const [showGenerateMore, setShowGenerateMore] = useState(false);
  const [moreCount, setMoreCount]               = useState(5);
  const [moreDifficulty, setMoreDifficulty]     = useState("any");
  const [moreKeywords, setMoreKeywords]         = useState("");
  const [targetKeyword, setTargetKeyword]       = useState("");
  const [generatingMore, setGeneratingMore]     = useState(false);
  const [newQuestionIds, setNewQuestionIds]     = useState(new Set());
  const questionRefs = useRef({});
  const location = useLocation();
  const { candidateName, meetLink, mode, jobId, position, interviewId } = location.state || {};

 
  const showAlert = (type, title, message) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert({ type: "", title: "", message: "" }), 3000);
  };

  /* ---------------- Fetch Jobs & Set Selected Job from params ---------------- */

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

  // Separate effect to set selected job when jobId is provided
  useEffect(() => {
    if (jobId) {
      console.log("Setting selected job to:", jobId);
      setSelectedJob(jobId);
    }
  }, [jobId]);

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

 
  /* ---------------- Generate More Questions ---------------- */

  const handleGenerateMore = async () => {
    if (!selectedJob) return;
    try {
      setGeneratingMore(true);
      showAlert("info", "Generating", "Generating additional questions, please wait...");
      const keywords = moreKeywords.split(",").map(k => k.trim()).filter(Boolean);
      const res = await generateMoreQuestions(selectedJob, moreCount, moreDifficulty, keywords, targetKeyword || null);
      setNewQuestionIds(new Set(res.newIds || []));
      setGrouped(res.questions.grouped || {});
      setShowGenerateMore(false);
      setMoreKeywords("");
      setTargetKeyword("");
      showAlert("success", "Done", `${res.newIds?.length ?? moreCount} new question${moreCount > 1 ? "s" : ""} added successfully.`);
    } catch (err) {
      console.error("Error generating more questions:", err);
      showAlert("error", "Failed", "Could not generate more questions. Please try again.");
    } finally {
      setGeneratingMore(false);
    }
  };

  /* ---------------- Flat list for finish modal ---------------- */

  const allQuestions = useMemo(() => Object.values(grouped).flat(), [grouped]);
  if (!candidateName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">No interview selected</p>
          <p className="text-sm text-gray-500 mt-1">
            Open your Interviews Calendar and click <span className="font-medium">Conduct Interview</span> on a scheduled interview to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      {mode === "google_meet" && (
        <FloatingMeetingWindow
          candidateName={candidateName}
          jobTitle={position || "Interview"}
          meetLink={meetLink}
          stopped={timerStopped}
        />
      )}

      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ minHeight: 56, display: "flex", justifyContent: "space-between", px: 3 }}>

          {/* Left */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="black">
              {position || "Interview"}
            </Typography>
            <Typography variant="caption" color="black">
              Candidate: {candidateName}
            </Typography>
          </Box>

          {/* Right */}
          {jobId ? (
            // If jobId is provided via params, show the job title as text
            <Typography variant="subtitle2" fontWeight={700} color="black">
              {position || "Loading..."}
            </Typography>
          ) : (
            // Otherwise show the dropdown to select a job
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
          )}

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
<div className="flex flex-col items-center justify-center">
  {/* Spinner */}
  {selectedJob && (
    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-4"></div>
  )}

  {/* Loading / info text */}
  <Typography
    variant="body1"
    color="textSecondary"
    sx={{ textAlign: "center" }}
  >
    {selectedJob ? "Loading questions..." : "Select a job to load questions"}
  </Typography>
</div>
          ) : (
            Object.entries(grouped).map(([topic, questions]) => (
              <TopicSection
                key={topic}
                topic={topic}
                questions={questions}
                questionRefs={questionRefs}
                onDelete={handleDeleteQuestion}
             
               
                 deletingId={deletingId}
                newQuestionIds={newQuestionIds}
              />
            ))
          )}

        </Box>
      </Box>

      {/* Generate More Dialog */}
      <Dialog
        open={showGenerateMore}
        onClose={() => !generatingMore && setShowGenerateMore(false)}
        PaperProps={{ elevation: 0, sx: { borderRadius: "16px", border: "1px solid #f3f4f6", boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)", width: 420 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1rem", color: "#171717", letterSpacing: "-0.01em", pb: 0.5 }}>
          Generate More Questions
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {/* Target Keyword */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 0.75 }}>
              Add Questions Under Keyword
            </Typography>
            <Select
              size="small"
              fullWidth
              value={targetKeyword}
              onChange={e => setTargetKeyword(e.target.value)}
              sx={{ borderRadius: "8px", bgcolor: "#f9fafb", fontSize: "0.875rem" }}
            >
              <MenuItem value="">Auto-group by tags (recommended)</MenuItem>
              {Object.keys(grouped).map(keyword => (
                <MenuItem key={keyword} value={keyword}>{keyword}</MenuItem>
              ))}
            </Select>
            <Typography variant="caption" sx={{ color: "#9ca3af", mt: 0.5, display: "block" }}>
              Select a keyword to ensure new questions are grouped under it.
            </Typography>
          </Box>

          {/* Count */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 0.75 }}>
              Number of Questions (1–10)
            </Typography>
            <TextField
              type="number"
              size="small"
              fullWidth
              value={moreCount}
              onChange={e => setMoreCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: 10 }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#f9fafb", fontSize: "0.875rem" } }}
            />
          </Box>

          {/* Difficulty */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 0.75 }}>
              Difficulty
            </Typography>
            <Select
              size="small"
              fullWidth
              value={moreDifficulty}
              onChange={e => setMoreDifficulty(e.target.value)}
              sx={{ borderRadius: "8px", bgcolor: "#f9fafb", fontSize: "0.875rem" }}
            >
              <MenuItem value="any">Any (mixed)</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </Box>

          {/* Keywords */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 0.75 }}>
              Focus Keywords{" "}
              <Box component="span" sx={{ fontWeight: 400, color: "#9ca3af", textTransform: "none" }}>(optional, comma-separated)</Box>
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. React hooks, async/await, system design"
              value={moreKeywords}
              onChange={e => setMoreKeywords(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#f9fafb", fontSize: "0.875rem" } }}
            />
            <Typography variant="caption" sx={{ color: "#9ca3af", mt: 0.5, display: "block" }}>
              Leave blank to use the job's existing tech stack keywords.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setShowGenerateMore(false)}
            disabled={generatingMore}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "#e5e7eb",
              color: "#6b7280",
              fontWeight: 500,
              fontSize: "0.875rem",
              "&:hover": { bgcolor: "#f9fafb" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateMore}
            disabled={generatingMore}
            sx={{
              bgcolor: "#111827",
              color: "#fff",
              "&:hover": { bgcolor: "#1f2937", boxShadow: "none" },
              "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
              borderRadius: "8px",
              px: 3,
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.875rem",
              boxShadow: "none",
            }}
          >
            {generatingMore ? "Generating..." : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottom Bar */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ position: "sticky", bottom: 0 }}>
        <Paper elevation={0} square sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5, height: 56, px: 3 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowGenerateMore(true)}
              sx={{ borderColor: "#d1d5db", color: "#374151", "&:hover": { borderColor: "#000", color: "#000" }, borderRadius: 1.5, px: 2.5 }}
            >
              Generate More
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowSummary(true)}
              sx={{ bgcolor: "#000", color: "#fff", "&:hover": { bgcolor: "#222" }, borderRadius: 1.5, px: 2.5 }}
            >
              Submit Feedback
            </Button>
          </Box>
        </Paper>
      </motion.div>

      <FinishInterviewModal
        open={showSummary}
        onOpenChange={setShowSummary}
        questions={allQuestions}
        elapsed={elapsed}
        interviewId={interviewId}
        onFinish={() => {
          setShowSummary(false);
          setTimerStopped(true);
          showAlert("success", "Feedback Submitted", "Your interview feedback has been recorded successfully.");
        }}
      />

    </Box>
  );
}