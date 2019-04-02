const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

class TaskMan {
  constructor() {
    const low = require('lowdb');
    const FileSync = require('lowdb/adapters/FileSync');
    this.db = low(new FileSync('db.json'));
    this.db.defaults({
      tasks: [],
    }).write();
    this.tasks = this.db.get('tasks').value();
  }
  addTask(task) {
    this.db.get('tasks').push(task).write();
    this.tasks.push(task);
  }
  getTasks() {
    return this.tasks;
  }
}

const taskman = new TaskMan();

app.get('/tasks', (req, res) => {
  res.send(taskman.getTasks());
});

app.get('/addtask/:id/:pass', (req, res) => {
  if (req.params.pass === 'MY_PASSWORD') {
    taskman.addTask(req.params.id);
    res.sendStatus(201);
  }
  else {
    res.sendStatus(403);
  }
});

app.listen(4000);

