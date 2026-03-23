export const updateConversationAfterCreatedMessage = (
  conversation,
  message,
  senderId,
) => {
  //ở đây là bước cập nhật các thông tin của conversation dựa theo models
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      content: message.content,
      senderId,
      createdAt: message.createdAt,
    },
  });
  //Chỗ này đã xử lí cơ bản các thông tin của cuộc hội thoại

  //tiếp theo tại đây khi xử lí unreadCounts của cuộc hội thoại sẽ phải check theo từng người trong participant
  //với mỗi người trong participant sẽ lưu lại id người đó và unreadCounts của người đó --> unreadCounts dạng map()

  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString(); //Lấy ra userId từng participant
    const isSender = memberId === senderId.toString(); //So sánh với senderId === thì isSender = true
    const prevCount = conversation.unreadCounts.get(memberId) || 0; //dòng này sẽ lấy unreadCounts của conversation dựa theo memberId
    //tức là lấy ra Id rồi sẽ tìm unreadCOunts dựa theo cái đó
    //Tiếp tục set lại unreadCounts dựa theo memberId
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
    //ở đây sẽ kiểm tra xem memberId đó có phải người gửi không --> nếu là người gửi thì unreadCounts = 0 --> tức là đã đọc hết tin nhắn
    // ngược lại thì các thành viên chưa đọc sẽ +1 unreadCounts
  });
  //Làm phần này nên phân tích kĩ lại databases để hiểu hơn
};
