import { useEffect } from "react";

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `EduSync - ${title}`;
    return () => {
      document.title = "EduSync - School Management";
    };
  }, [title]);
};
