import { Express } from "express";
import { tasksRoute } from "./task.route";
import { usersRoute } from "./user.route";

export const routesClient = (app: Express) => {
    app.use("/api/v1/tasks", tasksRoute);
    app.use("/api/v1/users", usersRoute);
}
