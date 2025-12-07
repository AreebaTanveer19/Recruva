import { useState } from "react";
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import VideocamIcon from "@mui/icons-material/Videocam";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const mockInterviews = [
  {
    id: "1",
    candidateName: "Sarah Johnson",
    position: "Senior Frontend Developer",
    date: new Date(),
    time: "10:00 AM",
    mode: "google_meet",
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "2",
    candidateName: "Michael Chen",
    position: "Product Manager",
    date: new Date(),
    time: "2:00 PM",
    mode: "zoom",
    meetingLink: "https://zoom.us/j/123456789",
  },
  {
    id: "3",
    candidateName: "Emily Davis",
    position: "UX Designer",
    date: new Date(Date.now() + 86400000),
    time: "11:00 AM",
    mode: "onsite",
  },
  {
    id: "4",
    candidateName: "James Wilson",
    position: "Backend Engineer",
    date: new Date(Date.now() + 86400000 * 2),
    time: "3:30 PM",
    mode: "google_meet",
    meetingLink: "https://meet.google.com/xyz-uvwx-yz",
  },
];

const getModeIcon = (mode) => {
  switch (mode) {
    case "google_meet":
    case "zoom":
      return <VideocamIcon className="!text-[16px]" />;
    case "onsite":
      return <LocationOnIcon className="!text-[16px]" />;
    default:
      return null;
  }
};

const getModeLabel = (mode) => {
  switch (mode) {
    case "google_meet":
      return "Google Meet";
    case "zoom":
      return "Zoom";
    case "onsite":
      return "On-Site";
    default:
      return "";
  }
};

export default function InterviewsCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredInterviews = mockInterviews.filter(
    (interview) => interview.date.toDateString() === selectedDate.toDateString()
  );

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight">
            Interviews Calendar
          </h1>
          <p className="text-neutral-500 text-[15px]">
            View and manage all scheduled interviews
          </p>
        </div>

        {/* Responsive Container */}
        <div className="w-full flex justify-center mt-10">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar */}
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

            {/* Right Panel */}
            <div className="w-full lg:w-[680px] p-3 rounded-xl bg-gray-50">
              {/* Date Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    className="p-1 rounded hover:bg-neutral-200"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.setDate(selectedDate.getDate() - 1)
                        )
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
                          selectedDate.setDate(selectedDate.getDate() + 1)
                        )
                      )
                    }
                  >
                    <ChevronRightIcon />
                  </button>
                </div>

                <span className="px-3 py-1 rounded-full bg-white text-sm font-medium text-teal-600 border border-teal-600">
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
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold bg-teal-50 text-teal-600">
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

                          {/* Chips + Join button row */}
                          <div className="flex items-center justify-between w-full flex-wrap gap-3">
                            {/* Chips Left */}
                            <div className="flex gap-2 flex-wrap">
                              <div className="flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                                <AccessTimeIcon className="!text-[16px]" />
                                {interview.time}
                              </div>

                              <div
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                  ${
                    interview.mode === "onsite"
                      ? "bg-teal-50 text-teal-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                              >
                                {getModeIcon(interview.mode)}
                                {getModeLabel(interview.mode)}
                              </div>
                            </div>

                            {/* Right Join Button */}
                            {interview.mode !== "onsite" &&
                              interview.meetingLink && (
                                <a
                                  href={interview.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
                                >
                                  Join Meeting
                                </a>
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
    </div>
  );
}
