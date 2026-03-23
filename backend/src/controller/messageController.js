import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { updateConversationAfterCreatedMessage } from "../utils/messageHelper.js";

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body;
    //recipientId: id người nhận
    //content: nội dung
    //conversationId: id cuộc hội thoại

    const senderId = req.user._id;
    //senderId: id người gửi

    let conversation;
    //tạo biến cuộc hội thoại (lưu thông tin cuộc hội thoại)

    if (!content) {
      res.status(400).json({ message: "Nội dung rỗng" });
      //Check nội dung gửi
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      //check xem cuộc hội thoại trong database đã có chưa
    }
    //theo code thì chỗ này nếu conversationId rỗng -> conversation rỗng thì cũng sẽ tạo hội conversation mới

    //nếu chưa thì tạo cuộc conversation mới
    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
          //chỗ này chỉ cần tạo mảng 2 user vì là direct message
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    //sau đó tạo tin nhắn
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
    });

    //chỗ nà c cập nhật các thông này sẽ được sử dụng cho cả group message nên sẽ tạo 1 cái helper trong utils để tiện cho việc tái sử dụng
    updateConversationAfterCreatedMessage(conversation, message, senderId);

    await conversation.save();
    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi send direct message", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;

    //conversation này sẽ được truyền từ middleware
    const conversation = req.conversation;

    if (!content) {
      res.status(400).json({ message: "Nội dung rỗng" });
      //Check nội dung gửi
    }

    //Tạo message từ body
    const message = await Message.create({
      conversationId,
      senderId,
      content,
    });

    //gọi updateConversationAfterCreatedMessage
    updateConversationAfterCreatedMessage(conversation, message, senderId);

    //save conversation lại
    await conversation.save();

    //trả về message vừa tạo
    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi send group message", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
