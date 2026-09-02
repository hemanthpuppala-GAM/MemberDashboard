import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import Card from "./Card";

export default function StatCard({ icon: Icon, label, value, trend, spark, to }) {
  const positive = trend != null && trend >= 0;
  const content = (
    <Card
      className={`relative overflow-hidden ${
        to ? "transition-colors hover:border-[var(--a-accent)] hover:bg-[var(--a-accent-muted)]" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--a-accent-muted)] text-[var(--a-accent)]">
          <Icon size={18} strokeWidth={2.25} />
        </div>
        {trend != null && (
          <span
            className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${
              positive ? "text-[var(--a-success)]" : "text-[var(--a-danger)]"
            }`}
          >
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3 text-[26px] font-bold tracking-tight text-[var(--a-text-primary)]">{value}</div>
      <div className="mt-0.5 text-[12.5px] text-[var(--a-text-muted)]">{label}</div>
      {spark && spark.length > 1 && (
        <div className="pointer-events-none absolute right-0 bottom-0 h-12 w-24 opacity-70">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark.map((v) => ({ v }))}>
              <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--a-accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--a-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="var(--a-accent)" strokeWidth={1.75} fill="url(#sparkFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );

  return to ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
