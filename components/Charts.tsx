"use client";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export function RadarBlock({ data, name, avgName }: { data: { name: string; value: number; avg: number }[]; name: string; avgName: string }) {
  return (
    <div style={{ height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="62%">
          <PolarGrid stroke="var(--line)" />
          <PolarAngleAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
          <Radar isAnimationActive={false} name={avgName} dataKey="avg" stroke="var(--warn)" fill="var(--warn)" fillOpacity={0.12} strokeDasharray="4 3" />
          <Radar isAnimationActive={false} name={name} dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.35} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineBlock({ data }: { data: { label: string; value: number }[] }) {
  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -10, right: 10, top: 10 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 6 }} />
          <Line isAnimationActive={false} type="monotone" dataKey="value" name="Баллы" stroke="var(--accent)" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
