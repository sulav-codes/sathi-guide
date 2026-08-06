"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api";
import { Users, UserCheck, CalendarDays, DollarSign } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [kpiData, chartData] = await Promise.all([
          apiClient.getDashboardKpis(),
          apiClient.getDashboardCharts()
        ]);
        setKpis(kpiData);
        setCharts(chartData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: kpis?.totalUsers || 0, icon: Users, color: "text-tint", bg: "bg-tint/10" },
    { title: "Active Guides", value: kpis?.activeGuides || 0, icon: UserCheck, color: "text-green", bg: "bg-green/10" },
    { title: "Total Bookings", value: kpis?.totalBookings || 0, icon: CalendarDays, color: "text-orange", bg: "bg-orange/10" },
    { title: "Total Revenue", value: `$${kpis?.totalRevenue || 0}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  ];

  const COLORS = ['#1A73E8', '#2DBE6C', '#F5820A', '#FE6D00'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text">Overview</h1>
        <p className="text-text-secondary mt-1">Monitor your platform's key performance indicators.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">{stat.title}</p>
                <h3 className="text-3xl font-bold text-text mt-2">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Revenue */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-text mb-6">Revenue Over Time</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.revenueOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-text mb-6">User Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.userGuideRatio || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.userGuideRatio || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="lg:col-span-3 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-text mb-6">Bookings Volume</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.bookingsOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  cursor={{ fill: 'var(--inactive-card)' }}
                />
                <Bar dataKey="value" fill="var(--green)" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
