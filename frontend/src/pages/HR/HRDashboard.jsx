import React, { useEffect, useState } from "react";
import api from "./../../api";
import Sidebar from "./../../components/Sidebar"

const HRDashboard = () => {
const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/hr-dashboard"); 
        setMessage(res.data.message || "No message found");
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      }
    };

    fetchDashboard();
  }, []);


  return (
    <div>
      <div className="flex min-h-screen ">
              <Sidebar />
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">HR DASHBOARD</h1>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <p className="text-gray-800 text-lg">{message}</p>
      )}
    </div>
    </div>
    </div>
  )
}

export default HRDashboard
