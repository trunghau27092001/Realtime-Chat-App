import mongoose from "mongoose";

const participantsSchema = new mongoose.Schema(
  {
    //Mô tả thông tin cơ bản người dùng trong cuộc trò chuyện
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    joinedAt: {
      //Thời điểm user tham gia hội thoại
      type: Date,
      default: Date.now(),
    },
  },
  {
    _id: false, //mongoose sẽ không tạo id riêng, đây là chỉ schema phụ nên không cần id
  },
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      //tên nhóm
      type: String,
      trim: true,
    },
    createdBy: {
      //Người tạo
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false, //mongoose sẽ không tạo id riêng, đây là chỉ schema phụ nên không cần id
  },
);

const lastMessageSchema = new mongoose.Schema(
  {
    _id: {
      //_id của tin nhắn gốc
      type: String,
    },
    content: {
      type: String,
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      //loại hội thoại
      type: String,
      enum: ["direct", "group"], //cuộc hội thoại chỉ có giữa 2 người hoặc là chat nhóm
      required: true,
    },
    participants: {
      type: [participantsSchema], //danh sách người tham gia cuộc hội thoại
      required: true,
    },
    group: {
      //Thông tin group của cuộc hội thoại này
      type: groupSchema,
    },
    lastMessageAt: {
      //Tin nhắn cuối cùng vào lúc nào
      type: Date,
    },
    lastMessage: {
      //Tin nhắn cuối cùng là gì
      type: lastMessageSchema,
      default: null,
    },
    seenBy: [
      //Cái này là một mảng những người đã xem tin nhắn
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    unreadCounts: {
      type: Map, //dùng map để lưu số tin nhắn chưa đọc của từng user trong cuộc hội thoại đó
      //Ví dụ group gồm A, B, C --> A gửi tin nhắn, thì B 1 tin, C 1 tin,
      //NHẤN MẠNH LẠI LÀ TRONG CÙNG 1 CUỘC HỘI THOẠI
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

//compound index
conversationSchema.index({
  "participant.userId": 1, //Tạo ra 1 bảng tra cứu nhanh trong đó dữ liệu được sắp xếp theo người
  // tham gia và trong mỗi người các cuộc hội thoại có tin nhắn gần nhất sẽ hiển thị lên
  lastMessageAt: -1,
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
