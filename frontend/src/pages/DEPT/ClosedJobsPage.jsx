import ClosedJobsPage from "../../components/ClosedJobsPage";

export default function DeptClosedJobsPage() {
  return (
    <ClosedJobsPage
      variant="dept"
      detailRoute="/dept/dashboard/archived-jobs"
    />
  );
}
