import { useEffect, useState } from "react";
import { publicApi } from "../../lib/api";

/** Today's Daily Musings poster (and the days before it) from CMS → Quote of the day. null until loaded / when none. */
export function useDailyQuote() {
  const [data, setData] = useState({ today: null, recent: [] });

  useEffect(() => {
    let live = true;
    publicApi
      .dailyQuote()
      .then((d) => live && d?.today && setData({ today: d.today, recent: d.recent ?? [d.today] }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return data;
}

export const quoteDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
