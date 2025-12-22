import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, Clock, Eye, Pencil, Trash2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { EntityPageHeader } from "../components/EntityPageHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  useAppointments,
  useAppointmentActions,
} from "../hooks/owner/useAppointments";
import {
  useStaff as useStaffOptions,
} from "../hooks/owner/useStaff";
import {
  useServices as useServiceOptions,
} from "../hooks/owner/useServices";
import {
  useClients as useClientOptions,
} from "../hooks/owner/useClients";
import type { OwnerAppointment, OwnerService, OwnerStaff, OwnerClient } from "../types/owner";

interface AppointmentsPageProps {
  activeBranchId: string | null;
}

const DEFAULT_FORM = {
  clientId: "",
  staffId: "",
  serviceIds: [] as string[],
  startAt: new Date().toISOString().slice(0, 16),
  notes: "",
  status: "confirmed",
};

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

export default function Appointments({ activeBranchId }: AppointmentsPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState(DEFAULT_FORM);
  const [selectedAppointment, setSelectedAppointment] = useState<OwnerAppointment | null>(null);
  const [pendingServiceId, setPendingServiceId] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const limit = 6;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, activeBranchId]);

  const { data, isLoading } = useAppointments({
    branchId: activeBranchId,
    search: debouncedSearch,
    status: statusFilter,
    page,
    limit,
  });
  const appointments = data?.items ?? [];
  const pagination = data?.pagination;

  const { data: staffOptions } = useStaffOptions({
    branchId: activeBranchId,
    page: 1,
    limit: 100,
  });
  const { data: serviceOptions } = useServiceOptions({
    branchId: activeBranchId,
    page: 1,
    limit: 100,
  });
  const { data: clientOptions } = useClientOptions({
    branchId: activeBranchId,
    page: 1,
    limit: 100,
  });

  const { create, update, remove, cancel } = useAppointmentActions(
    activeBranchId
  );
  const isMutating = create.isPending || update.isPending || remove.isPending;

  const openCreateModal = () => {
    setSelectedAppointment(null);
    setFormState({
      ...DEFAULT_FORM,
      startAt: new Date().toISOString().slice(0, 16),
    });
    setIsFormOpen(true);
  };

  const openEditModal = (appointment: OwnerAppointment) => {
    setSelectedAppointment(appointment);
    setFormState({
      clientId: typeof appointment.client === "string" ? appointment.client : appointment.client?._id || "",
      staffId: typeof appointment.staff === "string" ? appointment.staff : appointment.staff?._id || "",
      serviceIds: appointment.services?.map((service) =>
        typeof service.service === "string" ? service.service : service.service?._id
      ).filter(Boolean) || [],
      startAt: appointment.startAt?.slice(0, 16),
      notes: appointment.notes || "",
      status: appointment.status || "pending",
    });
    setIsFormOpen(true);
  };

  const openViewModal = (appointment: OwnerAppointment) => {
    setSelectedAppointment(appointment);
    setIsViewOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.clientId || !formState.staffId || formState.serviceIds.length === 0) {
      toast.error("Client, staff, and at least one service are required");
      return;
    }
    try {
      if (selectedAppointment) {
        await update.mutateAsync({
          id: selectedAppointment._id,
          data: formState,
        });
        toast.success("Appointment updated");
      } else {
        await create.mutateAsync({
          ...formState,
          branchId: activeBranchId || undefined,
        });
        toast.success("Appointment created");
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Unable to save appointment");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Appointment deleted");
    } catch (error: any) {
      toast.error(error?.message || "Unable to delete appointment");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancel.mutateAsync({ id });
      toast.success("Appointment cancelled");
    } catch (error: any) {
      toast.error(error?.message || "Unable to cancel appointment");
    }
  };

  const handleAddService = () => {
    if (!pendingServiceId) {
      return;
    }
    setFormState((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(pendingServiceId)
        ? prev.serviceIds
        : [...prev.serviceIds, pendingServiceId],
    }));
    setPendingServiceId("");
  };

  const removeService = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.filter((serviceId) => serviceId !== id),
    }));
  };

  const serviceLookup = useMemo(() => {
    const services = serviceOptions?.items ?? [];
    return services.reduce<Record<string, OwnerService>>((acc, service) => {
      acc[service._id] = service;
      return acc;
    }, {});
  }, [serviceOptions]);

  const staffLookup = useMemo(() => {
    const staff = staffOptions?.items ?? [];
    return staff.reduce<Record<string, OwnerStaff>>((acc, member) => {
      acc[member._id] = member;
      return acc;
    }, {});
  }, [staffOptions]);

  const clientLookup = useMemo(() => {
    const clients = clientOptions?.items ?? [];
    return clients.reduce<Record<string, OwnerClient>>((acc, client) => {
      acc[client._id] = client;
      return acc;
    }, {});
  }, [clientOptions]);

  if (!activeBranchId) {
    return (
      <EmptyState
        title="Select a branch"
        description="Choose a branch to manage appointments."
      />
    );
  }

  return (
    <div className="space-y-6">
      <EntityPageHeader
        title="Appointments"
        description="Review bookings for the selected branch."
        searchValue={search}
        onSearchChange={setSearch}
        onCreate={openCreateModal}
        createLabel="Create Appointment"
        isCreateDisabled={!activeBranchId}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-sm">Status</Label>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 py-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="Create an appointment to get started."
          actionLabel="Create appointment"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((appointment) => {
            const client =
              typeof appointment.client === "string"
                ? clientLookup[appointment.client]
                : appointment.client;
            const staff =
              typeof appointment.staff === "string"
                ? staffLookup[appointment.staff]
                : appointment.staff;
            return (
              <Card key={appointment._id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>{client?.fullName || "Client"}</CardTitle>
                  <Badge>{appointment.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(appointment.startAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {Math.round(appointment.duration ?? 0)} mins
                  </div>
                  <div>
                    Staff: <span className="text-foreground">{staff?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {appointment.services?.map((service) => (
                      <Badge key={service.name} variant="secondary">
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-end gap-2">
                  {appointment.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(appointment._id)}
                      disabled={cancel.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openViewModal(appointment)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditModal(appointment)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDialog
                    title="Delete appointment"
                    description="This booking will be removed from the schedule."
                    onConfirm={() => handleDelete(appointment._id)}
                    trigger={
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    disabled={remove.isPending}
                  />
                </CardFooter>
              </Card>
            );
          })}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? "Edit Appointment" : "New Appointment"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={formState.clientId}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, clientId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {(clientOptions?.items ?? []).map((client) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Staff</Label>
              <Select
                value={formState.staffId}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, staffId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {(staffOptions?.items ?? []).map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start time</Label>
                <Input
                  type="datetime-local"
                  value={formState.startAt}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      startAt: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Services</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={pendingServiceId}
                  onValueChange={setPendingServiceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {(serviceOptions?.items ?? []).map((service) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={handleAddService}
                  disabled={!pendingServiceId}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formState.serviceIds.map((id) => (
                  <Badge key={id} variant="secondary" className="gap-1">
                    {serviceLookup[id]?.name || "Service"}
                    <button
                      type="button"
                      className="ml-1 text-xs"
                      onClick={() => removeService(id)}
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
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
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              Client:{" "}
              {selectedAppointment?.client &&
                (typeof selectedAppointment.client === "string"
                  ? clientLookup[selectedAppointment.client]?.fullName
                  : selectedAppointment.client.fullName)}
            </div>
            <div>
              Staff:{" "}
              {selectedAppointment?.staff &&
                (typeof selectedAppointment.staff === "string"
                  ? staffLookup[selectedAppointment.staff]?.name
                  : selectedAppointment.staff.name)}
            </div>
            <div>
              When:{" "}
              {selectedAppointment
                ? new Date(selectedAppointment.startAt).toLocaleString()
                : "—"}
            </div>
            <div>
              Services:{" "}
              {selectedAppointment?.services?.map((service) => service.name).join(", ") ||
                "—"}
            </div>
            <div>Status: {selectedAppointment?.status}</div>
            <div>Notes: {selectedAppointment?.notes || "—"}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
