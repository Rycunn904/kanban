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

    const contextMenu = document.getElementById("context-menu");
    const renameOption = document.getElementById("rename-option");
    const deleteOption = document.getElementById("delete-option");

    let selectedTaskElement = null;
    let selectedSubtaskRef = null;

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

    function renderSubtasks(subtasks, parentElement = subtaskList, depth = 0) {

        parentElement.innerHTML = "";

        subtasks.forEach((sub) => {

            sub.children = sub.children || [];
            sub.collapsed = sub.collapsed ?? false;

            const div = document.createElement("div");
            div.className = "subtask";

            // ================= HEADER =================
            const header = document.createElement("div");
            header.className = "subtask-header";

            const arrow = document.createElement("span");
            arrow.className = "collapse-arrow";
            arrow.textContent = sub.children.length ? "▶" : "";
            arrow.style.transform =
                sub.collapsed ? "rotate(0deg)" : "rotate(90deg)";
            arrow.style.display =
                sub.children.length ? "inline-block" : "none";

            // checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = sub.done;

            // label
            const label = document.createElement("span");
            label.textContent = sub.text;

            // ADD BUTTON
            const addBtn = document.createElement("button");
            addBtn.className = "add-child";
            addBtn.textContent = "+";

            // LIMIT DEPTH TO 2 EXTRA LEVELS
            if (depth >= 2) {
                addBtn.style.display = "none";
            }

            header.appendChild(arrow);
            header.appendChild(checkbox);
            header.appendChild(label);
            header.appendChild(addBtn);

            div.appendChild(header);

            // ================= CHECKBOX =================
            checkbox.addEventListener("change", (e) => {
                sub.done = e.target.checked;
            });

            // ================= ADD CHILD =================
            addBtn.addEventListener("click", (e) => {
                e.stopPropagation();

                const text = prompt("New subtask:");
                if (!text) return;

                sub.children.push({
                    text,
                    done: false,
                    children: [],
                    collapsed: false
                });

                renderSubtasks(currentEditingTask.taskData.subtasks);
            });

            // ================= RIGHT CLICK =================
            div.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                e.stopPropagation();

                selectedTaskElement = currentEditingTask;
                selectedSubtaskRef = sub;

                showContextMenu(e.pageX, e.pageY);
            });

            // ================= COLLAPSE =================
            header.addEventListener("click", (e) => {

                if (
                    e.target.tagName === "INPUT" ||
                    e.target.tagName === "BUTTON"
                ) return;

                if (sub.children.length === 0) return;

                sub.collapsed = !sub.collapsed;

                renderSubtasks(currentEditingTask.taskData.subtasks);
            });

            // ================= CHILDREN =================
            if (
                sub.children.length > 0 &&
                !sub.collapsed
            ) {

                const childContainer =
                    document.createElement("div");

                childContainer.className =
                    "subtask-children";

                renderSubtasks(
                    sub.children,
                    childContainer,
                    depth + 1
                );

                div.appendChild(childContainer);
            }

            parentElement.appendChild(div);
        });
    }

    function showContextMenu(x, y) {
        contextMenu.style.display = "block";
        contextMenu.style.left = x + "px";
        contextMenu.style.top = y + "px";
    }

    window.addEventListener("click", () => {
        selectedSubtaskRef = null;
        contextMenu.style.display = "none";
    });

    renameOption.addEventListener("click", () => {

        if (!selectedSubtaskRef) return;

        const newName = prompt("Rename:", selectedSubtaskRef.text);

        if (!newName) return;

        selectedSubtaskRef.text = newName;

        renderSubtasks(currentEditingTask.taskData.subtasks);
        contextMenu.style.display = "none";
    });

    deleteOption.addEventListener("click", () => {

        if (!selectedSubtaskRef) return;

        function removeItem(list, target) {

            for (let i = 0; i < list.length; i++) {

                const item = list[i];

                // MATCH EXACT OBJECT
                if (item === target) {
                    list.splice(i, 1);
                    return true;
                }

                // search children safely
                if (item.children && item.children.length > 0) {
                    const found = removeItem(item.children, target);
                    if (found) return true;
                }
            }

            return false;
        }

        removeItem(
            currentEditingTask.taskData.subtasks,
            selectedSubtaskRef
        );

        renderSubtasks(currentEditingTask.taskData.subtasks);
        contextMenu.style.display = "none";
    });

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