  // ---------- State ----------
  const STORAGE_KEY = 'taskledger.tasks.v1';
  let tasks = loadTasks();
  let currentFilter = 'all';

  // ---------- Elements ----------
  const openFormBtn = document.getElementById('openFormBtn');
  const taskForm = document.getElementById('taskForm');
  const formHeading = document.getElementById('formHeading');
  const editingIdInput = document.getElementById('editingId');
  const titleInput = document.getElementById('titleInput');
  const descInput = document.getElementById('descInput');
  const priorityInput = document.getElementById('priorityInput');
  const dueInput = document.getElementById('dueInput');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const taskListEl = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const taskCountEl = document.getElementById('taskCount');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // ---------- Local storage helpers ----------
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Could not read saved tasks:', e);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Could not save tasks:', e);
    }
  }

  // ---------- Form open/close ----------
  function openForm(taskToEdit) {
    taskForm.classList.add('open');
    if (taskToEdit) {
      formHeading.textContent = 'Edit task';
      editingIdInput.value = taskToEdit.id;
      titleInput.value = taskToEdit.title;
      descInput.value = taskToEdit.description || '';
      priorityInput.value = taskToEdit.priority;
      dueInput.value = taskToEdit.dueDate || '';
    } else {
      formHeading.textContent = 'New task';
      editingIdInput.value = '';
      titleInput.value = '';
      descInput.value = '';
      priorityInput.value = 'Medium';
      dueInput.value = '';
    }
    titleInput.focus();
  }

  function closeForm() {
    taskForm.classList.remove('open');
  }

  openFormBtn.addEventListener('click', () => openForm(null));
  cancelBtn.addEventListener('click', closeForm);

  // ---------- Save (create or update) ----------
  saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      titleInput.style.outline = '2px solid #9C3D34';
      return;
    }
    titleInput.style.outline = '';

    const id = editingIdInput.value;

    if (id) {
      // editing an existing task
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.title = title;
        task.description = descInput.value.trim();
        task.priority = priorityInput.value;
        task.dueDate = dueInput.value;
      }
    } else {
      // creating a new task
      tasks.push({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title,
        description: descInput.value.trim(),
        priority: priorityInput.value,
        dueDate: dueInput.value,
        completed: false,
        createdAt: Date.now()
      });
    }

    saveTasks();
    closeForm();
    render();
  });

  // ---------- Filters ----------
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // ---------- Task list interactions (event delegation) ----------
  taskListEl.addEventListener('click', (e) => {
    const item = e.target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.closest('.checkbox')) {
      toggleComplete(id);
    } else if (e.target.closest('.edit-btn')) {
      const task = tasks.find(t => t.id === id);
      if (task) openForm(task);
    } else if (e.target.closest('.delete-btn')) {
      deleteTask(id);
    }
  });

  function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      render();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }

  // ---------- Rendering ----------
  function formatDueDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function isOverdue(dateStr, completed) {
    if (!dateStr || completed) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dateStr + 'T00:00:00');
    return due < today;
  }

  function getFilteredTasks() {
    if (currentFilter === 'active') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
  }

  function render() {
    const filtered = getFilteredTasks()
      .slice()
      .sort((a, b) => a.completed - b.completed || b.createdAt - a.createdAt);

    taskListEl.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      emptyState.querySelector('p').textContent = tasks.length === 0
        ? 'The ledger is empty.'
        : 'Nothing here for this filter.';
    } else {
      emptyState.style.display = 'none';
    }

    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;
      li.dataset.priority = task.priority;

      const dueFormatted = formatDueDate(task.dueDate);
      const overdue = isOverdue(task.dueDate, task.completed);

      li.innerHTML = `
        <div class="checkbox ${task.completed ? 'checked' : ''}" role="checkbox" aria-checked="${task.completed}" tabindex="0">
          <svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 12L13 4" stroke="#F7F4EC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="task-body">
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
          <div class="task-meta">
            <span class="tag tag-${task.priority}">${task.priority}</span>
            ${dueFormatted ? `<span class="due-date ${overdue ? 'overdue' : ''}">${overdue ? 'Overdue · ' : ''}${dueFormatted}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="icon-btn edit-btn" title="Edit task" aria-label="Edit task">
            <svg viewBox="0 0 20 20" fill="none"><path d="M13.5 3.5l3 3-9 9H4.5v-3l9-9z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
          </button>
          <button class="icon-btn delete-btn" title="Delete task" aria-label="Delete task">
            <svg viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m-6.5 0v9a1 1 0 001 1h5a1 1 0 001-1V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      `;
      taskListEl.appendChild(li);
    });

    taskCountEl.textContent = tasks.length;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Init ----------
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  render();
