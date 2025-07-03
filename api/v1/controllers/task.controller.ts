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

export const changeStatus = async (req: Request, res: Response): Promise<any> => {

    try {
        const id: string = req.params.id;
    const status: string = req.body.status;
    
    await Task.updateOne({
        _id: id,
    }, {
        status: status
    });

    res.json({
        code: 200,
        message: "Change status task successfully",
    });
    } catch (error) {
        res.status(500).json({
            message: "Error changing task status",
    })
    };
}

export const changeMulti = async (req: Request, res: Response): Promise<any> => {
    try {
        const ids: string[] = req.body.ids;
        const status: string = req.body.status;

        await Task.updateMany({
            _id: { $in: ids }
        }, {
            status: status
        });

        res.json({
            code: 200,
            message: "Change status tasks successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error changing tasks status",
            error: error.message
        });
    }
}

export const create = async (req: Request, res: Response): Promise<any> => {
    try {

        const task = new Task(req.body);
        await task.save();

        res.status(201).json({
            code: 201,
            message: "Task created successfully",
            data: task
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating task",
            error: error.message
        });
    }
}

export const edit = async (req: Request, res: Response): Promise<any> => {
    const id: string = req.params.id;
    const title: string = req.body.title;
    const content: string = req.body.content;

    try {
        await Task.updateOne({
            _id: id,
        }, {
            title: title,
            content: content
        });
        res.json({
            code: 200,
            message: "Task updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating task",
            error: error.message
        });
    }

}

export const deleteTask = async (req: Request, res: Response): Promise<any> => {
    const id: string = req.params.id;

    try {
        await Task.updateOne({
            _id: id,
        }, {
            deleted: true,
            deletedAt: new Date()
        });
        res.json({
            code: 200,
            message: "Task deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting task",
            error: error.message
        });
    }
}
    