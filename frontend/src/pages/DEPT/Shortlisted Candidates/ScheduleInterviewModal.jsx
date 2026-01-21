import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Paper,
  Divider,
} from "@mui/material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VideocamIcon from "@mui/icons-material/Videocam";
import LinkIcon from "@mui/icons-material/Link";
import PlaceIcon from "@mui/icons-material/Place";
import DescriptionIcon from "@mui/icons-material/Description";
import { interviewModes, meetingLinkTemplates } from "../data/interviewData";


export default function ScheduleInterviewModal({
  open,
  onClose,
  candidate,
  onSchedule,
}) {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [mode, setMode] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  const handleModeChange = (value) => {
    setMode(value);
    setMeetingLink(meetingLinkTemplates[value] || "");
  };

  const handleSubmit = () => {
    if (!date || !time || !mode || !candidate) return;

    onSchedule({
      candidateId: candidate.id,
      date,
      time,
      mode,
      meetingLink,
      notes,
    });

    setDate(null);
    setTime(null);
    setMode("");
    setMeetingLink("");
    setNotes("");
    onClose();
  };

  const isFormValid = date && time && mode;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
       // maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 3,
            backgroundColor: "#ffffff",
            p: 0,
          },
        }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Schedule Interview
            </Typography>

            {candidate && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {candidate.name} • {candidate.position}
              </Typography>
            )}
          </Box>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        {/* FORM */}
        <DialogContent sx={{ mt: 2 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* DATE + TIME */}
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography
                  variant="caption"
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <CalendarMonthIcon fontSize="small" /> Interview Date
                </Typography>
                <DatePicker
                  value={date}
                  onChange={(value) => setDate(value)}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </Box>

              <Box flex={1}>
                <Typography
                  variant="caption"
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <AccessTimeIcon fontSize="small" /> Interview Time
                </Typography>
                <TimePicker
                  value={time}
                  onChange={(value) => setTime(value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </Box>
            </Box>

            {/* MODE */}
            <Box>
              <Typography
                variant="caption"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <VideocamIcon fontSize="small" /> Interview Mode
              </Typography>

              <FormControl fullWidth size="small">
                <Select
                  value={mode}
                  onChange={(e) => handleModeChange(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    Select interview mode
                  </MenuItem>

                  {interviewModes.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* MEETING LINK */}
            <Box>
              <Typography
                variant="caption"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                {mode === "on-site" ? (
                  <PlaceIcon fontSize="small" />
                ) : (
                  <LinkIcon fontSize="small" />
                )}
                {mode === "on-site" ? "Office Location" : "Meeting Link"}
              </Typography>

              <TextField
                fullWidth
                size="small"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder={
                  mode === "on-site"
                    ? "Enter full office address"
                    : "Paste meeting link"
                }
                sx={{ borderRadius: 2 }}
              />
            </Box>

            {/* NOTES */}
            <Box>
              <Typography
                variant="caption"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <DescriptionIcon fontSize="small" /> Additional Notes
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything additional for the candidate..."
                sx={{ borderRadius: 2 }}
              />
            </Box>
          </Box>
        </DialogContent>

        <Divider />

        {/* FOOTER */}
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 20,
              px: 3,
              py: 1,
            }}
          >
            Schedule Interview
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
