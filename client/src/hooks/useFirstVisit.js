import { useState, useEffect } from "react";

export const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstVisit = () => {
      try {
        const hasVisited = localStorage.getItem("hasVisitedSFashion");
        const visitCount = localStorage.getItem("sfashionVisitCount") || "0";

        if (!hasVisited || parseInt(visitCount) === 0) {
          setIsFirstVisit(true);
          localStorage.setItem("sfashionVisitCount", "1");
        } else {
          const currentCount = parseInt(visitCount) + 1;
          localStorage.setItem("sfashionVisitCount", currentCount.toString());
        }
      } catch (error) {
        console.error("Error checking first visit:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstVisit();
  }, []);

  const markAsVisited = () => {
    localStorage.setItem("hasVisitedSFashion", "true");
    setIsFirstVisit(false);
  };

  const resetFirstVisit = () => {
    localStorage.removeItem("hasVisitedSFashion");
    localStorage.removeItem("sfashionVisitCount");
    setIsFirstVisit(true);
  };

  return { isFirstVisit, isLoading, markAsVisited, resetFirstVisit };
};
