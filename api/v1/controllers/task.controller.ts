import {Request, Response} from "express";
import {Task} from "../models/task.model";


export const index = async (req: Request, res: Response): Promise<void> => {
    try {
        const find = {
            deleted: false
        };
        if(req.query.status) {
            find['status'] = req.query.status;
        }

        // sort
        const sort = {};
        if(req.query.sortKey && req.query.sortValue) {
            const sortKey = req.query.sortKey.toString();
            sort[sortKey] = req.query.sortValue;
        }
        // end sort

        // pagination
        let limitItems = 2;
        let page = 1;

        if(req.query.page) {
            page = parseInt(`${req.query.page}`);
        }

        if(req.query.limit) {
            limitItems = parseInt(`${req.query.limit}`);
        }

        const skip = (page - 1) * limitItems;

        // end pagination
        // Tìm kiếm
        if(req.query.keyword) {
            const regex = new RegExp(`${req.query.keyword}`, "i");
            find["title"] = regex;
        }
        // Hết Tìm kiếm
        
        const tasks = await Task.find(find).sort(sort).skip(skip).limit(limitItems);
        res.json(tasks);

    } catch (error) {
        res.status(500).json({
            message: "Error retrieving tasks",
            error: error.message
        });
    }
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
        }

        res.json(task);

    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving task",
            error: error.message
        });
    }
}
    