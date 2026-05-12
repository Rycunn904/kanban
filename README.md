# 🗂️ Kanban To-Do List (Vanilla JS)

A lightweight Kanban-style task manager built with **HTML, CSS, and JavaScript**.  
Supports drag-and-drop tasks, subtasks, nested sub-subtasks, and a modal editor with local storage persistence.

---

## ✨ Features

### 📌 Core Kanban
- 3-column board:
  - Not Started
  - In Progress
  - Done
- Drag and drop tasks between columns
- Persistent storage using `localStorage`

### ⚙️ Task System
- Create tasks with:
  - Title (supports `#tags`)
  - Description
  - Tags
- Delete tasks
- Edit tasks in a modal

### 🧩 Subtasks System
- Add subtasks inside tasks
- Add **sub-subtasks (1-level nesting only)**
- Mark subtasks as complete
- Progress indicator (`x/y subtasks`)

### 📂 Collapsible Structure
- Click a subtask to expand/collapse children
- Visual hierarchy for nested tasks

### 🖱️ Context Menu
Right-click support for:
- Rename task/subtask
- Delete task/subtask

### 🚧 WIP Limit
- “In Progress” column limited to **3 tasks max**

---

## 🧠 Tech Stack

- HTML5
- CSS3 (custom UI styling)
- Vanilla JavaScript (no frameworks)
- LocalStorage API

---

## 📁 Project Structure


/project
│
├── index.html # Main layout + modal
├── style.css # UI styling
├── script.js # App logic (Kanban, drag/drop, subtasks)
└── x.png # Delete icon


---

## 🚀 How to Run

Dont want to change it:

1. Open [KanBan To-Do List](https://rycunn904.github.io/kanban/)

Want to change it:

1. Clone or download the project
2. Open `index.html` in your browser
3. Start adding tasks!

---

## 💡 How It Works

### Task Flow
1. Create a task from the input bar
2. Drag it between columns
3. Click to edit details in modal
4. Add subtasks / sub-subtasks
5. Track progress automatically

### Data Storage

All board data is saved in:
```js
localStorage["kanbanBoard"]
```

### Structure:

```json
{
  "todo": [],
  "in-progress": [],
  "done": []
}
```

## ⚠️ Known Limitations

- Subtasks only support 2 levels deep
- No backend sync (local only)
- No user authentication
- No real-time collaboration

## 🧑‍💻 Author Notes

This project is designed as a learning-focused Kanban system to explore:

- DOM manipulation
- Drag-and-drop behavior
- Recursive UI rendering
- Local storage persistence
- Event handling complexity in nested components