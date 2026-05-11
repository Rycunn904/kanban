document.addEventListener("DOMContentLoaded", () => {
    const columns = document.querySelectorAll(".column");
    const input = document.getElementById("task-input");
    const addBtn = document.getElementById("add-task-btn");
    const todoColumn = document.getElementById("todo");

    const modal = document.getElementById("global-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalClose = document.getElementById("modal-close");

    const modalTitleInput = document.getElementById("modal-title-input");
    const modalDescription = document.getElementById("modal-description");
    const modalTags = document.getElementById("modal-tags");

    const subtaskList = document.getElementById("subtask-list");
    const newSubtaskInput = document.getElementById("new-subtask-input");
    const addSubtaskBtn = document.getElementById("add-subtask-btn");

    const saveTaskBtn = document.getElementById("save-task-btn");
    const inProgressColumn = document.getElementById("in-progress");
    const WIP_MAX = document.getElementById("WIP_MAX");

    const TODO_LIMIT = 3;
    let draggedTask = null;

    let currentEditingTask = null;

    // ================= MODAL =================
    modalClose.onclick = () => modal.style.display = "none";
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    };

    // ================= TAG PARSER =================
    function parseTask(text) {
        const words = text.split(" ");
        const tags = [];
        const clean = [];

        words.forEach(w => {
            if (w.startsWith("#")) {
                tags.push(w.substring(1));
            } else {
                clean.push(w);
            }
        });

        return {
            text: clean.join(" "),
            tags
        };
    }

    // ================= CREATE TASK =================
    function createTask(taskData) {

        const task = document.createElement("div");
        task.className = "task";
        task.draggable = true;

        task.taskData = {
            title: taskData.title || "Untitled",
            description: taskData.description || "",
            tags: taskData.tags || [],
            subtasks: taskData.subtasks || []
        };

        renderTask(task);

        // OPEN MODAL
        task.addEventListener("click", (e) => {

            if (e.target.closest(".delete")) return;

            currentEditingTask = task;

            modalTitleInput.value = task.taskData.title;
            modalDescription.value = task.taskData.description;
            modalTags.value = task.taskData.tags.map(t => "#" + t).join(" ");

            renderSubtasks(task.taskData.subtasks);

            modal.style.display = "block";
        });

        // DELETE
        task.querySelector(".delete").addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            task.remove();
            saveBoard();
            updateWIPCount();
        });

        // DRAG
        task.addEventListener("dragstart", () => {
            draggedTask = task;

            task.originalColumn = task.parentElement;

            task.style.opacity = "0.4";
        });

        task.addEventListener("dragend", () => {
            draggedTask = null;
            task.style.opacity = "1";
            saveBoard();
        });

        return task;
    }

    function renderTask(task) {

        const data = task.taskData;

        const tagHTML = data.tags.map(t =>
            `<span class="tag">#${t}</span>`
        ).join(" ");

        const completed = data.subtasks.filter(s => s.done).length;
        const total = data.subtasks.length;

        task.innerHTML = `
        <div class="task-text">
            ${data.title}
            <button class="delete">
                <img class="delete-img" src="x.png">
            </button>
        </div>

        <div>${tagHTML}</div>

        ${total > 0 ? `
            <div class="subtask-progress">
                ${completed}/${total} subtasks
            </div>
        ` : ""}
    `;
    }

    function renderSubtasks(subtasks) {

        subtaskList.innerHTML = "";

        subtasks.forEach((sub, index) => {

            const div = document.createElement("div");
            div.className = "subtask";

            div.innerHTML = `
            <input type="checkbox" ${sub.done ? "checked" : ""}>
            <span>${sub.text}</span>
        `;

            div.querySelector("input").addEventListener("change", (e) => {
                subtasks[index].done = e.target.checked;
            });

            subtaskList.appendChild(div);
        });
    }

    function updateWIPCount() {
        const count =
            inProgressColumn.querySelectorAll(".task").length;

        WIP_MAX.textContent = `${count}/3`;
    }

    // ================= COLUMN DRAG =================
    columns.forEach(column => {

        column.addEventListener("dragover", (e) => {
            e.preventDefault();

            if (!draggedTask) return;

            // STOP adding more than 3 to In Progress
            if (
                column.id === "in-progress" &&
                draggedTask.parentElement !== column
            ) {
                const tasksInProgress =
                    column.querySelectorAll(".task").length;

                if (tasksInProgress >= TODO_LIMIT) {
                    return;
                }
            }

            const after = getDragAfterElement(column, e.clientY);

            if (after == null) {
                column.appendChild(draggedTask);
            } else {
                column.insertBefore(draggedTask, after);
            }
        });

        column.addEventListener("drop", (e) => {
            e.preventDefault();

            saveBoard();
            updateWIPCount();
        });
    });

    function getDragAfterElement(container, y) {

        const items = [
            ...container.querySelectorAll(".task:not(.dragging)")
        ];

        return items.reduce((closest, child) => {

            const box = child.getBoundingClientRect();

            const offset =
                y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return {
                    offset,
                    element: child
                };
            } else {
                return closest;
            }

        }, {
            offset: Number.NEGATIVE_INFINITY
        }).element;
    }

    // ================= ADD TASK =================
    addBtn.addEventListener("click", () => {

        const raw = input.value.trim();

        if (!raw) return;

        const parsed = parseTask(raw);

        const task = createTask({
            title: parsed.text,
            tags: parsed.tags,
            description: "",
            subtasks: []
        });

        todoColumn.appendChild(task);

        input.value = "";

        saveBoard();
        updateWIPCount();
    });

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addBtn.click();
    });

    addSubtaskBtn.addEventListener("click", () => {

        if (!currentEditingTask) return;

        const text = newSubtaskInput.value.trim();

        if (!text) return;

        currentEditingTask.taskData.subtasks.push({
            text,
            done: false
        });

        newSubtaskInput.value = "";

        renderSubtasks(currentEditingTask.taskData.subtasks);
    });

    saveTaskBtn.addEventListener("click", () => {

        if (!currentEditingTask) return;

        currentEditingTask.taskData.title =
            modalTitleInput.value;

        currentEditingTask.taskData.description =
            modalDescription.value;

        currentEditingTask.taskData.tags =
            modalTags.value
                .split(" ")
                .filter(t => t.startsWith("#"))
                .map(t => t.substring(1));

        renderTask(currentEditingTask);

        modal.style.display = "none";

        saveBoard();
    });

    // ================= SAVE =================
    function saveBoard() {

        const data = {};

        document.querySelectorAll(".column").forEach(col => {

            data[col.id] = [];

            col.querySelectorAll(".task").forEach(task => {
                data[col.id].push(task.taskData);
            });
        });

        localStorage.setItem(
            "kanbanBoard",
            JSON.stringify(data)
        );
    }

    // ================= LOAD =================
    function loadBoard() {

        const saved =
            JSON.parse(localStorage.getItem("kanbanBoard"));

        if (!saved) return;

        Object.keys(saved).forEach(colId => {

            const col =
                document.getElementById(colId);

            if (!col) return;

            saved[colId].forEach(taskData => {

                col.appendChild(
                    createTask(taskData)
                );

            });
        });
    }

    loadBoard();
    updateWIPCount();
});