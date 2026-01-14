let todos = [];
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  loadTodosFromStorage();
  setupEventListeners();
  renderTodos();
});

// Event Listeners
const setupEventListeners = () => {
  const taskForm = document.querySelector("#task-form");
  taskForm.addEventListener("submit", addTask);

  //   Filter btns
  const allFilterBtn = document.querySelector("#all-filter");
  const activeFilterBtn = document.querySelector("#active-filter");
  const doneFilterBtn = document.querySelector("#done-filter");
  let filterBtns = [allFilterBtn, activeFilterBtn, doneFilterBtn];
  filterBtns.forEach((filterBtn) => {
    filterBtn.addEventListener("click", () => {
      const filterValue = filterBtn.dataset.filter; // "all", "active", "done"
      handleFilterChange(filterValue);
    });
  });

  const todoList = document.querySelector("#todoList");
  todoList.addEventListener("click", (event) => {
    const target = event.target;
    const todoItem = target.closest("li[data-id]");

    const menuBtn = target.closest(".task-menu-btn");
    if (menuBtn) {
      const dropdown = menuBtn.nextElementSibling;
      const isClosed = dropdown.style.display === "none";
      document.querySelectorAll(".task-dropdown").forEach((el) => {
        el.style.display = "none";
      });
      dropdown.style.display = isClosed ? "block" : "none";
      return;
    }

    if (!todoItem) return;
    const todoId = Number(todoItem.dataset.id);

    if (target.closest(".delete-btn")) {
      deleteTask(todoId);
      return;
    }

    if (target.closest(".edit-btn")) {
      const label = todoItem.querySelector(".task-text");
      target.closest(".task-dropdown").style.display = "none";
      handleEditMode(todoId, label);
      return;
    }

    if (target.classList.contains("todo-checkbox")) {
      toggleTask(todoId);
      return;
    }
  });

  // Closes menus when clicking outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".task-menu-container")) {
      document.querySelectorAll(".task-dropdown").forEach((el) => {
        el.style.display = "none";
      });
    }
  });
};

// CRUD
// Add Task Function
const addTask = (formEvent) => {
  formEvent.preventDefault();

  const taskInput = document.querySelector("#task-input");
  const taskValue = taskInput.value.trim();
  if (!taskValue) return;

  const newTask = {
    id: Date.now(),
    text: taskValue,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTask);
  saveTodosToStorage();
  renderTodos();
  taskInput.value = "";
  taskInput.focus();
};

// Delete Task function
const deleteTask = (todoId) => {
  const taskId = todoId;
  const todo = todos.find((t) => t.id === taskId);

  if (todo) {
    const confirmation = confirm(`Delete "${todo.text}"?`);
    if (confirmation) {
      const index = todos.findIndex((t) => t.id === taskId);
      todos.splice(index, 1);
      saveTodosToStorage();
      renderTodos();
    }
  }
};

// Toggle Task function
const toggleTask = (todoId) => {
  const findTask = todos.find((todo) => todo.id === todoId);
  if (findTask) {
    findTask.completed = !findTask.completed;
    if (!findTask.completed) findTask.archived = false;
    saveTodosToStorage();
    renderTodos();

    // Auto-delete after delay if completed
    if (findTask.completed) {
      setTimeout(() => {
        const currentTask = todos.find((t) => t.id === todoId);
        if (currentTask && currentTask.completed) {
          const index = todos.findIndex((t) => t.id === todoId);
          if (index !== -1) {
            todos[index].archived = true;
            saveTodosToStorage();
            renderTodos();
          }
        }
      }, 2000); // 2 seconds faded animation before delete
    }
  }
};

// Edit Task function
const editTask = (todoId, newText) => {
  const trimmedText = newText.trim();

  if (!trimmedText) return;

  const todo = todos.find((t) => t.id === todoId);

  if (todo) {
    todo.text = trimmedText;
    saveTodosToStorage();
    renderTodos();
  }
};

