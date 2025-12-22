const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const {
  listAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointment,
  deleteAppointment,
} = require("../services/appointments.service");
const { extractBranchIdFromRequest } = require("../utils/branchContext");

const appointmentsController = {
  list: asyncHandler(async (req, res) => {
    const { results, pagination } = await listAppointments({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req),
      from: req.query.from,
      to: req.query.to,
      search: req.query.search,
      status: req.query.status,
      pagination: { page: req.query.page, limit: req.query.limit },
    });
    const response = ApiResponse.paginated(
      { appointments: results },
      pagination
    );
    return res.status(200).json(response);
  }),

  create: asyncHandler(async (req, res) => {
    const appointment = await createAppointment({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      userId: req.user.id,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { appointment }, "Appointment created"));
  }),

  update: asyncHandler(async (req, res) => {
    const appointment = await updateAppointment({
      tenantId: req.user.tenant,
      appointmentId: req.params.id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { appointment }, "Appointment updated"));
  }),

  cancel: asyncHandler(async (req, res) => {
    const appointment = await cancelAppointment({
      tenantId: req.user.tenant,
      appointmentId: req.params.id,
      reason: req.body.reason,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { appointment }, "Appointment cancelled"));
  }),

  detail: asyncHandler(async (req, res) => {
    const appointment = await getAppointment({
      tenantId: req.user.tenant,
      appointmentId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { appointment }, "Appointment fetched"));
  }),

  remove: asyncHandler(async (req, res) => {
    await deleteAppointment({
      tenantId: req.user.tenant,
      appointmentId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Appointment removed"));
  }),
};

module.exports = appointmentsController;
