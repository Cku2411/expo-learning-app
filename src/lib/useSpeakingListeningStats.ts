import { useEffect, useState } from "react";
import { getWeeklyStats } from "./speakingListeningStats";

interface WeeklyStats {
  minutesSpoken: number;
  minutesListened: number;
  weeklyChange: {
    spoken: number;
    listened: number;
  };
}
export const useSpeakingListeningStats = () => {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const weeklyStats = await getWeeklyStats();
      setStats(weeklyStats);
    } catch (error) {
      console.error("Faild to load speaking stats: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { stats, loading, refresh };
};
