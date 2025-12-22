const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const {
  listClients,
  createClient,
  updateClient,
  getClientHistory,
  getClient,
  deleteClient,
} = require("../services/clients.service");
const { extractBranchIdFromRequest } = require("../utils/branchContext");

const clientsController = {
  list: asyncHandler(async (req, res) => {
    const { results, pagination } = await listClients({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search,
      pagination: { page: req.query.page, limit: req.query.limit },
    });
    const response = ApiResponse.paginated(
      { clients: results },
      pagination
    );
    return res.status(200).json(response);
  }),

  create: asyncHandler(async (req, res) => {
    const client = await createClient({
      tenantId: req.user.tenant,
      userId: req.user.id,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { client }, "Client created"));
  }),

  update: asyncHandler(async (req, res) => {
    const client = await updateClient({
      tenantId: req.user.tenant,
      clientId: req.params.id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { client }, "Client updated"));
  }),

  detail: asyncHandler(async (req, res) => {
    const client = await getClient({
      tenantId: req.user.tenant,
      clientId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { client }, "Client fetched"));
  }),

  history: asyncHandler(async (req, res) => {
    const history = await getClientHistory({
      tenantId: req.user.tenant,
      clientId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { history }, "Client history fetched"));
  }),

  remove: asyncHandler(async (req, res) => {
    await deleteClient({
      tenantId: req.user.tenant,
      clientId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Client deleted"));
  }),
};

module.exports = clientsController;
