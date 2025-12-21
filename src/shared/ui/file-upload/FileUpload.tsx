import React, { useState } from "react";
import { UploadCloud, FileText } from "lucide-react";

export const FileUpload: React.FC<{
  onFileSelect: (file: File) => void;
  label?: string;
  accept?: string;
  templateName?: string;
  templateContent?: string;
}> = ({
  onFileSelect,
  label = "Upload File",
  accept = ".csv,.xlsx",
  templateName,
  templateContent,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      onFileSelect(e.target.files[0]);
    }
  };

  const downloadTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (templateContent) {
      const blob = new Blob([templateContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${templateName || "template"}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      alert(`Downloading ${templateName || "template.csv"}...`);
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none text-slate-900">
          {label}
        </label>
      )}
      <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer group bg-white">
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFile}
        />
        <div className="flex flex-col items-center justify-center pointer-events-none space-y-3">
          <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
            <UploadCloud size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-900">
              {fileName ? fileName : "Click or drag to upload"}
            </h3>
            <p className="text-xs text-slate-500">
              {fileName
                ? "File selected"
                : `Support for ${accept.replace(/\./g, "").toUpperCase()}`}
            </p>
          </div>
        </div>
      </div>

      {templateName && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={downloadTemplate}
            className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            <FileText size={12} />
            Download {templateName} Template
          </button>
        </div>
      )}
    </div>
  );
};
