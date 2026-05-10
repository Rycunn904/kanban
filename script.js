document.addEventListener("DOMContentLoaded", () => {
    const columns = document.querySelectorAll(".column");
    const input = document.getElementById("task-input");
    const addBtn = document.getElementById("add-task-btn");
    const todoColumn = document.getElementById("todo");

    const modal = document.getElementById("global-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalClose = document.getElementById("modal-close");

    let draggedTask = null;

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
    function createTask(text, tags = []) {
        const task = document.createElement("div");
        task.className = "task";
        task.draggable = true;

        const tagHTML = tags.map(t => `<span class="tag">#${t}</span>`).join(" ");

        task.innerHTML = `
            <div class="task-text">${text}</div>
            <div>${tagHTML}</div>
            <button class="delete">x</button>
        `;

        // OPEN MODAL
        task.addEventListener("click", (e) => {
            if (e.target.classList.contains("delete")) return;

            modalTitle.innerText = text;
            modalBody.innerHTML = `
                <p>${text}</p>
                <div>${tagHTML}</div>
            `;

            modal.style.display = "block";
        });

        // DELETE
        task.querySelector(".delete").addEventListener("click", (e) => {
            e.stopPropagation();
            task.remove();
            saveBoard();
        });

        // DRAG
        task.addEventListener("dragstart", () => {
            draggedTask = task;
            task.style.opacity = "0.4";
        });

        task.addEventListener("dragend", () => {
            draggedTask = null;
            task.style.opacity = "1";
            saveBoard();
        });

        return task;
    }

    // ================= COLUMN DRAG =================
    columns.forEach(column => {
        column.addEventListener("dragover", (e) => {
            e.preventDefault();

            const after = getDragAfterElement(column, e.clientY);
            if (!draggedTask) return;

            if (after == null) {
                column.appendChild(draggedTask);
            } else {
                column.insertBefore(draggedTask, after);
            }
        });

        column.addEventListener("drop", saveBoard);
    });

    function getDragAfterElement(container, y) {
        const items = [...container.querySelectorAll(".task:not(.dragging)")];

        return items.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // ================= ADD TASK =================
    addBtn.addEventListener("click", () => {
        const raw = input.value.trim();
        if (!raw) return;

        const parsed = parseTask(raw);
        const task = createTask(parsed.text, parsed.tags);

        todoColumn.appendChild(task);

        input.value = "";
        saveBoard();
    });

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addBtn.click();
    });

    // ================= SAVE =================
    function saveBoard() {
        const data = {};

        document.querySelectorAll(".column").forEach(col => {
            data[col.id] = [];

            col.querySelectorAll(".task").forEach(task => {
                const text = task.querySelector(".task-text").innerText;

                const tags = [...task.querySelectorAll(".tag")]
                    .map(t => t.innerText.replace("#", ""));

                data[col.id].push({ text, tags });
            });
        });

        localStorage.setItem("kanbanBoard", JSON.stringify(data));
    }

    // ================= LOAD =================
    function loadBoard() {
        const saved = JSON.parse(localStorage.getItem("kanbanBoard"));
        if (!saved) return;

        Object.keys(saved).forEach(colId => {
            const col = document.getElementById(colId);
            if (!col) return;

            saved[colId].forEach(t => {
                col.appendChild(createTask(t.text, t.tags));
            });
        });
    }

    loadBoard();
});