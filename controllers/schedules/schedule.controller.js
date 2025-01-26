
const Schedule = require('../../models/schedules/schedule.modal')

const createSchedule =  async (req, res) => {
  try {
    const { title, startTime, endTime, date, description, location, status } =
      req.body;

    const newSchedule = new Schedule({
      title: title || "",
      startTime: startTime || "",
      endTime: endTime || "",
      date: date || "",
      description: description || "",
      status: status || "active",
    });

    await newSchedule.save();
    res
      .status(201)
      .json({
        message: "Schedule created successfully",
        schedule: newSchedule,
      });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating schedule", error: error.message });
  }
};

const getActiveSchedules = async (req, res) => {
  try {
    // Query the database to find all schedules where the status is 'active'
    const activeSchedules = await Schedule.find({ status: "active" });

    // Check if any active schedules were found
    if (activeSchedules.length === 0) {
      return res
        .status(404)
        .json({ message: "No active schedules found" })
        .sort({ createdAt: -1 })
        .exec();
    }

    // Return the active schedules
    res.status(200).json({
      message: "Active schedules fetched successfully",
      schedules: activeSchedules,
    });
  } catch (error) {
    // Handle errors that may occur during the database query
    res.status(400).json({
      message: "Error fetching active schedules",
      error: error.message,
    });
  }
};


const getCompletedSchedules = async (req, res) => {
  try {
    const activeSchedules = await Schedule.find({ status: "completed" })
      .sort({ createdAt: -1 })
      .exec();

    if (activeSchedules.length === 0) {
      return res.status(404).json({ message: "No active schedules found" });
    }

    res.status(200).json({
      message: "Active schedules fetched successfully",
      schedules: activeSchedules,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error fetching active schedules",
      error: error.message,
    });
  }
}

  const getAllSchedules = async (req, res) => {
    try {
      const activeSchedules = await Schedule.find()
        .sort({ createdAt: -1 })
        .exec();

      if (activeSchedules.length === 0) {
        return res.status(404).json({ message: "No active schedules found" });
      }

      res.status(200).json({
        message: "Active schedules fetched successfully",
        schedules: activeSchedules,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error fetching active schedules",
        error: error.message,
      });
    }
  };


  const deleteSchedule = async (req, res) => {
    try {
      const { scheduleId } = req.params;

      const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);

      if (!deletedSchedule) {
        return res.status(404).json({
          success: false,
          message: "Schedule not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Schedule deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);

      return res.status(500).json({
        success: false,
        message: "Error deleting schedule",
        error: error.message,
      });
    }
  };

module.exports = {
  createSchedule,
  getActiveSchedules,
  getCompletedSchedules,
  getAllSchedules,
  deleteSchedule,
};
