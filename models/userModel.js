import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [
        validator.isEmail,
        "Please provide a valid email",
      ],
    },
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [
        8,
        "Password must be at least 8 characters long",
      ],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide your phone number"],
      unique: true,
      validate: [
        validator.isMobilePhone,
        "Please provide a valid phone number",
      ],
    },
    address: [
      {
        addressLine1: String,
        addressLine2: String,
        city: String,
        zipCode: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ? PRE-MIDDLEWARE: runs before .save() and .create()

// HASHING PASSWORD
userSchema.pre("save", async function (next) {
  // if password is not modified, then skip this middleware
  if (!this.isModified("password")) return next();

  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete confirmPassword field
  this.confirmPassword = undefined;

  next();
});

// ? INSTANCE METHODS

// COMPARING PASSWORDS
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

const userModal = mongoose.model("User", userSchema);

export default userModal;
