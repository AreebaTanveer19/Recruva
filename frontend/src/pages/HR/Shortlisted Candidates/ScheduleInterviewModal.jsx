import { useState, useEffect } from "react";
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
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VideocamIcon from "@mui/icons-material/Videocam";
import LinkIcon from "@mui/icons-material/Link";
import PlaceIcon from "@mui/icons-material/Place";
import DescriptionIcon from "@mui/icons-material/Description";
import { interviewModes, checkUserCalendarStatus } from "../../../interviewData";
import { getUsersByRole } from "../data/candidateList";


export default function ScheduleInterviewModal({
  open,
  onClose,
  candidate,
  onSchedule,
  isScheduling = false,
}) {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [mode, setMode] = useState("");
  const [notes, setNotes] = useState("");
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [assignedToId, setAssignedToId] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [interviewerCalendarConnected, setInterviewerCalendarConnected] = useState(null);

  useEffect(() => {
    if (open) {
      const loadDepartmentUsers = async () => {
        try {
          setLoadingUsers(true);
          const users = await getUsersByRole("DEPARTMENT");
          setDepartmentUsers(users);
        } catch (error) {
          console.error("Failed to load department users:", error);
        } finally {
          setLoadingUsers(false);
        }
      };
      loadDepartmentUsers();
    }
  }, [open]);

  useEffect(() => {
    if (!assignedToId) {
      setInterviewerCalendarConnected(null);
      return;
    }
    checkUserCalendarStatus(assignedToId).then(setInterviewerCalendarConnected);
  }, [assignedToId]);

  const handleModeChange = (value) => {
    setMode(value);
  };

  const handleSubmit = () => {
  if (!date || !time || !mode || !candidate || !assignedToId) return;

  // Format date and time
  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  const formattedTime = dayjs(time).format("HH:mm");

  onSchedule({
    applicationId: candidate.applicationId,
    date: formattedDate,
    startTime: formattedTime,
    mode,
    notes,
    assignedToId: parseInt(assignedToId),
  });
};


  const isPastDateTime =
    date && time
      ? dayjs(date)
          .hour(dayjs(time).hour())
          .minute(dayjs(time).minute())
          .second(0)
          .isBefore(dayjs())
      : false;

  const isFormValid = date && time && mode && assignedToId && !isScheduling && !isPastDateTime;

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
                      error: isPastDateTime,
                    },
                  }}
                />
                {isPastDateTime && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    This date and time has already passed.
                  </Typography>
                )}
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

            {/* ASSIGN TO DEPARTMENT USER */}
            <Box>
              <Typography
                variant="caption"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <PlaceIcon fontSize="small" /> Assign To Department User
              </Typography>

              <FormControl fullWidth size="small" disabled={loadingUsers}>
                <Select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    {loadingUsers ? "Loading users..." : "Select a department user"}
                  </MenuItem>

                  {departmentUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {interviewerCalendarConnected === true && (
                <Alert severity="success" sx={{ mt: 1, borderRadius: 2 }}>
                  This interviewer will be the meeting host.
                </Alert>
              )}
              {interviewerCalendarConnected === false && (
                <Alert severity="warning" sx={{ mt: 1, borderRadius: 2 }}>
                  This interviewer has not connected Google Calendar.
                </Alert>
              )}
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
            {isScheduling ? "Scheduling..." : "Schedule Interview"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
