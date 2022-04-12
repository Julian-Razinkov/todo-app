const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

router.get("/tasks", auth, async (req, res) => {

    const match = {};
    const sortOption = {};

    if(req.query.isCompleted) {
        match.isCompleted = req.query.isCompleted === 'true'
    }
    
    if(req.query.sortBy) {
        const sortPartsArr = req.query.sortBy.split("_");
        sortOption[sortPartsArr[0]] = sortPartsArr[1] === 'desc' ? -1 : 1; 
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sortOption
            }
        });
        const tasks = req.user.tasks
        if(!tasks) res.status(404);

        res.status(200).send(tasks)
    } catch (e) {
        res.status(500).send()
    }
});

router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({_id, owner: req.user._id});
        
        if(!task) res.status(404).send()
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send()
    }
});

router.post("/tasks", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }

});

router.patch("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;

    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'isCompleted'];
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    
    if(!isValidUpdate) return res.status(400).send({error: "Invalid update!"});

    try {
        const task = await Task.findOne({_id, owner: req.user._id});

        if(!task) return res.status(404).send();
        
        updates.forEach((update) => task[update] = req.body[update]);
        task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOneAndDelete({_id, owner: req.user._id });

        if(!task) return res.status(404).send();
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});



module.exports = router