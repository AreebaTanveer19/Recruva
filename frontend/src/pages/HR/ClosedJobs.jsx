import ClosedJobsPage from "../../components/ClosedJobsPage";

export default function DeptClosedJobsPage() {
  return (
    <ClosedJobsPage
      variant="hr"
      detailRoute="/hr/archived-jobs"
      showUnarchiveButton={true}
    />
  );
}
