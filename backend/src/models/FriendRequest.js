import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      //Gửi lời nhắn kèm lời mời
      type: String,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  },
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true }); //Đảm bảo cặp from-to là duy nhất. Vd: 1 người gửi lời mời 2 lần
friendRequestSchema.index({ from: 1 }); // truy vấn nhanh tất cả lời mời kết bạn đã gửi
friendRequestSchema.index({ to: 1 }); //truy vấn nhanh tất cả lời mời kết bạn đã nhận

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
