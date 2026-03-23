export const getUserInfo = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi authMe: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
