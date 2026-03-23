import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.startsWith('Bearer') && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Không tìm thấy access token" });
    }

    jwt.verify(token, process.env.ACCESS_SECRET_KEY, async (err, decodeUser) => {
        if(err){
            console.error(err);
            return res.status(403).json({message:"Token hết hạn hoặc không đúng"})
        }

        const user = await User.findById(decodeUser.userId).select('-hashedPassword');

        if(!user)
        {
            return res.status(404).json({message:"Không tìm thấy người dùng"})
        }
        req.user = user;
        next();
    });
  } catch (error) {
    console.error("Lỗi xác minh JWT authMiddleware: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
