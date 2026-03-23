import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";
import crypto from "crypto";
import { sendMail } from "../utils/sendMail.js";

// export const testApi = async (req,res) =>{
//   try{
//     return res.sendStatus(200);
//   }
//   catch(error){
//     console.error(error)
//   }
// }
const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; //14 ngày;
// const REFRESH_TOKEN_TTL = 30 * 1000; //14 ngày;

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Username hoặc password sai" });
    }

    // const comparePassword = await bcrypt.compare(password, user.hashedPassword)
    const comparePassword = await user.isCorrectPasswords(password);
    if (!comparePassword) {
      return res.status(401).json({ message: "Username hoặc password sai" });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    res.status(200).json({ message: `Đăng nhập thành công`, accessToken });
  } catch (error) {
    console.error("Lỗi signIn: ", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      //return mã lỗi 400: thiếu đầu vào
      console.log(req.body);

      return res.status(400).json({
        message: "Không thể thiếu dữ liệu đầu vào",
      });
    }

    const checkDuplicate = await User.findOne({ username });

    if (checkDuplicate) {
      //trả về mã lỗi 409: user đã tồn tại
      return res.status(409).json({ message: "Người dùng đã tồn tại" });
    }

    const newUser = await User.create({
      username,
      hashedPassword: password,
      email,
      displayName: `${lastName} ${firstName}`,
    });

    if (!newUser) {
      return res.status(409).json({ message: "Đăng ký thất bại" });
    }

    //chỉ return
    return res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    //log lỗi dưới server, gửi thông báo Lỗi hệ thống về client: status(500)
    console.error("Lỗi signUp: ", error);
    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const signOut = async (req, res) => {
  try {
    //lấy refreshToken từ cookie
    const token = req.cookies?.refreshToken;
    if (token) {
      //clear refreshToken trong Session
      await Session.deleteOne({ refreshToken: token });
      //clear refreshToken trong cookie
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    //log lỗi dưới server, gửi thông báo Lỗi hệ thống về client: status(500)
    console.error("Lỗi signOut: ", error);
    res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy refreshToken trong cookies" });
    }

    const session = await Session.findOne({
      refreshToken: token,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    return res
      .status(200)
      .json({ message: "Tạo mới accessToken thành công ", accessToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(401)
        .json({ message: "Vui lòng bổ sung Email trước khi thực hiện" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: `Không tìm thấy người dùng với email ${email}` });
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save();

    const resetLink = `${process.env.ENVIROMENT === "production" ? process.env.CLIENT_URL : "http://localhost:5001"}/api/auth/reset-password?token=${resetToken}`;

    const rs = await sendMail({
      to: user.email,
      subject: "Reset mật khẩu",
      html: `
        <p>Bạn vừa yêu cầu reset mật khẩu</p>
        <p>Link có hiệu lực trong vòng 10 phút từ lúc bắt đầu gửi yêu cầu</p>
        <a href="${resetLink}">Click here to continue</a>
      `,
    });

    return res.status(200).json({
      resetToken,
      rs,
    });
    //
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;
    if (!password) {
      return res.status(401).json({ message: "Chưa có password" });
    }

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token" });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const userReset = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!userReset) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const comparePassword = await userReset.isCorrectPasswords(password);
    if (comparePassword) {
      return res
        .status(401)
        .json({ message: "Mật khẩu mới vừa nhập trùng với mật khẩu cũ" });
    }

    userReset.hashedPassword = password;
    userReset.resetPasswordToken = undefined;

    await userReset.save();

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
