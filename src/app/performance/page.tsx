"use client";

import { useState, useEffect } from "react";
import {
  format,
  subWeeks,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subDays,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
} from "recharts";
import {
  Users,
  CreditCard,
  ImageIcon,
  Music,
  Video,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

type PerformanceData = {
  week: string;
  signUps: number;
  credits: number;
  images: number;
  songs: number;
  videos: number;
};

const COLORS = {
  primary: "#4F46E5", // Indigo
  secondary: "#7C3AED", // Violet
  success: "#059669", // Emerald
  warning: "#D97706", // Amber
  danger: "#DC2626", // Red
  info: "#0284C7", // Sky
  images: "#0891B2", // Cyan
  songs: "#7C3AED", // Violet
  videos: "#DB2777", // Pink
};

export default function EnhancedAnalyticsDashboard() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<
    "signUps" | "credits" | "media"
  >("signUps");
  const [viewType, setViewType] = useState<"bar" | "line" | "area">("bar");
  const [dateRange, setDateRange] = useState({
    from: subWeeks(new Date(), 12),
    to: new Date(),
  });

  // Add function to calculate weeks difference
  const calculateWeeksDifference = (from: Date, to: Date) => {
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.round(diffDays / 7);
  };

  // Add state for selected weeks
  const [selectedWeeks, setSelectedWeeks] = useState("12");

  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange.from || !dateRange.to) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
        });

        const response = await fetch(`/api/performance?${params}`);
        if (!response.ok) throw new Error("Failed to fetch performance data");

        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error("Error fetching performance data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const chartData = data.map((item) => ({
    ...item,
    week: format(
      new Date(item.week.split(" - ")[0] || item.week.replace("Week of ", "")),
      "MMM d"
    ),
    totalMedia: item.images + item.songs + item.videos,
  }));

  // Calculate metrics
  const totalSignUps = data.reduce((sum, item) => sum + item.signUps, 0);
  const totalCredits = data.reduce((sum, item) => sum + item.credits, 0);
  const totalImages = data.reduce((sum, item) => sum + item.images, 0);
  const totalSongs = data.reduce((sum, item) => sum + item.songs, 0);
  const totalVideos = data.reduce((sum, item) => sum + item.videos, 0);

  // Calculate growth rates
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const currentWeekData = data[data.length - 1] || {
    signUps: 0,
    credits: 0,
    images: 0,
    songs: 0,
    videos: 0,
  };
  const previousWeekData = data[data.length - 2] || {
    signUps: 0,
    credits: 0,
    images: 0,
    songs: 0,
    videos: 0,
  };

  const signUpGrowth = calculateGrowth(
    currentWeekData.signUps,
    previousWeekData.signUps
  );
  const creditGrowth = calculateGrowth(
    currentWeekData.credits,
    previousWeekData.credits
  );
  const mediaGrowth = calculateGrowth(
    currentWeekData.images + currentWeekData.songs + currentWeekData.videos,
    previousWeekData.images + previousWeekData.songs + previousWeekData.videos
  );

  // Pie chart data
  const pieData = [
    { name: "Images", value: totalImages, color: COLORS.images },
    { name: "Songs", value: totalSongs, color: COLORS.songs },
    { name: "Videos", value: totalVideos, color: COLORS.videos },
  ];

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    growth,
    color,
    suffix = "",
  }: {
    title: string;
    value: number;
    icon: any;
    growth: number;
    color: string;
    suffix?: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-900/30 dark:to-${color}-800/30`}
        >
          <Icon className={`w-6 h-6 text-white`} />
        </div>
        <div className="flex items-center space-x-1">
          {growth > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : growth < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : null}
          <span
            className={`text-sm font-medium ${
              growth > 0
                ? "text-green-500"
                : growth < 0
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            {growth > 0 ? "+" : ""}
            {growth.toFixed(1)}%
          </span>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {title}
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString()}
          {suffix}
        </p>
      </div>
    </div>
  );

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (viewType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <XAxis
                dataKey="week"
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
              />
              {selectedMetric === "signUps" && (
                <Line
                  type="monotone"
                  dataKey="signUps"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: COLORS.primary, strokeWidth: 2 }}
                />
              )}
              {selectedMetric === "credits" && (
                <Line
                  type="monotone"
                  dataKey="credits"
                  stroke={COLORS.success}
                  strokeWidth={3}
                  dot={{ fill: COLORS.success, strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: COLORS.success, strokeWidth: 2 }}
                />
              )}
              {selectedMetric === "media" && (
                <>
                  <Line
                    type="monotone"
                    dataKey="images"
                    stroke={COLORS.images}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="songs"
                    stroke={COLORS.songs}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="videos"
                    stroke={COLORS.videos}
                    strokeWidth={2}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <XAxis
                dataKey="week"
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
              />
              {selectedMetric === "signUps" && (
                <Area
                  type="monotone"
                  dataKey="signUps"
                  stroke={COLORS.primary}
                  fill={`${COLORS.primary}20`}
                  strokeWidth={2}
                />
              )}
              {selectedMetric === "credits" && (
                <Area
                  type="monotone"
                  dataKey="credits"
                  stroke={COLORS.success}
                  fill={`${COLORS.success}20`}
                  strokeWidth={2}
                />
              )}
              {selectedMetric === "media" && (
                <Area
                  type="monotone"
                  dataKey="totalMedia"
                  stroke={COLORS.secondary}
                  fill={`${COLORS.secondary}20`}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <XAxis
                dataKey="week"
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
              />
              {selectedMetric === "signUps" && (
                <Bar
                  dataKey="signUps"
                  fill={COLORS.primary}
                  radius={[8, 8, 0, 0]}
                />
              )}
              {selectedMetric === "credits" && (
                <Bar
                  dataKey="credits"
                  fill={COLORS.success}
                  radius={[8, 8, 0, 0]}
                />
              )}
              {selectedMetric === "media" && (
                <>
                  <Bar
                    dataKey="images"
                    stackId="media"
                    fill={COLORS.images}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="songs" stackId="media" fill={COLORS.songs} />
                  <Bar
                    dataKey="videos"
                    stackId="media"
                    fill={COLORS.videos}
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Custom DatePicker Styles */}
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: auto;
        }
        .react-datepicker__input-container input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          background: white;
          color: #374151;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .react-datepicker__input-container input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .dark .react-datepicker__input-container input {
          background: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }
        .dark .react-datepicker__input-container input:focus {
          border-color: #6366f1;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent dark:from-primary-400 dark:via-secondary-400 dark:to-primary-400">
                Analytics Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {dateRange?.from &&
                  dateRange?.to &&
                  `${format(dateRange.from, "MMM d, yyyy")} - ${format(
                    dateRange.to,
                    "MMM d, yyyy"
                  )}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Custom Date Range Picker */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <Calendar className="w-5 h-5 text-white" />
                <div className="flex items-center gap-2">
                  <DatePicker
                    selected={dateRange.from}
                    onChange={(date) => {
                      if (date) {
                        setDateRange((prev) => ({ ...prev, from: date }));
                        // Update selected weeks based on new date range
                        const weeks = calculateWeeksDifference(
                          date,
                          dateRange.to
                        );
                        if ([4, 8, 12, 24].includes(weeks)) {
                          setSelectedWeeks(weeks.toString());
                        } else {
                          setSelectedWeeks("");
                        }
                      }
                    }}
                    selectsStart
                    startDate={dateRange.from}
                    endDate={dateRange.to}
                    maxDate={dateRange.to}
                    placeholderText="Start date"
                    dateFormat="MMM d, yyyy"
                    className="w-32"
                  />
                  <span className="text-gray-400">to</span>
                  <DatePicker
                    selected={dateRange.to}
                    onChange={(date) => {
                      if (date) {
                        setDateRange((prev) => ({ ...prev, to: date }));
                        // Update selected weeks based on new date range
                        const weeks = calculateWeeksDifference(
                          dateRange.from,
                          date
                        );
                        if ([4, 8, 12, 24].includes(weeks)) {
                          setSelectedWeeks(weeks.toString());
                        } else {
                          setSelectedWeeks("");
                        }
                      }
                    }}
                    selectsEnd
                    startDate={dateRange.from}
                    endDate={dateRange.to}
                    minDate={dateRange.from}
                    maxDate={new Date()}
                    placeholderText="End date"
                    dateFormat="MMM d, yyyy"
                    className="w-32"
                  />
                </div>
              </div>

              {/* Quick Range Selector */}
              <select
                value={selectedWeeks}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                onChange={(e) => {
                  const weeks = parseInt(e.target.value);
                  setSelectedWeeks(e.target.value);
                  setDateRange({
                    from: subWeeks(new Date(), weeks),
                    to: new Date(),
                  });
                }}
              >
                <option value="4">Last 4 weeks</option>
                <option value="8">Last 8 weeks</option>
                <option value="12">Last 12 weeks</option>
                <option value="24">Last 6 months</option>
              </select>

              {/* Export Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Beta Sign-ups"
            value={totalSignUps}
            icon={Users}
            growth={signUpGrowth}
            color="primary"
          />
          <MetricCard
            title="Credits Purchased"
            value={totalCredits}
            icon={CreditCard}
            growth={creditGrowth}
            color="success"
          />
          <MetricCard
            title="Total Media Generated"
            value={totalImages + totalSongs + totalVideos}
            icon={Activity}
            growth={mediaGrowth}
            color="secondary"
          />
        </div>

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              {/* Chart Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Performance Overview
                </h2>

                <div className="flex items-center gap-2">
                  {/* Metric Selector - Improved contrast */}
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as any)}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="signUps">Sign-ups</option>
                    <option value="credits">Credits</option>
                    <option value="media">Media Generation</option>
                  </select>

                  {/* View Type Selector */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewType("bar")}
                      className={`p-2 rounded-md transition-colors ${
                        viewType === "bar"
                          ? "bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-primary-400"
                          : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewType("line")}
                      className={`p-2 rounded-md transition-colors ${
                        viewType === "line"
                          ? "bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-primary-400"
                          : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewType("area")}
                      className={`p-2 rounded-md transition-colors ${
                        viewType === "area"
                          ? "bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-primary-400"
                          : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <PieChartIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-96">{renderChart()}</div>
            </div>
          </div>

          {/* Media Distribution Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Media Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {item.name}: {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Weekly Performance
            </h2>
            <div className="space-y-4">
              {chartData.slice(-4).map((week, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {week.week}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {week.signUps} sign-ups • {week.credits} credits •{" "}
                      {week.totalMedia} media
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Quick Stats
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Most Popular Media Type
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalImages >= totalSongs && totalImages >= totalVideos
                    ? "Images"
                    : totalSongs >= totalVideos
                    ? "Songs"
                    : "Videos"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Peak Sign-up Week
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {chartData.reduce(
                    (max, week) => (week.signUps > max.signUps ? week : max),
                    chartData[0]
                  )?.week || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Total Active Weeks
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {data.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Avg. Weekly Sign-ups
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {data.length > 0 ? Math.round(totalSignUps / data.length) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