// RENDERING & DISPLAY
const renderTodos = () => {
  const todoLists = document.querySelector("#todoList");
  todoLists.dataset.filter = currentFilter;
  const emptyState = document.querySelector("#empty-state");
  const filteredTodos = getFilteredTodos();

  todoLists.innerHTML = "";

  if (filteredTodos.length === 0) {
    if (emptyState) emptyState.style.display = "flex";
  } else {
    if (emptyState) emptyState.style.display = "none";

    filteredTodos.forEach((todo) => {
      const todoElement = createTodoElement(todo);
      todoLists.appendChild(todoElement);
    });
  }

  updateFooter();
};

// Create Task Element
const createTodoElement = (todo) => {
  const li = document.createElement("li");
  li.className = `task-item${todo.completed ? " task-completed" : ""}`;
  li.dataset.id = todo.id;

  li.innerHTML = `
  <div class="checkbox-container">
    <input type="checkbox" id="todo-${todo.id}" class="todo-checkbox" ${
    todo.completed ? "checked" : ""
  } />
  </div>
  <label for="todo-${todo.id}" class="task-text${
    todo.completed ? " completed" : ""
  }">
    ${todo.text}
  </label>
  <div class="task-menu-container">
    <button class="task-menu-btn" aria-label="Task options">
      <span class="material-symbols-outlined">more_vert</span>
    </button>
    <div class="task-dropdown" style="display: none">
      <button class="dropdown-item edit-btn" data-action="edit">
        <span class="material-symbols-outlined">edit</span>
        <span>Edit</span>
      </button>
      <button class="dropdown-item delete-btn" data-action="delete">
        <span class="material-symbols-outlined">delete</span>
        <span>Delete</span>
      </button>
    </div>
  </div>
  `;

  const label = li.querySelector(".task-text");

  label.addEventListener("dblclick", () => {
    handleEditMode(todo.id, label);
  });

  return li;
};

// Edit Task
const handleEditMode = (todoId, labelElement) => {
  const originalValue = labelElement.textContent;

  const input = document.createElement("input");
  input.type = "text";
  input.value = originalValue;
  input.className = "edit-input task-text";
  labelElement.replaceWith(input);
  input.focus();
  input.select();

  input.addEventListener("blur", () => {
    let newText = input.value.trim();
    if (newText) {
      editTask(todoId, newText);
    } else {
      renderTodos();
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.blur();
    } else if (event.key === "Escape") {
      renderTodos();
    }
  });
};

// Filter Tasks
const getFilteredTodos = () => {
  // FILTER ALL TASKS
  if (currentFilter === "all") {
    return todos.filter((todo) => !todo.archived);
  } else if (currentFilter === "active") {
    // FILTER ACTIVE / INCOMPLETE TASKS
    return todos.filter((todo) => !todo.completed);
  } else if (currentFilter === "done") {
    // FILTER DONE / COMPLETED TASKS
    return todos.filter((todo) => todo.completed);
  }
};

const updateFooter = () => {
  const activeTasks = todos.filter((todo) => !todo.completed).length;
  const completedTasks = todos.filter((todo) => todo.completed).length;

  const activeCountElement = document.querySelector("#active-count");
  if (activeCountElement) {
    activeCountElement.textContent = activeTasks;
  }
};

// FILTER FUNCTIONALITY
const handleFilterChange = (filter) => {
  currentFilter = filter;
  const allFilterButtons = document.querySelectorAll("[data-filter]");

  allFilterButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.classList.add("inactive");
  });

  // get clicked btn by data-filter value
  const clickedBtn = document.querySelector(`[data-filter="${filter}"]`);

  if (clickedBtn) {
    clickedBtn.classList.remove("inactive");
    clickedBtn.classList.add("active");
  }

  renderTodos();
};

// LOCAL STORAGE
// Save to localStorage function
const saveTodosToStorage = () => {
  try {
    localStorage.setItem("todos", JSON.stringify(todos));
  } catch (error) {
    alert("Couldn't save Task. Please Try again later");
  }
};

// load tasks from localStorage function
const loadTodosFromStorage = () => {
  try {
    const savedTasks = localStorage.getItem("todos");
    if (savedTasks) {
      todos = JSON.parse(savedTasks);
    } else {
      todos = [];
    }
  } catch (error) {
    alert("Couldn't load Task. Please Try again later");
  }
};

// Utility Functions
const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).slice(2);
};

const sanitizeInput = (text) => {
  return text.trim().replace(/\s+/g, " ");
};
