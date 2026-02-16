import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  Pencil,
  Phone,
  Search,
  Star,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { EntityPageHeader } from "../components/EntityPageHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  useStaff,
  useStaffActions,
} from "../hooks/owner/useStaff";
import type { OwnerStaff } from "../types/owner";

interface StaffPageProps {
  activeBranchId: string | null;
  onOpenDetails?: (staffId: string) => void;
}

const INITIAL_FORM = {
  name: "",
  role: "",
  email: "",
  phone: "",
  notes: "",
  isActive: true,
  compensation: {
    monthlySalary: 0,
    commissionPercent: 0,
  },
};

export default function Staff({ activeBranchId, onOpenDetails }: StaffPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [selectedStaff, setSelectedStaff] = useState<OwnerStaff | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const limit = 8;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeBranchId]);

  const { data, isLoading } = useStaff({
    branchId: activeBranchId,
    search: debouncedSearch,
    page,
    limit,
  });
  const staff = data?.items ?? [];
  const pagination = data?.pagination;

  const { create, update, updateStatus, remove } = useStaffActions(
    activeBranchId
  );

  const isMutating =
    create.isPending || update.isPending || updateStatus.isPending || remove.isPending;

  const openCreateModal = () => {
    setSelectedStaff(null);
    setFormState(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const openEditModal = (member: OwnerStaff) => {
    setSelectedStaff(member);
    setFormState({
      name: member.name || "",
      role: member.role || "",
      email: member.email || "",
      phone: member.phone || "",
      notes: member.notes || "",
      isActive: member.isActive ?? member.status !== "off",
      compensation: {
        monthlySalary: member.compensation?.monthlySalary ?? 0,
        commissionPercent: member.compensation?.commissionPercent ?? 0,
      },
    });
    setIsFormOpen(true);
  };

  const openViewModal = (member: OwnerStaff) => {
    setSelectedStaff(member);
    setIsViewOpen(true);
  };

  const openDetailsPage = (member: OwnerStaff) => {
    if (onOpenDetails) {
      onOpenDetails(member._id);
      return;
    }
    openViewModal(member);
  };

  const handleSubmit = async () => {
    if (!formState.name) {
      toast.error("Name is required");
      return;
    }
    try {
      if (selectedStaff) {
        await update.mutateAsync({
          id: selectedStaff._id,
          data: formState,
        });
        toast.success("Staff updated");
      } else {
        await create.mutateAsync({
          ...formState,
          branchId: activeBranchId || undefined,
        });
        toast.success("Staff created");
      }
      setIsFormOpen(false);
    } catch (error: any) {
      if (error?.statusCode === 403 && error?.code === "PLAN_LIMIT_EXCEEDED") {
        const limit =
          typeof error?.meta?.limit === "number" ? error.meta.limit : null;
        const baseMessage =
          limit !== null
            ? `Your current plan allows up to ${limit} staff members. Upgrade your plan or purchase an add-on to add more.`
            : error?.message || "Unable to save staff member";
        const secondary =
          limit !== null && error?.meta?.upgradeHint
            ? "Add extra staff for ₹99"
            : null;
        toast.error(secondary ? `${baseMessage}\n${secondary}` : baseMessage);
        return;
      }
      toast.error(error?.message || "Unable to save staff member");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Staff removed");
    } catch (error: any) {
      toast.error(error?.message || "Unable to remove staff member");
    }
  };

  const handleToggle = async (member: OwnerStaff, value: boolean) => {
    try {
      await updateStatus.mutateAsync({ id: member._id, isActive: value });
      toast.success(`Staff ${value ? "enabled" : "disabled"}`);
    } catch (error: any) {
      toast.error(error?.message || "Unable to update status");
    }
  };

  const summary = useMemo(() => {
    const total = pagination?.total ?? staff.length;
    const active = staff.filter((member) => member.isActive !== false).length;
    const inactive = total - active;
    const avgRating =
      total > 0
        ? staff.reduce(
            (sum, member) => sum + (Number(member.rating) || 0),
            0
          ) / total
        : 0;
    return { total, active, inactive, avgRating: avgRating.toFixed(1) };
  }, [staff, pagination?.total]);

  if (!activeBranchId) {
    return (
      <EmptyState
        title="Select a branch"
        description="Choose a branch to manage its staff."
      />
    );
  }

  return (
    <div className="space-y-6">
      <EntityPageHeader
      title="Staff Management"
      description="Search, create, and manage staff for the selected branch."
      onCreate={openCreateModal}
      createLabel="Add Staff"
      isCreateDisabled={!activeBranchId}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Members
                </p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.total}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.active}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Inactive</p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.inactive}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Avg. Rating</p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.avgRating}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10 bg-input-background border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 py-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          title="No staff yet"
          description="Add your first team member to get started."
          actionLabel="Add staff"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => (
            <Card key={member._id} onDoubleClick={() => openViewModal(member)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{member.name}</CardTitle>
                <Badge variant={member.isActive ? "default" : "secondary"}>
                  {member.role || "Team"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {member.phone || "—"}
                </div>
                <div>Rating: {member.rating ?? "—"}</div>
                <div>Notes: {member.notes || "—"}</div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={member.isActive !== false}
                    onCheckedChange={(value) => handleToggle(member, value)}
                    disabled={updateStatus.isPending}
                  />
                  <span className="text-xs text-muted-foreground">
                    {member.isActive !== false ? "Active" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openDetailsPage(member)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditModal(member)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDialog
                    title="Remove staff"
                    description="This will hide the staff member from this branch."
                    onConfirm={() => handleDelete(member._id)}
                    trigger={
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    disabled={remove.isPending}
                  />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff ? "Edit Staff" : "Add Staff"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {selectedStaff
                ? "Update staff member details."
                : "Enter staff member details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={formState.role}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    role: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formState.phone}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Salary</Label>
              <Input
                type="number"
                min={0}
                value={formState.compensation.monthlySalary}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    compensation: {
                      ...prev.compensation,
                      monthlySalary: Number(event.target.value),
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Commission</Label>
              <Select
                value={String(formState.compensation.commissionPercent)}
                onValueChange={(value) =>
                  setFormState((prev) => ({
                    ...prev,
                    compensation: {
                      ...prev.compensation,
                      commissionPercent: Number(value),
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select commission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formState.notes}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isMutating}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStaff?.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Review staff member details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Role: {selectedStaff?.role || "—"}</div>
            <div>Email: {selectedStaff?.email || "—"}</div>
            <div>Phone: {selectedStaff?.phone || "—"}</div>
            <div>Notes: {selectedStaff?.notes || "—"}</div>
            <div>
              Monthly Salary:{" "}
              {selectedStaff?.compensation?.monthlySalary ?? 0}
            </div>
            <div>
              Commission:{" "}
              {selectedStaff?.compensation?.commissionPercent ?? 0}%
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
