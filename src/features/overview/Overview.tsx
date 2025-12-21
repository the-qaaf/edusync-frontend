import React, { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  School,
  Layers,
  Clock,
  BookOpen,
  Activity,
} from "lucide-react";
import { Card, Badge, Skeleton } from "@/shared/ui";
import {
  getDashboardStats,
  DashboardStats,
  ActivityItem,
} from "@/services/firebase/overview";
import { useSchoolSettings } from "@/features/settings/SchoolSettingsContext";
import { ACADEMIC_CLASSES } from "@/shared/constants";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  loading?: boolean;
}> = ({ title, value, icon, change, loading }) => (
  <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      )}
      {change && !loading && (
        <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 inline-block px-2 py-0.5 rounded-full">
          {change}
        </p>
      )}
    </div>
    <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
      {icon}
    </div>
  </div>
);

const ActivityFeed: React.FC<{
  activities: ActivityItem[];
  loading: boolean;
}> = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
          <Activity size={20} />
        </div>
        <p>No recent activity recorded.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {activities.map((item) => (
        <div
          key={item.id}
          className="p-4 flex gap-4 hover:bg-slate-50 transition-colors"
        >
          <div className="mt-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <BookOpen size={14} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{item.title}</p>
            <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
              <Clock size={10} />
              <span>
                {item.timestamp
                  ? new Date(item.timestamp).toLocaleDateString()
                  : "Just now"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthContext";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

const Overview: React.FC = () => {
  usePageTitle("Dashboard");
  const { settings, refreshSettings } = useSchoolSettings();
  const { schoolId, refreshUser } = useAuth();

  useEffect(() => {
    refreshUser();
    refreshSettings();
  }, [refreshUser, refreshSettings]);

  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ["dashboard", schoolId],
    queryFn: () => getDashboardStats(schoolId!),
    enabled: !!schoolId,
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Overview for{" "}
          <span className="font-semibold text-slate-700">
            {settings?.schoolName || "your school"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={<GraduationCap size={20} />}
          // change="+5% this month" // TODO: Calculate real growth
          loading={loading}
        />
        <StatCard
          title="Daily Updates"
          value={stats?.totalUpdates || 0}
          icon={<Layers size={20} />}
          loading={loading}
        />
        <StatCard
          title="Avg Attendance"
          value="94%" // Placeholder until attendance module exists
          icon={<Users size={20} />}
          change="+2.1%"
          loading={loading}
        />
        <StatCard
          title="Active Classes"
          value={ACADEMIC_CLASSES.length}
          icon={<School size={20} />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full overflow-hidden border-0 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
              <Badge variant="neutral">Live</Badge>
            </div>
            <ActivityFeed
              activities={stats?.recentActivity || []}
              loading={loading}
            />
          </Card>
        </div>

        <div>
          <Card className="h-full border-0 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-white">
              <h3 className="font-bold text-slate-800">System Status</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-slate-50/50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Database
                  </span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-50/50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-slate-700">
                    Services
                  </span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-50/50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-slate-700">
                    Storage
                  </span>
                </div>
                <Badge variant="neutral">Healthy</Badge>
              </div>
            </div>

            <div className="px-6 py-4 mt-2">
              <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                <h4 className="text-sm font-bold text-sky-800 mb-1">
                  Quick Tip
                </h4>
                <p className="text-xs text-sky-600 leading-relaxed">
                  You can efficiently manage student records by using the CSV
                  import feature in the Students section.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Overview;
