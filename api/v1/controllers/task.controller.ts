import {Request, Response} from "express";
import {Task} from "../models/task.model";

export const index = async (req: Request, res: Response) => {
    const tasks = await Task.find({
        deleted: false
    });

    res.json(tasks);
}

export const detail = async (req: Request, res: Response): Promise<any> => {
    const id: string = req.params.id;

    try {
        const task = await Task.findOne({
            _id: id,
            deleted: false
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        } else {
            return res.json(task);
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving task",
            error: error.message
        });
    }
}
    