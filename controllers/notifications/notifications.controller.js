const Notifications = require("../../models/notifications/notification.modal");

const getNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log("user id is: ", userId);

    let filter = { userId };

    if (id) {
      const notification = await Notification.findOne({ _id: id, userId });
      if (!notification) {
        return res.status(404).json({ message: "notification not found" });
      }
      return res.status(200).json({ notification });
    }

    const notification = await Notifications.find(filter)
      .sort({ createdAt: -1 })
      .exec();

      if(notification){
          return res.status(200).json({ notification });
      }

  } catch (error) {
    console.error("Error while getting todos:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params; 
    const notification = await Notifications.findOne({ _id: id });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();
    return res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error while marking notification as read:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const updatedNotifications = await Notifications.updateMany(
      { read: false }, 
      { $set: { read: true } } 
    );

    if (updatedNotifications.nModified === 0) {
      return res.status(404).json({ message: "No unread notifications found" });
    }

    return res
      .status(200)
      .json({
        message: "All notifications marked as read",
        updatedNotifications,
      });
  } catch (error) {
    console.error("Error while marking all notifications as read:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};


module.exports = { getNotifications, markAsRead, markAllAsRead };