# TaskLedger — To-Do List App

A simple, clean to-do list web app built with plain HTML, CSS, and JavaScript (no frameworks or libraries).

Built for **Task 1** of an internship assignment.

## Live Demo
Open `index.html` in any browser — no build step or server required.

## Features
- **Home screen** — view all tasks with title and completion status
- **Add tasks** — title, optional description, priority (Low / Medium / High), optional due date
- **Edit tasks** — update any task's details
- **Mark complete / active** — toggle with a single click
- **Delete tasks** — remove tasks you no longer need
- **Filters** — view All / Active / Completed tasks
- **Overdue flagging** — past-due tasks are highlighted
- **Local data storage** — tasks persist in the browser via `localStorage`, so your list is still there after closing and reopening the page

## Tech Stack
- HTML5
- CSS3 (custom properties / CSS variables, flexbox, grid)
- Vanilla JavaScript (ES6+, no dependencies)
- `localStorage` Web API for persistence

## Project Structure
```
todo-list-app/
├── index.html      # Markup
├── style.css        # Styling
├── script.js         # App logic (CRUD + storage)
└── README.md
```

## How It Works
- All tasks are kept in a single `tasks` array in `script.js`.
- Every create, edit, complete-toggle, and delete action updates that array, then:
  1. Saves it to `localStorage` (`saveTasks()`)
  2. Re-renders the task list from scratch (`render()`)
- This "single source of truth + re-render" pattern keeps the UI and stored data always in sync.

## Running Locally
1. Clone this repo
2. Open `index.html` directly in your browser (double-click, or use a tool like VS Code's Live Server extension)

## Author
Ayush Jha
