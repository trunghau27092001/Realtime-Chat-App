import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id.toString();
    if (
      !type || //thiếu type
      (type === "group" && !name) || //là group message nhưng không có name
      !memberIds || //không có membersIds
      !Array.isArray(memberIds) || //memberIds không phải 1 mảng
      memberIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Tên nhóm và danh sách thành viên là bắt buộc" });
    }

    let conversation;

    //Chỗ này logic sẽ xử lí theo type direct/group
    if (type === "direct") {
      const participentId = memberIds[0]; //lấy vị trí 0 là vì direct thì số lượng memberIds chỉ có 1
      conversation = await Conversation.findOne({
        //Kiểm tra đã có tồn tại hội thoại giữa 2 user chưa
        type: "direct", //đk1 phải là cuộc hội thoại là direct
        "participants.userId": { $all: [userId, participentId] },
        //vì participants là mảng nên phải như vậy để kiểm tra mảng userId,
        //$all này quan trọng: tác dụng là để kiểm tra bắt buộc phải có đủ cặp userId và participentId
      });

      if (!conversation) {
        //nếu chưa có conversation thì tạo như bên dưới
        conversation = new Conversation({
          type: "direct",
          participants: [{ userId }, { userId: participentId }],
          lastMessageAt: new Date(),
        });

        await conversation.save();
      }
    }

    //ở trường hợp type === group thì tạo trực tiếp luôn
    if (type === "group") {
      conversation = new Conversation({
        type: "group",
        participants: [
          { userId },
          ...memberIds.map((id) => ({
            userId: id,
          })),
        ],
        group: {
          name,
          createdBy: userId,
        },
        lastMessageAt: new Date(),
      });

      await conversation.save();
    }

    //tiếp tục kiểm tra conversation xem có chưa --> nếu chưa có nghĩa là type != direct/group
    if (!conversation) {
      return res
        .status(400)
        .json({ message: "Conversation type không hợp lệ!" });
    }

    //ngược lại nếu đã có conversation thì sẽ populate các trường cần thiết để sử dụng ở frontend
    await conversation.populate([
      { path: "participants.userId", select: "displayName avataUrl" },
      { path: "seenBy", select: "displayName avataUrl" },
      { path: "lastMessage.senderId", select: "displayName avataUrl" },
    ]);

    return res.status(201).json({ conversation });
  } catch (error) {
    console.error("Lỗi khi tạo conversation ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
export const getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    //Lấy ra userId
    const conversations = await Conversation.find({
      "participants.userId": userId,
      //tìm kiếm toàn bộ cuộc hội thoại thông qua userId
    })
      //sắp xếp cuộc hội thoại ưu tiên lastMessageAt --> nếu bằng nhau thì dựa theo updateAt
      .sort({ lastMessageAt: -1, updateAt: -1 })
      //populate các trường cần thiết để frontEnd dễ sử dụng
      .populate([
        { path: "participants.userId", select: "displayName avataUrl" },
        { path: "seenBy", select: "displayName avataUrl" },
        { path: "lastMessage.senderId", select: "displayName avataUrl" },
      ]);

    //formatted lại dữ liệu để tiện cho frontend sử dụng
    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avataUrl: p.userId?.avataUrl ?? null,
        joinedAt: p.joinedAt,
      }));

      return {
        //chỗ này trả về thì nên sử dụng đúng cái cấu trúc dưới đây
        // ...A,b,c
        //làm vậy để copy tại cả cái object convo --> trong case này thì là từng cái conversation sẽ được copy lại,
        //làm vậy sẽ giữ lại được nguyên object cũ không cần phải gán lại từng field
        //b,c trong cấu trúc trên là từng field trong A
        //vậy nên b,c sẽ cập nhật trực tiếp vào A.b, A.c
        ...convo.toObject(),
        unreadCounts: convo.unreadCounts || {},
        participants,
      };
    });
    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error("Lỗi khi get conversation ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
export const getMessages = async (req, res) => {
  //Lấy toàn bộ tin nhắn trong cuộc hội thoại
  //chỗ này sẽ dùng 2 biến là limit và cursor để đánh dấu
  //limit: giới hạn số lượng tin nhắn get ra --> nếu số lượng get ra > limit tức là còn tin nhắn
  //cursor đánh dấu cái vị trí tin đã get hiện tại (cursor là thời gian createdAt của tin nhắn đó)
  // ở frontEnd sẽ dùng kĩ thuật scroll để bắt
  //ví dụ nếu scroll tới tin thứ 50 đã get ra thì sẽ bắt đầu get từ tin thứ 51 tới 100

  try {
    //Lấy conversationId
    const { conversationId } = req.params;
    //lấy ra limit (mặc định là 50 tin) và cursor từ query (sau dấu ?)
    const { limit = 50, cursor } = req.query;

    //Tạo query để truy xuất db
    const query = { conversationId };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
      //$lt nghĩa là less than (lấy các tin nhắn trước thời gian này)
      // chuyển cursor về dạng Date vì cursor lúc này là chuỗi timestamp
    }

    //dùng query để truy xuất từ Messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      //sắp xếp tin mới nhất lên trước để tiện xử lí tin nhắn cuối
      .limit(Number(limit) + 1);
    //chuyển limit về dạng số + 1 đơn vị để lấy tin nhắn thứ limit + 1 để check xem còn tin nhắn cũ hơn nữa không;

    //tạo biến cursorNext = null để báo còn tin nhắn
    //kiểm tra messages trả ra xem có lớn hơn limit không
    //nếu lớn hơn tức là còn tin nhắn, cập nhật lại cursorNext bằng tin nhắn thứ limit
    const nextCursor = null;
    if (messages.length > limit) {
      const lastMessages = messages[messages.length - 1];
      //lấy tin nhắn thứ limit (ở đây không để limit vì có thể trường hợp lấy tin nhắn từ 51 - 100 mà limit vẫn 50 sẽ sai)
      nextCursor = lastMessages.createdAt.toISOString(); //chuyển cursor về dạng string
      messages.pop(); //loại bỏ tin nhắn thứ limit + 1
    }

    messages = messages.reverse(); //đảo ngược mảng messages để tiện việc xử lí cho FrontEnd
    //trả về frontEnd
    return res.status(200).json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("Lỗi khi get Messages:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
