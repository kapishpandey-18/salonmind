const TenantAppointmentRecord = require("../../../models/TenantAppointmentRecord");
const TenantClientProfile = require("../../../models/TenantClientProfile");
const TenantStaff = require("../../../models/TenantStaff");
const { resolveBranchContext } = require("../utils/branchContext");

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const toAmount = (appointment) =>
  Number(appointment.totalAmount || appointment.price || 0);

function getDateRange(days) {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthRange(months) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - (months - 1));
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function buildMonthlyBuckets(months = 6) {
  const buckets = [];
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - (months - 1));

  for (let i = 0; i < months; i += 1) {
    const date = new Date(start);
    date.setMonth(start.getMonth() + i);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: MONTH_LABELS[date.getMonth()],
      revenue: 0,
      expenses: 0,
      profit: 0,
      appointments: 0,
    });
  }
  return buckets;
}

function buildWeeklyBuckets() {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    scheduled: 0,
    completed: 0,
  }));
}

function buildDailyBuckets() {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    revenue: 0,
  }));
}

async function getRevenueSummary({ tenantId, branchId }) {
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: true,
  });

  const { start: monthStart } = getMonthRange(6);
  const { start: weekStart, end: weekEnd } = getDateRange(7);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [monthlyAppointments, weeklyAppointments, todayAppointments] =
    await Promise.all([
      TenantAppointmentRecord.find({
        tenant: tenantId,
        branch: branch._id,
        isDeleted: false,
        startAt: { $gte: monthStart },
      }).select(
        "startAt status totalAmount price staffNameSnapshot staff paymentMethod"
      ),
      TenantAppointmentRecord.find({
        tenant: tenantId,
        branch: branch._id,
        isDeleted: false,
        startAt: { $gte: weekStart, $lte: weekEnd },
      }).select("startAt status totalAmount price"),
      TenantAppointmentRecord.find({
        tenant: tenantId,
        branch: branch._id,
        isDeleted: false,
        startAt: { $gte: todayStart, $lte: todayEnd },
      }).select(
        "startAt status totalAmount price clientNameSnapshot serviceNameSnapshot staffNameSnapshot"
      ),
    ]);

  const monthlyBuckets = buildMonthlyBuckets(6);
  const monthlyMap = new Map(
    monthlyBuckets.map((bucket) => [bucket.key, bucket])
  );
  monthlyAppointments.forEach((appointment) => {
    const date = new Date(appointment.startAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = monthlyMap.get(key);
    if (!bucket) {
      return;
    }
    bucket.revenue += toAmount(appointment);
    bucket.appointments += 1;
  });
  monthlyBuckets.forEach((bucket) => {
    bucket.expenses = 0;
    bucket.profit = bucket.revenue;
  });

  const weeklyBuckets = buildWeeklyBuckets();
  const weeklyMap = new Map(weeklyBuckets.map((bucket) => [bucket.day, bucket]));
  weeklyAppointments.forEach((appointment) => {
    const day = DAY_LABELS[new Date(appointment.startAt).getDay()];
    const bucket = weeklyMap.get(day);
    if (!bucket) {
      return;
    }
    bucket.scheduled += 1;
    if (appointment.status === "completed") {
      bucket.completed += 1;
    }
  });

  const dailyBuckets = buildDailyBuckets();
  const dailyMap = new Map(dailyBuckets.map((bucket) => [bucket.day, bucket]));
  weeklyAppointments.forEach((appointment) => {
    const day = DAY_LABELS[new Date(appointment.startAt).getDay()];
    const bucket = dailyMap.get(day);
    if (!bucket) {
      return;
    }
    bucket.revenue += toAmount(appointment);
  });

  const todayRevenue = todayAppointments.reduce(
    (sum, appointment) => sum + toAmount(appointment),
    0
  );
  const pendingAppointments = todayAppointments.filter(
    (appointment) => appointment.status === "pending"
  ).length;
  const confirmedAppointments = todayAppointments.filter(
    (appointment) => appointment.status === "confirmed"
  ).length;

  const upcomingAppointments = todayAppointments
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 5)
    .map((appointment) => ({
      id: appointment._id.toString(),
      client: appointment.clientNameSnapshot || "Client",
      service: appointment.serviceNameSnapshot || "Service",
      time: new Date(appointment.startAt).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      }),
      stylist: appointment.staffNameSnapshot || "Staff",
    }));

  const activeClients = await TenantClientProfile.countDocuments({
    tenant: tenantId,
    isDeleted: false,
    isActive: true,
  });

  const staff = await TenantStaff.find({
    tenant: tenantId,
    isDeleted: false,
  }).select("rating reviews");
  const ratingStats = staff.reduce(
    (acc, member) => {
      acc.total += Number(member.rating) || 0;
      acc.count += member.rating ? 1 : 0;
      acc.reviews += Number(member.reviews) || 0;
      return acc;
    },
    { total: 0, count: 0, reviews: 0 }
  );
  const avgRating =
    ratingStats.count > 0
      ? Number((ratingStats.total / ratingStats.count).toFixed(1))
      : 0;

  const totalRevenue = monthlyBuckets.reduce(
    (sum, bucket) => sum + bucket.revenue,
    0
  );
  const totalAppointments = monthlyBuckets.reduce(
    (sum, bucket) => sum + bucket.appointments,
    0
  );
  const avgTicket =
    totalAppointments > 0
      ? Math.round(totalRevenue / totalAppointments)
      : 0;
  const pendingPayments = pendingAppointments;
  const outstanding = todayAppointments
    .filter((appointment) => appointment.status === "pending")
    .reduce((sum, appointment) => sum + toAmount(appointment), 0);

  const staffTotals = new Map();
  monthlyAppointments.forEach((appointment) => {
    const staffKey =
      appointment.staff?.toString() || appointment.staffNameSnapshot || "Staff";
    const existing = staffTotals.get(staffKey) || {
      name: appointment.staffNameSnapshot || "Staff",
      revenue: 0,
      appointments: 0,
    };
    existing.revenue += toAmount(appointment);
    existing.appointments += 1;
    staffTotals.set(staffKey, existing);
  });
  const topStaff = Array.from(staffTotals.values())
    .map((staffEntry) => ({
      name: staffEntry.name,
      revenue: Math.round(staffEntry.revenue),
      appointments: staffEntry.appointments,
      avgTicket:
        staffEntry.appointments > 0
          ? Math.round(staffEntry.revenue / staffEntry.appointments)
          : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  const paymentTotals = {
    cash: 0,
    card: 0,
    wallet: 0,
  };
  monthlyAppointments.forEach((appointment) => {
    const amount = toAmount(appointment);
    const method = (appointment.paymentMethod || "").toLowerCase();
    if (method === "card") {
      paymentTotals.card += amount;
    } else if (method === "cash") {
      paymentTotals.cash += amount;
    } else if (method === "upi" || method === "wallet" || method === "other") {
      paymentTotals.wallet += amount;
    } else {
      paymentTotals.cash += amount;
    }
  });

  return {
    summary: {
      totalRevenue,
      netProfit: totalRevenue,
      avgTicket,
      outstanding,
      pendingPayments,
    },
    monthlyRevenue: monthlyBuckets,
    dailyRevenue: dailyBuckets,
    appointmentData: weeklyBuckets,
    overviewStats: {
      todayRevenue,
      appointmentsToday: todayAppointments.length,
      pendingAppointments,
      confirmedAppointments,
      activeClients,
      avgRating,
      reviewCount: ratingStats.reviews,
    },
    upcomingAppointments,
    paymentMethods: [
      {
        method: "Credit Card",
        amount: Math.round(paymentTotals.card),
        percentage:
          totalRevenue > 0
            ? Math.round((paymentTotals.card / totalRevenue) * 100)
            : 0,
      },
      {
        method: "Cash",
        amount: Math.round(paymentTotals.cash),
        percentage:
          totalRevenue > 0
            ? Math.round((paymentTotals.cash / totalRevenue) * 100)
            : 0,
      },
      {
        method: "Digital Wallet",
        amount: Math.round(paymentTotals.wallet),
        percentage:
          totalRevenue > 0
            ? Math.round((paymentTotals.wallet / totalRevenue) * 100)
            : 0,
      },
    ],
    topStaff,
  };
}

module.exports = {
  getRevenueSummary,
};
