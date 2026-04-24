import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  getModeIcon,
  getModeLabel,
  fetchInterviews,
} from "../../../interviewData.jsx";
import { formatDate } from "../../../helper.js";
import api from "../../../api";
import { ACCESS_TOKEN } from "../../../constants";
import { ConfirmDialog } from "../../../components/ConfirmDialog";

export default function InterviewsCalendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [interviewsData, setInterviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarStatus, setCalendarStatus] = useState("idle");
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected") {
      window.history.replaceState({}, "", window.location.pathname);
    }

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const res = await api.get("/interview/calendar-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCalendarStatus(res.data.connected ? "connected" : "idle");
      } catch {
        setCalendarStatus("idle");
      }
    };

    checkStatus();
  }, []);

  const connectCalendar = async () => {
    setCalendarStatus("connecting");
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const res = await api.get("/interview/google-auth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        setCalendarStatus("idle");
      }
    } catch {
      setCalendarStatus("idle");
    }
  };

  const disconnectCalendar = async () => {
    setDisconnecting(true);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      await api.post(
        "/interview/disconnect-calendar",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCalendarStatus("idle");
    } catch {
      // keep status unchanged on failure
    } finally {
      setDisconnecting(false);
      setConfirmOpen(false);
    }
  };

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const data = await fetchInterviews();

        // Transform backend data - position is now provided by backend
        const formatted = data.map((i) => ({
          id: i.id,
          jobId: i.jobId,
          date: new Date(i.startTime),
          time: `${new Date(i.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${new Date(i.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          candidateName: i.candidateName,
          candidateEmail: i.candidateEmail,
          position: i.position,
          mode: i.mode === "google_meet" ? "google_meet" : "on_site",
          meetingLink: i.meetLink,
          status: i.status,
          applicationId: i.applicationId,
        }));

        setInterviewsData(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, []);

  const isInterviewPassed = (interview) => {
    return new Date(interview.date) < new Date();
  };

  const filteredInterviews = interviewsData.filter(
    (interview) =>
      interview.date.toDateString() === selectedDate.toDateString(),
  );
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>

          <p className="text-gray-700 text-lg font-medium">
            Loading interviews...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8">
        <div className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight">
                Interviews Calendar
              </h1>
              <p className="text-neutral-500 text-[15px]">
                View and manage all scheduled interviews
              </p>
            </div>

            {/* Google Calendar connection */}
            <div className="flex items-center gap-3">
              {calendarStatus === "connected" ? (
                <>
                  <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Google Calendar Connected
                  </span>
                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={disconnecting}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={connectCalendar}
                  disabled={calendarStatus === "connecting"}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {calendarStatus === "connecting" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Google Calendar"
                  )}
                </button>
              )}
            </div>
          </div>

          {calendarStatus !== "connected" && (
            <p className="mt-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
              Connect your Google Calendar.
            </p>
          )}
        </div>

        <div className="w-full flex justify-center mt-10">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="p-4 rounded-xl shadow-sm bg-white mx-auto lg:mx-0">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  sx={{
                    "& .MuiPickersDay-root": {
                      borderRadius: "8px",
                      "&.Mui-selected": {
                        backgroundColor: "hsl(0, 0%, 9%)",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "hsl(0, 0%, 15%)",
                      },
                    },
                    "& .MuiPickersCalendarHeader-label": {
                      fontWeight: 600,
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="w-full lg:w-[680px] p-3 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    className="p-1 rounded hover:bg-neutral-200"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.setDate(selectedDate.getDate() - 1),
                        ),
                      )
                    }
                  >
                    <ChevronLeftIcon />
                  </button>

                  <p className="font-semibold text-lg text-neutral-900">
                    {formatDate(selectedDate)}
                  </p>

                  <button
                    className="p-1 rounded hover:bg-neutral-200"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.setDate(selectedDate.getDate() + 1),
                        ),
                      )
                    }
                  >
                    <ChevronRightIcon />
                  </button>
                </div>

                <span className="px-3 py-1 rounded-full bg-white text-sm font-medium text-black border border-black">
                  {filteredInterviews.length} interview
                  {filteredInterviews.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Empty State */}
              {filteredInterviews.length === 0 ? (
                <div className="p-8 bg-white rounded-xl shadow-sm text-center">
                  <p className="text-neutral-500 text-base">
                    No interviews scheduled for this date
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-7">
                  {filteredInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="p-4 bg-white rounded-xl shadow-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold bg-black-100 text-neutral-600">
                          {interview.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-neutral-900">
                            {interview.candidateName}
                          </p>
                          <p className="text-neutral-500 text-sm mb-2">
                            {interview.position}
                          </p>

                          <div className="flex items-center justify-between w-full flex-wrap gap-3">
                            <div className="flex gap-2 flex-wrap">
                              <div className="flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                                <AccessTimeIcon className="!text-[16px]" />
                                {interview.time}
                              </div>
                              <div
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
    ${
      interview.mode === "on_site"
        ? "bg-teal-50 text-teal-600"
        : "bg-blue-50 text-blue-600"
    }`}
                              >
                                {getModeIcon(interview.mode)}
                                {getModeLabel(interview.mode)}
                              </div>
                            </div>

                            {interview.mode !== "on_site" &&
                              interview.meetingLink && (
                                <button
                                  onClick={() => {
                                    if (!isInterviewPassed(interview)) {
                                      navigate(
                                        "/dept/dashboard/interview-session",
                                        {
                                          state: {
                                            candidateName:
                                              interview.candidateName,
                                            candidateEmail: interview.candidateEmail,
                                            meetLink: interview.meetingLink,
                                            jobId: interview.jobId,
                                            interviewId: interview.id,
                                            position: interview.position,
                                            applicationId: interview.applicationId,
                                          },
                                        },
                                      );
                                    }
                                  }}
                                  disabled={isInterviewPassed(interview)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    isInterviewPassed(interview)
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-black text-white hover:bg-gray-800"
                                  }`}
                                >
                                  {isInterviewPassed(interview) ? "Interview Passed" : "Conduct Interview"}
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        title="Disconnect Google Calendar"
        message="Are you sure you want to disconnect your Google Calendar? You won't be the meeting host for future interviews until you reconnect."
        confirmText="Disconnect"
        confirmColor="error"
        loading={disconnecting}
        onConfirm={disconnectCalendar}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
