const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const {
  saveProfile,
  saveBusinessHoursStep,
  saveServicesStep,
  saveStaffStep,
  initiateCheckout,
  confirmPayment,
} = require("../services/onboarding.service");

const onboardingController = {
  saveProfile: asyncHandler(async (req, res) => {
    await saveProfile({ userId: req.user.id, payload: req.body });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Profile saved"));
  }),

  saveBusinessHours: asyncHandler(async (req, res) => {
    await saveBusinessHoursStep({
      userId: req.user.id,
      businessHours: req.body.businessHours,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Business hours saved"));
  }),

  saveServices: asyncHandler(async (req, res) => {
    await saveServicesStep({
      userId: req.user.id,
      services: req.body.services,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Services saved"));
  }),

  saveStaff: asyncHandler(async (req, res) => {
    await saveStaffStep({
      userId: req.user.id,
      staff: req.body.staff,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Staff saved"));
  }),

  checkout: asyncHandler(async (req, res) => {
    const data = await initiateCheckout({
      userId: req.user.id,
      planCode: req.body.planCode,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Checkout initiated"));
  }),

  confirm: asyncHandler(async (req, res) => {
    const data = await confirmPayment({
      userId: req.user.id,
      orderId: req.body.orderId,
      paymentId: req.body.paymentId,
      signature: req.body.signature,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Onboarding completed"));
  }),
};

module.exports = onboardingController;
