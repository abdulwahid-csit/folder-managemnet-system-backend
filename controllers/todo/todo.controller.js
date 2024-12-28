const Todo = require("../../models/todo/todo.modal")


const addTodo = async (req, res) => {
 try {
   const { title, description, isCompleted, reminderDate } = req.body;

   if (!title || !description) {
     return res.status(400).json({ message: "All fields are required" });
   }

   const newTodo = new Todo({
     title,
     description,
     reminderDate,
     isCompleted: isCompleted ? isCompleted : false,
  
   });

   await newTodo.save();

   
   return res.status(201).json({
     message: 'Todo addedd successfully.',
     status_code: 201,
   });
 } catch (error) {
   console.error("Error during signup:", error);
   return res.status(500).json({ message: "Server error, please try again" });
 }
}

const getTodos = async (req, res) => {
  try {
    const { id } = req.params; // id comes from the URL parameter
    const { status } = req.query; // status comes from query parameters
    const limit = parseInt(req.headers.limit) || 20;
    const search = req.headers.search || "";

    let filter = {};

    // If an id is provided, return the todo with the specific ID
    if (id) {
      const todo = await Todo.findById(id);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      return res.status(200).json({ todo });
    }

    // If status is provided, filter todos by the completed status (true or false)
    if (status !== undefined) {
      const filteredStatus = status === "true" ? true : false;
      filter.isCompleted = filteredStatus;
    }

    // If search is provided, search by title or description (case-insensitive)
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    // Fetch todos with filters, applying limit
    const todos = await Todo.find(filter).limit(limit).exec();

    return res.status(200).json({ todos });
  } catch (error) {
    console.error("Error while getting todos:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};



const getTodoCount = async (req, res) => {
  try {
    // Count all todos
    const totalTodos = await Todo.countDocuments();

    // Count todos with isCompleted: false
    const pendingTodos = await Todo.countDocuments({ isCompleted: false });

    // Count todos with isCompleted: true
    const completedTodos = await Todo.countDocuments({ isCompleted: true });

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
    const { id } = req.params; // Get the todo id from the route parameter

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




module.exports = {
  addTodo,
  getTodos,
  getTodoCount,
  updateTodoCompletion,
};
