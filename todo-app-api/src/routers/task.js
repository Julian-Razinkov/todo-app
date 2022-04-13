const express = require("express");
const auth = require("../middleware/auth");
const taskController = require('../controllers/task.controller')
const router = new express.Router();

router.get("/tasks", auth, taskController.getTasks);
router.get("/tasks/:id", auth, taskController.getTaskById);
router.post("/tasks", auth, taskController.createTask);
router.patch("/tasks/:id", auth, taskController.updateTask);
router.delete("/tasks/:id", auth, taskController.deleteTask);


module.exports = router