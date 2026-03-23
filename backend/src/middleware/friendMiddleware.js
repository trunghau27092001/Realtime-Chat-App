import Conversation from "../models/Conversation.js";
import Friend from "../models/Friends.js";

const pair = (a, b) => (a < b ? [a, b] : [b, a]);
export const checkFriendship = async (req, res, next) => {
  //Khi một middleware thực hiện xong nhiệm vụ (ví dụ: kiểm tra đăng nhập, log dữ liệu), nó gọi next() để báo cho Express chuyển sang hàm xử lý tiếp theo.
  //Nếu truyền một đối tượng lỗi vào hàm next (ví dụ: next(err)), Express sẽ bỏ qua các middleware thông thường và chuyển thẳng đến middleware xử lý lỗi.
  try {
    const me = req.user._id.toString();
    //Lấy id user
    const recipientId = req.body?.recipientId ?? null;
    //Lấy id của người nhận (bạn bè)
    const memberIds = req.body?.memberIds ?? [];
    //Lấy danh sách members từ req.body nếu không có thì tạo mảng rỗng

    if (!recipientId && memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Cần cung cấp recipientId hoặc memberIds" });
    }

    if (recipientId) {
      const [userA, userB] = pair(me, recipientId);
      //sắp xếp 2 user
      const isFriend = await Friend.findOne({ userA, userB });
      //sau khi sắp xếp xong thì sẽ tìm kiếm theo cặp dữ liệu userA, userB như trên
      if (!isFriend) {
        return res
          .status(403)
          .json({ message: "Bạn chưa kết bạn với người này" });
      }

      return next();
    }
    //còn logic phần chat nhóm
    //duyệt qua tửng memberIds trong danh sách thành viên, với mỗi id thì check bạn bè với userId(me)
    //NHẮC LẠI: kiểm tra mqh bạn bè thì bắt buộc phải pair id của 2 user
    //1: Tạo hàm friendCheck để check từng cặp user trong memberIds
    const friendCheck = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId);
      const friend = await Friend.findOne({ userA, userB });
      return friend ? null : memberId;
    });

    //2: gọi Promise.all để check đồng thời các cặp trong memberIds
    //Luồng chạy sẽ là friendCheck map qua các cặp --> mỗi cặp sẽ vào 1 Promise<> (Friend.findOne)
    //Sau khi tất cả các cặp userId với memberIds chạy xong thì sẽ return null
    //kết quả sẽ là 1 mảng các null hoặc memberId
    const results = await Promise.all(friendCheck);
    //dùng filter để lọc các phần tử null (tức là đã là bạn bè)
    const notFriend = results.filter(Boolean);
    if (notFriend.length > 0) {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể thêm bạn bè vào nhóm" });
    }

    next();
  } catch (error) {
    console.error("Lỗi xảy ra khi check friendShip: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const checkGroupMemberShip = async (req, res, next) => {
  try {
    const { converationId } = req.body;
    const userId = req.user._id;
    //lấy conversationId và userId

    const conversation = await Conversation.findById(converationId);
    //truy xuất conversation dựa theo conversationId

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại" });
    }

    //check participants của conversation xem có tồn tại user đó không
    //dùng hàm some để dò trong participants
    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Bạn không thuộc nhóm này" });
    }

    req.conversation = conversation;

    next();
  } catch (error) {
    console.error("Lỗi xảy ra khi check GroupMemberShip: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
