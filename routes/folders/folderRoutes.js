const express = require("express");
const router = express.Router();
const todoController = require("../../controllers/folders/folder.controller");

// POST /signup - Calls the signup function in the controller
// router.get("/folder", todoController.getTodos);
router.post("/add-folder", todoController.folder);
// router.put("/todo/:id", todoController);
// router.delete("/todo/:id", todoController);
// router.get("/folder", todoController.getTodoCount);
// router.put("/folder", todoController.updateTodoCompletion);

module.exports = router;
