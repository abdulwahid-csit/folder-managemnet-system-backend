const express = require("express");
const router = express.Router();
const todoController = require("../../controllers/todo/todo.controller");

// POST /signup - Calls the signup function in the controller
router.get("/todo/:id?", todoController.getTodos);
router.post("/add-todo", todoController.addTodo);
// router.put("/todo/:id", todoController);
// router.delete("/todo/:id", todoController);
router.get("/todo-counts", todoController.getTodoCount);
router.put("/complete-todo/:id", todoController.updateTodoCompletion);

module.exports = router;
