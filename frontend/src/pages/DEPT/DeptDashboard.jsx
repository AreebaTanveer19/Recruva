import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "../../api";

const DeptDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/openJobs");
        setJobs(res.data.jobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs.");
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex-1 p-8  space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Typography variant="h4" fontWeight="bold" className="tracking-tight">
            Department Dashboard
          </Typography>
          <button
            onClick={() => navigate("/dept/dashboard/jobs/createJob")}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            <MdAdd size={20} />
            Create Job
          </button>
        </div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[
            { label: "Total Jobs", value: jobs.length },
            { label: "Active Candidates", value: 90 },
            { label: "Interviews This Week", value: 18 },
            { label: "Hiring Success Rate", value: "72%" },
          ].map((item, index) => (
            <Card
              key={index}
              className="shadow-sm hover:shadow-md transition-shadow rounded-xl"
            >
              <CardContent>
                <Typography
                  color="textSecondary"
                  className="text-sm mb-1 tracking-wide"
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  className="text-gray-900"
                >
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Recent Jobs Table */}
        <Card className="shadow-sm rounded-xl">
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4">
              Recent Job Posts
            </Typography>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-semibold">Job Title</TableCell>
                    <TableCell className="font-semibold">Department</TableCell>
                    <TableCell className="font-semibold">Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {error ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <div className="bg-red-50 text-red-600 rounded shadow p-6 text-center dark:bg-red-900 dark:text-red-400">
                          {error}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job, idx) => (
                      <TableRow
                        key={idx}
                        hover
                        className="cursor-pointer transition-colors"
                      >
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>{job.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeptDashboard;
