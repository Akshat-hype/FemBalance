import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CircularProgress } from "./CircularProgress";
import axios from "axios";
import Navbar from "./Navbar";
import {
  CalendarDays,
  HeartPulse,
  Sparkles,
  Droplets,
  Activity,
} from "lucide-react";

export default function Homepage() {
  const [userData, setUserData] = useState(null);
  const [riskPercent, setRiskPercent] = useState(null);
  const [dailyUpdateAvailable, setDailyUpdateAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [cycleData, setCycleData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/home", { method: "GET", credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          window.location.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => data?.success && setUserData(data))
      .catch((err) => console.error("Error fetching user data:", err))
      .finally(() => setLoading(false));
  }, []);

  const fetchCycleStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch("http://localhost:5000/home/cycle-status", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setCycleData(data);
    } catch (err) {
      console.error("Error fetching cycle status:", err);
    } finally {
      setChecking(false);
    }
  };

  const handleResetCycle = async () => {
    if (!window.confirm("Reset your cycle?")) return;
    setResetting(true);
    try {
      const res = await fetch("http://localhost:5000/home/cycle-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ periodStarted: true }),
      });
      const data = await res.json();
      alert(data.message || "Cycle reset successfully!");
      await fetchCycleStatus();
    } catch (err) {
      console.error("Error resetting cycle:", err);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    if (!userData) return;
    fetch("http://localhost:5000/pcos/latest-data", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 404) {
          setDailyUpdateAvailable(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        axios
          .post(
            "http://127.0.0.1:5000/predict",
            {
              How_was_your_flowing: data.flowing,
              Any_Spotting_or_irregular_spotting: data.spotting,
              What_is_your_pain_level: data.pain_level,
              How_was_your_sleep_quality: data.sleep_quality,
              How_you_feel_about_your_skin: data.skin,
              How_you_feel_about_your_hair: data.hair,
              Your_cycle_last_upto: data.lastsUpto || 5,
              Number_of_days_of_menstrual_cycle: userData.totalDays || 28,
            },
            { withCredentials: true }
          )
          .then((res) =>
            setRiskPercent(Math.round(res.data.pcod_pcos_chance_percent))
          )
          .catch((err) => console.error("Prediction failed:", err));
      })
      .catch(() => setDailyUpdateAvailable(false));
  }, [userData]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[url(/base2.jpg)] bg-cover bg-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-800 font-semibold mt-4">Loading your data...</p>
      </div>
    );

  if (!userData?.totalDays || !userData?.lastDate)
    return (
      <div className="text-center mt-10 text-lg md:text-xl font-semibold text-red-600 px-4">
        Missing cycle data. Please update your profile.
      </div>
    );

  const totalDays = userData.totalDays;
  const lastDate = new Date(userData.lastDate);
  const today = new Date();
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, totalDays - diffDays);
  const percent = Math.min(100, ((totalDays - daysLeft) / totalDays) * 100);
  const nextDate = new Date(
    lastDate.getTime() + totalDays * 24 * 60 * 60 * 1000
  ).toDateString();

  return (
    <div className="bg-[url(/base2.jpg)] bg-cover bg-center min-h-screen py-6 pb-20 md:py-10">
      <Navbar />
      <div className="max-w-[85%] mx-auto mt-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10">
          {/* LEFT SECTION */}
          <div className="xl:col-span-2 flex flex-col gap-6 md:gap-8">
            {/* Overview Header */}
            <div className="bg-white/70 p-5 md:p-6 rounded-3xl backdrop-blur-xl shadow-lg border border-white/30 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Hi, {userData?.name?.split(" ")[0] || "User"} 👋
                </h2>
                <p className="text-gray-700 mt-1 text-sm md:text-base">
                  Here’s your current menstrual health summary.
                </p>
              </div>
              <Link to="/calendar/updates">
                <button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 md:px-6 py-2 rounded-full font-medium shadow-md hover:scale-105 transition">
                  Add Today’s Update ✍️
                </button>
              </Link>
            </div>

            {/* Circular Tracker */}
            <div className="bg-gradient-to-br from-white/70 to-white/40 rounded-3xl p-6 md:p-10 shadow-xl border border-white/30 backdrop-blur-lg relative overflow-hidden">
              <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-violet-300/30 via-indigo-400/20 to-transparent blur-3xl rounded-full animate-pulse top-0 right-0" />
              <div className="flex flex-col items-center relative z-10">
                <div className="relative mb-4">
                  <CircularProgress value={percent} size={180} strokeWidth={14} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-5xl md:text-6xl font-bold text-violet-800">
                      {daysLeft}
                    </p>
                    <p className="text-gray-700 font-medium text-sm md:text-base">
                      Days Left
                    </p>
                  </div>
                </div>
                <div className="w-4/5 h-[2px] bg-gradient-to-r from-indigo-400 via-violet-600 to-pink-400 rounded-full my-3" />
                <p className="text-xs md:text-sm text-gray-800 text-center px-4">
                  {percent < 33
                    ? "🌸 Early phase — gentle and relaxed days ahead."
                    : percent < 66
                    ? "🌿 Mid-cycle — energy & balance are high."
                    : "🩵 Late phase — time for rest & hydration."}
                </p>
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-3 gap-4 mt-6 md:mt-8 text-center">
                <MiniCard
                  icon={<CalendarDays />}
                  label="Last Period"
                  value={lastDate.toLocaleDateString()}
                />
                <MiniCard
                  icon={<HeartPulse />}
                  label="Cycle Length"
                  value={`${totalDays} days`}
                />
                <MiniCard icon={<Sparkles />} label="Next Expected" value={nextDate} />
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Risk Analysis */}
            <div className="bg-gradient-to-br from-white/70 to-white/40 rounded-3xl p-6 shadow-lg backdrop-blur-lg border border-white/30">
              <h3 className="text-lg md:text-xl font-semibold mb-3 text-gray-900">
                Health Risk Analysis
              </h3>
              {!dailyUpdateAvailable ? (
                <p className="text-center text-red-600 font-medium text-sm md:text-base">
                  Submit today’s update to view PCOD/PCOS risk.
                </p>
              ) : riskPercent !== null ? (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-800 font-semibold text-sm md:text-base">
                      Risk Level
                    </p>
                    <p className="text-2xl font-bold text-violet-700">
                      {riskPercent}%
                    </p>
                  </div>
                  <div className="w-full h-4 bg-white rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${
                        riskPercent < 35
                          ? "bg-green-500"
                          : riskPercent < 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      } transition-all duration-700`}
                      style={{ width: `${riskPercent}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-700">
                    {riskPercent < 35
                      ? "Low risk — keep maintaining healthy habits."
                      : riskPercent < 70
                      ? "Moderate risk — monitor lifestyle and rest."
                      : "High risk — please consult your doctor soon."}
                  </p>
                </>
              ) : (
                <p className="text-center text-gray-700">Loading analysis...</p>
              )}
            </div>

            {/* Cycle Management */}
            <div className="bg-white/70 p-5 rounded-3xl shadow-lg backdrop-blur-lg border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Cycle Management
              </h3>
              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-3">
                <Button
                  onClick={fetchCycleStatus}
                  loading={checking}
                  text="🔄 Check Cycle Status"
                />
                <Button
                  onClick={handleResetCycle}
                  loading={resetting}
                  text="♻ Reset Cycle"
                  color="pink"
                />
              </div>

              {cycleData && (
                <div className="text-center text-gray-800 text-sm">
                  {cycleData.status === "upcoming" && (
                    <p>
                      Next cycle expected in{" "}
                      <span className="font-semibold text-indigo-600">
                        {cycleData.daysRemaining}
                      </span>{" "}
                      days.
                    </p>
                  )}
                  {cycleData.status === "expected_today" && (
                    <p className="text-pink-600 font-medium">
                      🌸 Period expected today! Confirm when it begins.
                    </p>
                  )}
                  {cycleData.status === "delayed" && (
                    <p className="text-red-600 font-medium">
                      ⚠ Period delayed by {cycleData.daysDelayed} day(s).
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Daily Wellness */}
            <div className="bg-white/70 p-5 rounded-3xl shadow-lg backdrop-blur-lg border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Daily Wellness
              </h3>
              <div className="space-y-3 text-gray-700 text-sm">
                <Tip
                  icon={<Droplets className="text-violet-600" />}
                  text="Stay hydrated — aim for 2L water today."
                />
                <Tip
                  icon={<Activity className="text-violet-600" />}
                  text="Gentle stretching or yoga boosts circulation."
                />
                <Tip
                  icon={<Sparkles className="text-violet-600" />}
                  text="Eat more fruits, greens, and whole grains."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Components */
const MiniCard = ({ icon, label, value }) => (
  <div className="bg-white/50 rounded-2xl p-3 md:p-4 shadow-sm hover:scale-105 transition">
    <div className="flex justify-center text-violet-700 mb-1">{icon}</div>
    <p className="text-xs text-gray-600">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

const Tip = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-sm">
    {icon}
    <span>{text}</span>
  </div>
);

const Button = ({ onClick, loading, text, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-500 hover:bg-indigo-600",
    pink: "bg-pink-500 hover:bg-pink-600",
    violet: "bg-violet-500 hover:bg-violet-600",
    blue: "bg-blue-500 hover:bg-blue-600"
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${colorClasses[color]} text-white font-medium py-2 px-5 rounded-full shadow-md hover:scale-105 transition ${
        loading && "opacity-70 cursor-not-allowed"
      }`}
    >
      {loading ? (
        <span className="flex items-center gap-2 justify-center">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Loading...
        </span>
      ) : (
        text
      )}
    </button>
  );
};
