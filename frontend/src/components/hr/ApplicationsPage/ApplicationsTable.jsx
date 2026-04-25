import ApplicationRow from "./ApplicationRow";

function ApplicationsTable({ filteredApplications, selected, toggleOne, allSelected, toggleAll }) {
  return (
    <div className="overflow-x-auto rounded-2xl shadow-sm bg-white border border-gray-200">
      <table className="w-full text-sm text-gray-800" style={{ tableLayout: "fixed", minWidth: "720px" }}>
        <colgroup>
          <col style={{ width: "40px" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-900 text-white text-left">
            <th className="px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="accent-white cursor-pointer"
              />
            </th>
            <th className="px-3 py-3 font-semibold">Candidate</th>
            <th className="px-3 py-3 font-semibold">Email</th>
            <th className="px-3 py-3 font-semibold">Job</th>
            <th className="px-3 py-3 font-semibold">Department</th>
            <th className="px-3 py-3 font-semibold">Score</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 font-semibold">Applied</th>
            <th className="px-3 py-3 font-semibold">Resume</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications.map((app, idx) => (
            <ApplicationRow
              key={app.id}
              app={app}
              idx={idx}
              isChecked={selected.has(app.id)}
              toggleOne={toggleOne}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationsTable;