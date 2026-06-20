import type { Activity } from "../../types";
import { Scrollbar } from "../../components/scrollbar";

interface ActivityTableProps {
  rows: Activity[];
}

export function ActivityTable({ rows }: ActivityTableProps) {
  return (
    <Scrollbar>
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr>
            {["Nama", "Penempatan", "Divisi", "Status", "Progres"].map(
              (head) => (
                <th
                  className="border-b border-border py-3.5 px-2.5 text-left text-[0.78rem] font-semibold tracking-[0.08em] uppercase text-muted"
                  key={head}
                >
                  {head}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.name}-${row.location}`}>
              <td className="border-b border-border py-3.5 px-2.5 font-bold text-text">
                {row.name}
              </td>
              <td className="border-b border-border py-3.5 px-2.5 font-bold text-text">
                {row.location}
              </td>
              <td className="border-b border-border py-3.5 px-2.5 font-bold text-text">
                {row.division}
              </td>
              <td className="border-b border-border py-3.5 px-2.5 font-bold text-text">
                <span className="inline-flex rounded-full bg-primary-soft px-[11px] py-[7px] text-[0.8rem] font-black text-primary-dark">
                  {row.status}
                </span>
              </td>
              <td className="border-b border-border py-3.5 px-2.5 font-bold text-text">
                {row.progress}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Scrollbar>
  );
}
