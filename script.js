document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('taskInput');
  const categorySelect = document.getElementById('categorySelect');
  const addBtn = document.getElementById('addBtn');
  const taskList = document.getElementById('taskList');
  const categoryFilter = document.getElementById('categoryFilter');
  const tabs = document.querySelectorAll('.tab');
  const remainingCount = document.getElementById('remainingCount');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const progressText = document.getElementById('progressText');
  const taskStats = document.getElementById('taskStats');
  const progressFill = document.getElementById('progressFill');

  let tasks = JSON.parse(localStorage.getItem('sapphire_todos')) || [];
  let currentStatusFilter = 'all';
  let currentCategoryFilter = 'all';

  function saveAndRender() {
    localStorage.setItem('sapphire_todos', JSON.stringify(tasks));
    renderTasks();
  }

  function renderTasks() {
    taskList.innerHTML = '';

    const filtered = tasks.filter(task => {
      const statusMatch = currentStatusFilter === 'all' ? true :
                         currentStatusFilter === 'active' ? !task.completed : task.completed;
      const categoryMatch = currentCategoryFilter === 'all' ? true : task.category === currentCategoryFilter;
      return statusMatch && categoryMatch;
    });

    if (filtered.length === 0) {
      taskList.innerHTML = `<li style="text-align:center; color:#64748b; padding:20px; font-size:13px;">No tasks found</li>`;
    } else {
      filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
          <div class="task-left">
            <div class="custom-checkbox"></div>
            <span class="task-text">${task.text}</span>
            <span class="badge">${getCategoryIcon(task.category)} ${task.category}</span>
          </div>
          <button class="delete-btn">&times;</button>
        `;

        li.querySelector('.task-left').addEventListener('click', () => toggleTask(task.id));

        const textSpan = li.querySelector('.task-text');
        textSpan.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          enableInlineEdit(task.id, textSpan);
        });

        li.querySelector('.delete-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteTask(task.id);
        });

        taskList.appendChild(li);
      });
    }

    updateMetrics();
  }

  function getCategoryIcon(cat) {
    const icons = { Work: '💼', Personal: '👤', Ideas: '💡', Health: '🏋️' };
    return icons[cat] || '📋';
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now(),
      text: text,
      category: categorySelect.value,
      completed: false
    };

    tasks.push(newTask);
    taskInput.value = '';
    saveAndRender();
  }

  function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
  }

  function enableInlineEdit(id, element) {
    const currentText = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.style.cssText = 'background:rgba(255,255,255,0.1); border:1px solid #38bdf8; color:#fff; border-radius:4px; padding:2px 6px; width:100%; font-size:14px; outline:none;';

    element.replaceWith(input);
    input.focus();

    const saveEdit = () => {
      const updatedText = input.value.trim();
      if (updatedText) {
        tasks = tasks.map(t => t.id === id ? { ...t, text: updatedText } : t);
        saveAndRender();
      } else {
        renderTasks();
      }
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') saveEdit();
    });
  }

  function updateMetrics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% Completed`;
    taskStats.textContent = `${completed} of ${total} tasks`;
    remainingCount.textContent = `${active} task${active !== 1 ? 's' : ''} left`;
  }

  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentStatusFilter = tab.dataset.filter;
      renderTasks();
    });
  });

  categoryFilter.addEventListener('change', (e) => {
    currentCategoryFilter = e.target.value;
    renderTasks();
  });

  clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveAndRender();
  });

  renderTasks();
});