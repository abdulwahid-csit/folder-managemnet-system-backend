const express = require("express");
const router = express.Router();
const todoController = require("../../controllers/todo/todo.controller");

// POST /signup - Calls the signup function in the controller
router.get("/todo/:id?", todoController.getTodos);
router.post("/add-todo", todoController.addTodo);
// router.put("/todo/:id", todoController.updateTodoCompletion);
router.delete("/todo/:id?", todoController.deleteTodo);
router.get("/todo-counts", todoController.getTodoCount);
router.post("/complete-todo", todoController.updateTodoCompletion);

module.exports = router; 
