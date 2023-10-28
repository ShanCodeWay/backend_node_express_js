import userModal from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";

// GET ALL USERS
export const getAllUsers = catchAsync(
  async (req, res, next) => {
    const users = await userModal.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  }
);

// GET USER BY ID
export const getUserById = catchAsync(
  async (req, res, next) => {
    const user = await userModal.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

// ADD A ADDRESS
export const addAddress = catchAsync(
  async (req, res, next) => {
    const { addressLine1, addressLine2, city, zipCode } =
      req.body;

    const userId = req.user.id;
    if (!userId)
      return next(
        new AppError(
          "You are not logged in, Please log in",
          400
        )
      );

    if (!addressLine1 || !city || !zipCode)
      return next(
        new AppError("Please provide all the details", 400)
      );

    const user = await userModal.findById(req.user.id);

    if (!user)
      return next(new AppError("User not found", 404));

    // CHECK ADDRESS LIMIT= 5
    if (user.address.length >= 5)
      return next(
        new AppError(
          "You can add maximum of 5 addresses. Please delete an address to add a new one",
          400
        )
      );

    user.address.push({
      addressLine1,
      addressLine2,
      city,
      zipCode,
    });

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

// UPDATE ADDRESS
export const updateAddress = catchAsync(
  async (req, res, next) => {
    const {
      updateAddressIndex,
      addressLine1,
      addressLine2,
      city,
      zipCode,
    } = req.body;

    if (
      !updateAddressIndex ||
      !addressLine1 ||
      !city ||
      !zipCode
    )
      return next(
        new AppError("Please provide all the details", 400)
      );

    const user = await userModal.findById(req.user.id);

    if (!user)
      return next(new AppError("User not found", 404));

    if (!user.address[updateAddressIndex])
      return next(new AppError("Address not found", 404));

    // CHECK WHETHER ADDRESS IS THE SAME
    if (
      user.address[updateAddressIndex].addressLine1 ===
        addressLine1 &&
      user.address[updateAddressIndex].addressLine2 ===
        addressLine2 &&
      user.address[updateAddressIndex].city === city &&
      user.address[updateAddressIndex].zipCode === zipCode
    )
      return next(
        new AppError(
          "Address is the same. Can not Update",
          400
        )
      );

    user.address[updateAddressIndex].addressLine1 =
      addressLine1;
    user.address[updateAddressIndex].addressLine2 =
      addressLine2;
    user.address[updateAddressIndex].city = city;
    user.address[updateAddressIndex].zipCode = zipCode;
  }
);

// DELETE ADDRESS
export const deleteAddress = catchAsync(
  async (req, res, next) => {
    const { deleteAddressIndex } = req.body;

    if (!deleteAddressIndex)
      return next(
        new AppError("Address Index is required", 400)
      );

    const user = await userModal.findById(req.user.id);

    if (!user)
      return next(new AppError("User not found", 404));

    if (!user.address[deleteAddressIndex])
      return next(new AppError("Address not found", 404));

    user.address.splice(deleteAddressIndex, 1);

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);
