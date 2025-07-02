// Import necessary modules
import express, { Express, Request, Response } from 'express';

// Import dotenv for environment variables
import dotenv from 'dotenv';
dotenv.config();
// Import mongoose for MongoDB connection
import { connect } from "./config/database";
connect();

// Import the Task model
import { Task } from "./models/task.model";

// Import cors for handling CORS
import cors from 'cors';

// Initialize the Express application
const app: Express = express();
// Initialize the Express application
const port = process.env.PORT || 3000;

app.use(express.json());
// // Tất cả tên miền được phép truy cập vào
app.use(cors());
// Cho phép 1 tên miền cụ thể được phép truy cập
// const corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200
// }
// cors(corsOptions);
// parse application/json
app.get("/tasks", async (req: Request, res: Response) => {
  const tasks = await Task.find({
    deleted: false
  });

  res.json(tasks);
});


app.listen(port, () => {
    console.log('Server is running on http://localhost:' + port);
});