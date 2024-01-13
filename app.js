
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require("cors")
require("dotenv").config()

const app = express();
const port = 3000;

app.use(cors())

// Connect to MongoDB
mongoose.connect(process.env.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const taskSchema = new mongoose.Schema({
    task_id: String,
    task_name: String,
    files: [{
      filename: String,
      mimetype: String,
      size: Number,
      buffer: Buffer,
    }],
  });
  
  const Task = mongoose.model('Task', taskSchema);
  
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });
  
  app.use(express.json());
  
  app.post('/upload', upload.array('files'), async (req, res) => {
    try {
      const { task_id, task_name } = req.body;
  
      if (!task_id && !task_name) {
        return res.status(400).json({ error: 'Please provide task_id or task_name' });
      }
  
      const files = req.files.map(file => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      })); 
  
      const taskData = {
        task_id: task_id || null,
        task_name: task_name || null,
        files: files,
      };
  
      const task = await Task.create(taskData);
      res.json({ message: 'Files uploaded successfully', task: task });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/files/:fileName', async (req, res) => {
    try {
    const task_name = req.params.fileName;
      if (!task_name) {
        return res.status(400).json({ error: 'Please provide task_id or task_name' });
      }
      const task = await Task.findOne({task_name});
  
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      res.json({ files: task.files });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
