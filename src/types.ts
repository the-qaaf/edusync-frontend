export type NavigationItem =
  | "overview"
  | "students"
  | "daily-updates"
  | "reports"
  | "broadcast"
  | "settings";

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  classTeacher: string;
  parentPhone: string;
  alternateParentPhone?: string; // Additional field
  parentEmail: string;
  status: "Active" | "Transfer Pending" | "Left" | "Transferred";
  schoolId: string; // Ensure schoolId is stored explicitly on the record
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: "info" | "warning" | "success";
}

export interface BroadcastLog {
  id: string;
  date: string;
  message: string;
  template: string;
  recipients: number;
  channels?: string[];
  status: "Delivered" | "Failed" | "Pending";
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  classes: string[];
  sections: string[];
  subjects: string[];
  status: "Active" | "Inactive";
}

export interface ClassSection {
  id: string;
  name: string;
  classGrade: string;
  section: string;
  teacherId: string;
  studentCount: number;
}

export interface DailyUpdate {
  id: string;
  date: string;
  teacherName: string;
  classGrade: string;
  section: string;
  subject: string;
  homework: string;
  notes?: string;
}
