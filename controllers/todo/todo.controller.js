const Todo = require("../../models/todo/todo.modal")


const addTodo = async (req, res) => {
  try {
    const { title, description, isCompleted, reminderDate } = req.body;
    const userId = req.user.userId; // Get userId from the decoded token

    if (!title || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTodo = new Todo({
      title,
      description,
      reminderDate,
      isCompleted: isCompleted ? isCompleted : false,
      userId, // Attach userId to associate the todo with the logged-in user
    });

    await newTodo.save();

    return res.status(201).json({
      message: "Todo added successfully.",  
      status_code: 201,
    });
  } catch (error) {
    console.error("Error adding todo:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};


const getTodos = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const limit = parseInt(req.headers.limit) || 20;
    const search = req.headers.search || "";
    const userId = req.user.userId; 

    console.log('user id is: ', userId);

    let filter = { userId };

    if (id) {
      const todo = await Todo.findOne({ _id: id, userId });
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      return res.status(200).json({ todo });
    }

    if (status !== undefined) {
      const filteredStatus = status === "true" ? true : false;
      filter.isCompleted = filteredStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    // Fetch todos with filters, applying limit
    const todos = await Todo.find(filter).limit(limit).sort({createdAt: -1}).exec();

    return res.status(200).json({ todos });
  } catch (error) {
    console.error("Error while getting todos:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};



const getTodoCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Count all todos for the logged-in user
    const totalTodos = await Todo.countDocuments({ userId });

    // Count todos with isCompleted: false for the logged-in user
    const pendingTodos = await Todo.countDocuments({
      userId,
      isCompleted: false,
    });

    // Count todos with isCompleted: true for the logged-in user
    const completedTodos = await Todo.countDocuments({
      userId,
      isCompleted: true,
    });

    return res.status(200).json({
      totalTodos,
      pendingTodos,
      completedTodos,
    });
  } catch (error) {
    console.error("Error while getting todo counts:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};




const updateTodoCompletion = async (req, res) => {
  try {
    const { id } = req.body; // Get the todo id from the route parameter
    console.log("TODO ID IS: ", id)

    // Find the todo and check if it's not already marked as completed
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (todo.isCompleted) {
      return res
        .status(400)
        .json({ message: "Todo is already marked as completed" });
    }

    // Update the isCompleted status to true
    todo.isCompleted = true;
    await todo.save();

    return res.status(200).json({
      message: "Todo marked as completed successfully.",
      todo,
    });
  } catch (error) {
    console.error("Error while updating todo completion:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};



const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params; 
    console.log("TODO ID IS: ", id);

    // Find the todo by ID and delete it
    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json({
      message: "Todo deleted successfully.",
    });
  } catch (error) {
    console.error("Error while deleting todo:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};





module.exports = {
  addTodo,
  getTodos,
  getTodoCount,
  updateTodoCompletion,
  deleteTodo,
};
