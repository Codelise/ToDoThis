let todos = [];
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  // CALL loadTodosFromStorage()
  // CALL renderTodos()
  // CALL setupEventListeners()

  // Event Listeners
  const setupEventListners = () => {
    const taskForm = document.querySelector("#task-form");
    taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      // CALL handleAddTodo()

      //   Filter btns
      const allFilterBtn = document.querySelector("#all-filter");
      const activeFilterBtn = document.querySelector("#active-filter");
      const doneFilterBtn = document.querySelector("#done-filter");
      let filterBtns = [allFilterBtn, activeFilterBtn, doneFilterBtn];
      filterBtns.forEach((filter, index) => {
        filter.addEventListener("click", () => {
          // CALL handleFilterChange(index)
        });
      });

      const deleteCompletedBtn = document.querySelector("#delete-btn");
      deleteCompletedBtn.addEventListener("click", () => {
        // CALL clearCompleted()
      });

      const todoList = document.querySelector("#todoList");
      todoList.addEventListener("click", (event) => {
        event.preventDefault();
        // determines the clicked element
        const target = event.target;
        // Find the parent <li> element to get the todo id
        // We use .closest() to climb up the DOM tree from the clicked element
        // to find the nearest ancestor that is an <li>
        const todoItem = target.closest("li[data-di]");
        if (!todoItem) return;

        // Gets the id of li element using data-id or (dataset)
        const todoId = todoItem.dataset.id;

        if (target.classList.contains("delete-btn")) {
          // CALL deleteTodo()
        } else if (target.classList.contains("checkbox")) {
          // CALL toggleTodo()
        }
      });
    });
  };
});
