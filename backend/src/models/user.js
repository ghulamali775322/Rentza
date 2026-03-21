import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // email is required and must be unique
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // emailVerified stays default false; set true for google signups or after verification
    emailVerified: { type: Boolean, default: false },

    // passwordHash is OPTIONAL because google users will not have a password.
    // Still keep the field so email users store a bcrypt hash here.
    passwordHash: { type: String, default: null },

    // phone is OPTIONAL (google may not provide it). You can require it later in profile completion.
    phone: { type: String, default: null },

    // Path to profile image stored locally during development
    profilePhotoPath: { type: String, default: null },

    // googleId is OPTIONAL and must be unique when present.
    googleId: { type: String, unique: true, sparse: true },

    // role
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: { type: Boolean, default: true },

    // used when user signs up with email
    verificationToken: {
      type: String,
      default: null,
    },

    // used when user requests password reset
    resetPasswordToken: {
      type: String,
      default: null,
    },

    // expiry time for password reset token
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Remove passwordHash from responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;
