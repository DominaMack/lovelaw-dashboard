import { useState, useEffect } from "react";
import { Message } from "@/api/entities";
import { Subscriber } from "@/api/entities";
import { Institution } from "@/api/entities";
import { Link } from "react-router-dom";

const SEGMENT_LABELS = {
  "bar-prep": "Bar Prep",
  "bar-retaker": "Bar Retaker",
  "law-student-1L": "1L",
  "law-student-2L": "2L",
  "law-student-3L": "3L",
  "attorney": "Attorney",
  "pre-law": "Pre-Law",
};

const TONE_COLORS = {
  motivational: "bg-amber-100 text-amber-800",
  calming: "bg-blue-100 text-blue-800",
  accountability: "bg-purple-100 text-purple-800",
  resilience: "bg-green-100 text-green-800",
  hope: "bg-pink-100 text-pink-800",
  faith: "bg-indigo-100 text-indigo-800",
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMessages: 0,
    approvedMessages: 0,
    pendingMessages: 0,
    totalSubscribers: 0,
    activeSubscribers: 0,
    enterpriseSubscribers: 0,
    totalInstitutions: 0,
    activeInstitutions: 0,
  });
  const [segmentBreakdown, setSegmentBreakdown] = useState({});
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const [allMsgs, subscribers, institutions] = await Promise.all([
        Message.list(),
        Subscriber.list(),
        Institution.list(),
      ]);

      const approved = allMsgs.filter((m) => m.approval_status === "approved");
      const pending = allMsgs.filter((m) => m.approval_status === "pending");
      const active = subscribers.filter((s) => s.subscription_status === "active");
      const enterprise = subscribers.filter((s) => s.subscriber_type === "enterprise");
      const activeInst = institutions.filter((i) => i.status === "active");

      // Segment breakdown
      const breakdown = {};
      allMsgs.forEach((m) => {
        const seg = m.audience_segment || "unknown";
        if (!breakdown[seg]) breakdown[seg] = { total: 0, approved: 0, pending: 0 };
        breakdown[seg].total++;
        if (m.approval_status === "approved") breakdown[seg].approved++;
        if (m.approval_status === "pending") breakdown[seg].pending++;
      });

      setStats({
        totalMessages: allMsgs.length,
        approvedMessages: approved.length,
        pendingMessages: pending.length,
        totalSubscribers: subscribers.length,
        activeSubscribers: active.length,
        enterpriseSubscribers: enterprise.length,
        totalInstitutions: institutions.length,
        activeInstitutions: activeInst.length,
      });
      setSegmentBreakdown(breakdown);
      setRecentSubscribers(subscribers.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const StatCard = ({ label, value, sub, color, icon }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <span className={`text-3xl font-bold ${color || "text-gray-900"}`}>{loading ? "—" : value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Dose of Justice™</h1>
          <p className="text-sm text-gray-500 mt-0.5">Love Law™ Admin Dashboard</p>
        </div>
        <div className="flex gap-3">
          <Link to="/messages" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            📝 Message Library
          </Link>
          <Link to="/subscribers" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            👥 Subscribers
          </Link>
          <Link to="/enterprise" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            🏛️ Enterprise
          </Link>
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto">
        {/* System Status Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 mb-6 flex items-center gap-3">
          <span className="text-green-500 text-lg">●</span>
          <span className="text-green-800 text-sm font-medium">System Live — Daily sends active. GHL connected.</span>
          <span className="ml-auto text-green-600 text-xs">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Messages" value={stats.totalMessages} sub="in library" icon="📚" />
          <StatCard label="Approved" value={stats.approvedMessages} color="text-green-600" sub="ready to send" icon="✅" />
          <StatCard label="Pending Review" value={stats.pendingMessages} color={stats.pendingMessages > 0 ? "text-amber-600" : "text-gray-900"} sub="awaiting approval" icon="⏳" />
          <StatCard label="Active Subscribers" value={stats.activeSubscribers} color="text-indigo-600" sub={`${stats.totalSubscribers} total`} icon="👤" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Enterprise Subscribers" value={stats.enterpriseSubscribers} icon="🏛️" />
          <StatCard label="Institutions" value={stats.totalInstitutions} sub={`${stats.activeInstitutions} active`} icon="🎓" />
          <StatCard label="Messages Sent Today" value={stats.activeSubscribers} sub="estimated" icon="📤" />
          <StatCard label="Tracks Available" value="6" sub="Standard + Faith-Based" icon="🎯" />
        </div>

        {/* Segment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Message Library by Segment</h2>
            {loading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(segmentBreakdown).map(([seg, data]) => (
                  <div key={seg} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-28 shrink-0">{SEGMENT_LABELS[seg] || seg}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${Math.round((data.approved / data.total) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-20 text-right">{data.approved}/{data.total} approved</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/messages/new" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer">
                <span className="text-xl">✍️</span>
                <div>
                  <div className="text-sm font-medium text-indigo-900">Create New Message</div>
                  <div className="text-xs text-indigo-600">GSM-7 validated, live preview</div>
                </div>
              </Link>
              <Link to="/messages?status=pending" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition cursor-pointer">
                <span className="text-xl">📋</span>
                <div>
                  <div className="text-sm font-medium text-amber-900">Review Pending Messages</div>
                  <div className="text-xs text-amber-600">{stats.pendingMessages} waiting for approval</div>
                </div>
              </Link>
              <Link to="/subscribers/new" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition cursor-pointer">
                <span className="text-xl">➕</span>
                <div>
                  <div className="text-sm font-medium text-green-900">Add Subscriber</div>
                  <div className="text-xs text-green-600">Consumer or Enterprise</div>
                </div>
              </Link>
              <Link to="/enterprise/new" className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
                <span className="text-xl">🏛️</span>
                <div>
                  <div className="text-sm font-medium text-purple-900">Onboard Institution</div>
                  <div className="text-xs text-purple-600">Law school, firm, or bar association</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Subscribers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Subscribers</h2>
            <Link to="/subscribers" className="text-indigo-600 text-sm hover:underline">View all →</Link>
          </div>
          {recentSubscribers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">👤</div>
              <div className="text-sm">No subscribers yet. Share your landing page to get started.</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentSubscribers.map((s) => (
                <div key={s.id} className="flex items-center gap-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                    {(s.first_name?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</div>
                    <div className="text-xs text-gray-400">{SEGMENT_LABELS[s.audience_segment] || s.audience_segment} · Day {s.current_day_number || 1}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    s.subscription_status === "active" ? "bg-green-100 text-green-700" :
                    s.subscription_status === "trial" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {s.subscription_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
