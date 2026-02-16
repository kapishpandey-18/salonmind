import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { EmptyState } from "../components/EmptyState";
import { useStaffDetail } from "../hooks/owner/useStaff";

interface StaffDetailsProps {
  staffId: string | null;
}

const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString();
};

export default function StaffDetails({ staffId }: StaffDetailsProps) {
  const { data: staff, isLoading } = useStaffDetail(staffId);

  if (!staffId) {
    return (
      <EmptyState
        title="Select a staff member"
        description="Choose a staff member to view details."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 py-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!staff) {
    return (
      <EmptyState
        title="Staff member not found"
        description="The selected staff record is unavailable."
      />
    );
  }

  const isActive = staff.isActive !== false && staff.status !== "off";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-foreground">{staff.name}</h2>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Staff profile, performance, and compensation details.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Role: {staff.role || "-"}</div>
            <div>Email: {staff.email || "-"}</div>
            <div>Phone: {staff.phone || "-"}</div>
            <div>Specialties: {staff.specialties?.join(", ") || "-"}</div>
            <div>Joining Date: {formatDate(staff.joiningDate)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Rating: {staff.rating ?? "-"}</div>
            <div>Reviews: {staff.reviews ?? "-"}</div>
            <div>Appointments Today: {staff.appointmentsToday ?? "-"}</div>
            <div>Appointments This Week: {staff.appointmentsWeek ?? "-"}</div>
            <div>Availability: {staff.availability ?? "-"}%</div>
            <div>Revenue: {staff.revenue ?? "-"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>
              Monthly Salary: {staff.compensation?.monthlySalary ?? 0}
            </div>
            <div>
              Commission: {staff.compensation?.commissionPercent ?? 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {staff.notes || "-"}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
