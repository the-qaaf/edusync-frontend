import React, { useState } from "react";
import {
  Share2,
  BookOpen,
  Calendar,
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, Button, Badge, Skeleton } from "@/shared/ui";

import { useToast } from "@/shared/ui/Toast";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../auth/AuthContext";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { useDailyUpdates } from "./hooks/useDailyUpdatesQueries";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

const UpdateCard: React.FC<{ update: any }> = ({ update }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongContent =
    (update.homework?.length || 0) + (update.notes?.length || 0) > 300;
  const shouldTruncate = isLongContent && !expanded;

  return (
    <Card
      className={`flex flex-col transition-all duration-300 hover:shadow-md ${
        expanded ? "h-auto" : "h-[450px]"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900">{update.teacherName}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <BookOpen size={12} /> {update.subject}
          </p>
        </div>
        <Badge variant="neutral">
          {update.classGrade}-{update.section}
        </Badge>
      </div>

      <div
        className={`space-y-3 relative flex-1 ${
          shouldTruncate ? "max-h-[280px] overflow-hidden" : ""
        }`}
      >
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Homework
          </p>
          <div className="text-sm text-slate-800 leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 break-words">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {update.homework}
            </ReactMarkdown>
          </div>
        </div>

        {update.notes && (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-500 mb-1">
              Notes
            </p>
            <div className="text-sm text-amber-900 leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 break-words">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {update.notes}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {shouldTruncate && (
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      {isLongContent && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 mt-2 mx-auto"
        >
          {expanded ? (
            <>
              Show Less <ChevronUp size={16} />
            </>
          ) : (
            <>
              Show More <ChevronDown size={16} />
            </>
          )}
        </button>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {update.date}
        </div>
        <span className="font-mono text-[10px] opacity-50">
          ID: {update.id.substring(0, 6)}
        </span>
      </div>
    </Card>
  );
};

const DailyUpdates: React.FC = () => {
  usePageTitle("Daily Updates");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const { schoolId } = useAuth();

  const { data: updates = [], isLoading: loading } = useDailyUpdates(schoolId);

  const getShareLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/submission/${schoolId}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareLink());
    toast("Public submission link copied to clipboard", "success");
  };

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter ? update.classGrade === classFilter : true;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Daily Updates</h2>
          <p className="text-sm text-slate-500">
            Monitor daily homework and class logs submitted by teachers.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/submission/${schoolId}`}>
            <Button variant="secondary">
              <ExternalLink size={16} className="mr-2" /> Open Submission Form
            </Button>
          </Link>
          <Button
            onClick={handleCopyLink}
            className="bg-sky-600 hover:bg-sky-700 text-white border-sky-600"
          >
            <Share2 size={16} className="mr-2" /> Share Link
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col h-full animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <div className="flex-1 space-y-3">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {filteredUpdates.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      )}

      {!loading && filteredUpdates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
          <Filter size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            No updates found matching your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyUpdates;
