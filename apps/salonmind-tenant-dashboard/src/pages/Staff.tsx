import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Phone, Trash2 } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Skeleton } from "../components/ui/skeleton";
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
}

const INITIAL_FORM = {
  name: "",
  role: "",
  email: "",
  phone: "",
  notes: "",
  isActive: true,
};

export default function Staff({ activeBranchId }: StaffPageProps) {
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
    });
    setIsFormOpen(true);
  };

  const openViewModal = (member: OwnerStaff) => {
    setSelectedStaff(member);
    setIsViewOpen(true);
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
    const total = staff.length;
    const active = staff.filter((member) => member.isActive !== false).length;
    const avgRating =
      total > 0
        ? staff.reduce(
            (sum, member) => sum + (Number(member.rating) || 0),
            0
          ) / total
        : 0;
    return { total, active, avgRating: avgRating.toFixed(1) };
  }, [staff]);

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
      searchValue={search}
      onSearchChange={setSearch}
      onCreate={openCreateModal}
      createLabel="Add Staff"
      isCreateDisabled={!activeBranchId}
      />

      <Card>
        <CardContent className="grid gap-4 py-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Total Members</p>
            <p className="text-2xl font-semibold">{summary.total}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-semibold">{summary.active}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg. Rating</p>
            <p className="text-2xl font-semibold">{summary.avgRating}</p>
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
            <Card key={member._id}>
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
                    onClick={() => openViewModal(member)}
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
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Role: {selectedStaff?.role || "—"}</div>
            <div>Email: {selectedStaff?.email || "—"}</div>
            <div>Phone: {selectedStaff?.phone || "—"}</div>
            <div>Notes: {selectedStaff?.notes || "—"}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
