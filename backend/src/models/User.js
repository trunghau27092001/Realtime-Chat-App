import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avataUrl: {
      type: String, //link cdn hình ảnh
    },
    avataId: {
      type: String, //Cloudinary public_id để xóa hình
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    phone: {
      type: String,
      sparse: true, //Cho phép trống, nếu có thì không được trùng
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  // if (!this.isModified("hashedPassword"))
  // {
  //   return
  // }

  // this.hashedPassword = await bcrypt.hash(this.hashedPassword, 10);

  if (this.isModified("hashedPassword")) {
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, 10);
  }

  // 🔑 RESET PASSWORD TOKEN → auto expire 10 phút
  if (this.isModified("resetPasswordToken")) {
    if (this.resetPasswordToken) {
      this.resetPasswordExpiresAt = Date.now() + 15 * 60 * 1000;
    } else this.resetPasswordExpiresAt = undefined;
  }
});

userSchema.methods = {
  isCorrectPasswords: async function (password) {
    return await bcrypt.compare(password, this.hashedPassword);
  },
  generateResetPasswordToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.resetPasswordToken = hashedResetToken;
    return resetToken;
  },
};

const User = mongoose.model("User", userSchema);

export default User;
