import { Badge, Button, Skeleton, Dropdown, DropdownItem } from "@/shared/ui";
import { Student } from "@/types";
import {
  Edit2,
  ArrowRightLeft,
  UserMinus,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onTransfer: (student: Student) => void;
  onMarkLeft: (id: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  loading,
  onTransfer,
  onMarkLeft,
  onEdit,
  onDelete,
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
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                  >
                    <DropdownItem onClick={() => onEdit(student)}>
                      <div className="flex items-center">
                        <Edit2 size={14} className="mr-2" /> Edit
                      </div>
                    </DropdownItem>
                    <DropdownItem onClick={() => onTransfer(student)}>
                      <div className="flex items-center">
                        <ArrowRightLeft size={14} className="mr-2" /> Transfer
                      </div>
                    </DropdownItem>
                    <DropdownItem onClick={() => onMarkLeft(student.id)}>
                      <div className="flex items-center text-orange-600">
                        <UserMinus size={14} className="mr-2" /> Mark as Left
                      </div>
                    </DropdownItem>
                    <DropdownItem danger onClick={() => onDelete(student.id)}>
                      <div className="flex items-center">
                        <Trash2 size={14} className="mr-2" /> Delete
                      </div>
                    </DropdownItem>
                  </Dropdown>
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
