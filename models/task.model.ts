import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
    title: String,
    status: String,
    content: String,
    createdBy: String,
    timeStart: Date,
    timeFinish: Date,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    },
    {
        timestamps: true
    }
);

export const Task = mongoose.model('Task', taskSchema, 'tasks');

