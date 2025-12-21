import React from "react";
import { Search, RefreshCw, X } from "lucide-react";
import { Input, Select, Button } from "@/shared/ui";
import { ACADEMIC_CLASSES, ACADEMIC_SECTIONS } from "@/shared/constants";

interface StudentFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filterClass: string;
  onFilterClassChange: (val: string) => void;
  filterSection: string;
  onFilterSectionChange: (val: string) => void;
  onRefresh: () => void;
  onClear: () => void;
  loading: boolean;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterClass,
  onFilterClassChange,
  filterSection,
  onFilterSectionChange,
  onRefresh,
  onClear,
  loading,
}) => {
  return (
    <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
      <div className="relative w-full max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-2.5 text-slate-400 z-10"
        />
        <Input
          placeholder="Search students..."
          className="pl-9"
          value={searchTerm || ""}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        {/* <Select
          placeholder="All Classes"
          className="w-32"
          options={ACADEMIC_CLASSES.map((cls) => ({ value: cls, label: cls }))}
          value={filterClass || ""}
          onChange={onFilterClassChange}
        />
        <Select
          placeholder="All Sections"
          className="w-32"
          options={ACADEMIC_SECTIONS.map((sec) => ({ value: sec, label: sec }))}
          value={filterSection || ""}
          onChange={onFilterSectionChange}
        />
        {(filterClass || filterSection || searchTerm) && (
          <Button
            variant="ghost"
            className="px-2 text-slate-500 hover:text-red-600"
            onClick={onClear}
            title="Clear Filters"
          >
            <X size={16} />
          </Button>
        )} */}
        <Button
          variant="ghost"
          className="px-3"
          onClick={onRefresh}
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>
    </div>
  );
};
