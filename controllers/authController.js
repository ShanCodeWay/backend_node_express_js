import { promisify } from "util";
import jwt from "jsonwebtoken";

import userModal from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// SEND JWT TOKEN
const createSendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure:
      process.env.NODE_ENV?.trim() === "production"
        ? true
        : false,
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
  });
};
//REGISTER USER
export const register = catchAsync(
  async (req, res, next) => {
    const {
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
    } = req.body;

    const newUser = await userModal.create({
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
    });

    createSendToken(newUser, 201, res);
  }
);

// LOGIN USER
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password)
    return next(
      new AppError("Please provide email and password", 400)
    );

  // 2) Check if user exists && password is correct
  const user = await userModal
    .findOne({
      email,
    })
    .select("+password");

  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  )
    return next(
      new AppError("Incorrect email or password", 401)
    );

  // 3) If everything is ok, send token to client
  createSendToken(user, 200, res);
});

// PROTECT ROUTES
export const protectedRoute = catchAsync(
  async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return next(
        new AppError(
          "You are not logged in! Please log in to get access",
          401
        )
      );

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // 3) Check if user still exists
    const currentUser = await userModal.findById(
      decoded.id
    );
    if (!currentUser)
      return next(
        new AppError(
          "The user belonging to this token does no longer exist",
          401
        )
      );

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  }
);
