// import React from 'react'

// const DeptDashboard = () => {
//   return (
//     <div>
//       DEPARTMENT DASHBOARD
//     </div>
//   )
// }

// export default DeptDashboard
import { useNavigate } from "react-router-dom";

function DeptDashboard() {
  const navigate = useNavigate();

  const handleCreateJob = () => {
    navigate("/dept/dashboard/createjob");
  };

  return (
    <div>
      <h1>Department Dashboard</h1>
      <button onClick={handleCreateJob}>
        Create Job
      </button>
    </div>
  );
}

export default DeptDashboard;
