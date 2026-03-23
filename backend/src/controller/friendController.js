import Friend from "../models/Friends.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;
    //Lấy thông tin người nhận và lời nhắn từ body

    const from = req.user._id; //route này được bọc bởi middlware nên thông tin user này auto có
    //thông tin người gửi thì từ req

    if (from.toString() === to) {
      return res
        .status(400)
        .json({ message: "Không thể gửi lời mời kết bạn cho bản thân" });
    }

    const userExists = await User.exists({ _id: to });
    //nhanh hơn findOne, exists chỉ trả mỗi _id
    if (!userExists) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    let userA = from.toString();
    let userB = to.toString();

    if (userA > userB) {
      [userA, userB] = [userB, userA];
      //hoán đổi vị trí cặp user theo thứ tự bé hơn
    }

    //dùng Promise.all để check đồng thời 2 điều kiện cho nhanh
    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      //check xem có đã kết bạn chưa trả về alreadyFriends
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
      //check xem có đã lời mời kết bạn giữa cả 2 người chưa trả về existingRequest
    ]);

    if (alreadyFriends) {
      return res.status(400).json({ message: "Hai người đã là bạn bè" });
    }
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Đã tồn tại lời mời kết bạn đang chờ" });
    }

    const request = await FriendRequest.create({
      from,
      to,
      message,
    });

    return res
      .status(200)
      .json({ message: "Bạn đã gửi lời mời kết bạn thành công", request });
  } catch (error) {
    console.error("Lỗi gửi yêu cầu kết bạn.", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    //lấy requestId từ params
    const userId = req.user._id;
    //Lấy userId

    //tìm kiếm usrId từ database FriendRequest
    const request = await FriendRequest.findById(requestId);
    //Nhớ mấy cấu trúc này có thể khác nhau cái biến truyền vào nên xem kĩ
    if (!request) {
      return res.status(404).json({
        message: "Lời mời kết bạn không tồn tại",
      });
    }
    //check không có lời mời - trường hợp thu hồi lời mời hoặc request không hợp lệ

    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền xác nhận lời mời này",
      });
    }
    // để check chỉ ng nhận mới có quyền confirm

    //sau khi check các điều kiện thành công thì sẽ tạo mqh bạn bè giữa 2 user
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    //tạo friend xong thì xóa lời mời
    await FriendRequest.findByIdAndDelete(requestId);

    //Lấy thông tin của người gửi lời mời để trả về client hiển thị trên giao diện
    const from = await User.findById(request.from)
      .select("_id displayName avataUrl")
      //chỉ lấy 1 vài thông tin cần thiết
      .lean();
    //để tối ưu hiệu năng của query, khi có lean dữ liệu trả về là JObject
    //chứ không phải Mongoose Document như vậy query sẽ nhanh và nhẹ hơn

    return res.status(200).json({
      message: "Chấp nhận lời mời kết bạn thành công",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avataUrl: from?.avataUrl,
      },
    });
  } catch (error) {
    console.error("Lỗi chấp nhận kết bạn.", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    //lấy requestId từ params
    const userId = req.user._id;
    //Lấy userId

    //tìm kiếm usrId từ database FriendRequest
    const request = await FriendRequest.findById(requestId);
    //Nhớ mấy cấu trúc này có thể khác nhau cái biến truyền vào nên xem kĩ
    if (!request) {
      return res.status(404).json({
        message: "Lời mời kết bạn không tồn tại",
      });
    }
    //check không có lời mời - trường hợp thu hồi lời mời hoặc request không hợp lệ

    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền từ chối lời mời này",
      });
    }
    // để check chỉ ng nhận mới có quyền confirm

    //sau khi check điều kiện xong thì sẽ xóa lời mời kết bạn
    await FriendRequest.findByIdAndDelete(requestId);

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi từ chối kết bạn.", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    // dùng hàm find để tìm
    //ở đây dùng toán tử or để kết hợp tìm đồng thời cả userA hoặc userB (tức là cặp quan hệ này có mặt của userId thì là friend với người đó)
    const friendList = await Friend.find({
      $or: [
        {
          userA: userId,
        },
        {
          userB: userId,
        },
      ],
    })
      .populate("userA", "_id displayName avatarUrl")
      .populate("userB", "_id displayName avatarUrl")
      .lean();

    //sau khi tìm ra list quan hệ Friend thì sẽ lọc ra thông tin bạn bè thôi
    //đầu tiên là checklist xem có không
    if (!friendList.length) {
      return res.status(200).json({ friends: [] });
    }
    //nếu có thì chạy map vòng lặp để chỉ giữ lại thông tin bạn bè của user
    const friends = friendList.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA,
    );
    //đoạn này logic là check userId với id của userA -> nếu giống thì bạn bè là userB, ngược lại thì bạn bè chính là userA

    return res.status(200).json({ friends });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bạn bè.", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    //logic là sẽ tìm lời mời đã gửi và đã nhận của user
    const userId = req.user._id;

    //sẽ dùng cấu trúc const [a,b] = await Promise.all([queryA, queryB])
    const [sent, received] = await Promise.all([
      //queryA sẽ là đã gửi -> from: userId
      FriendRequest.find({ from: userId }).populate(
        "to",
        "_id displayName avatarUrl",
      ),
      //queryB sẽ là đã nhận -> to : userId
      FriendRequest.find({ to: userId }).populate(
        "from",
        "_id displayName avatarUrl",
      ),
      //nhớ populate thông tin
    ]);

    return res.status(200).json({ sent, received });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lời mời.", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
