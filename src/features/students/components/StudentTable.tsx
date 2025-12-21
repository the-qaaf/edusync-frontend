import React from "react";
import { UserMinus } from "lucide-react";
import { Student } from "@/types";
import { Badge, Button, Skeleton } from "@/shared/ui";

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onTransfer: (student: Student) => void;
  onMarkLeft: (id: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  loading,
  onTransfer,
  onMarkLeft,
}) => {
  return (
    <div className="overflow-x-auto min-h-[300px]">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-6 py-4">Roll No</th>
            <th className="px-6 py-4">Student Name</th>
            <th className="px-6 py-4">Class / Section</th>
            <th className="px-6 py-4">Class Teacher</th>
            <th className="px-6 py-4">Parent Phone</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-7 w-8" />
                  </div>
                </td>
              </tr>
            ))
          ) : students.length > 0 ? (
            students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {student.rollNumber}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {student.name}
                </td>
                <td className="px-6 py-4">
                  {student.class} - {student.section}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {student.classTeacher || "-"}
                </td>
                <td className="px-6 py-4">{student.parentPhone}</td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      student.status === "Active"
                        ? "success"
                        : student.status === "Left"
                        ? "error"
                        : "warning"
                    }
                  >
                    {student.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onTransfer(student)}
                    >
                      Transfer
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onMarkLeft(student.id)}
                      title="Mark as Left"
                    >
                      <UserMinus size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                <p>No students found.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
