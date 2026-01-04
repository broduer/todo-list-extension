let taskArr = [];

const updateView = () => {

    const tasksList = document.getElementById("tasksList");

    // Clear existing tasks efficiently
    tasksList.innerHTML = "";

    taskArr.forEach((element, index) => {

        const newTask = document.createElement("div");
        newTask.className = "task-div";

        const taskText = document.createElement("div");
        taskText.className = element.isDone ? "task-text task-completed" : "task-text";
        // Use textContent to prevent XSS vulnerabilities
        taskText.textContent = `${index + 1}. ${element.task}`;

        const taskControls = document.createElement("div");
        taskControls.className = "task-controls";

        const taskEdit = document.createElement("button");
        taskEdit.textContent = "Edit";
        taskEdit.className = "task-btn task-btn-edit";
        taskEdit.dataset.index = index;
        taskEdit.addEventListener("click", () => editTask(index));

        const taskDelete = document.createElement("button");
        taskDelete.textContent = "Delete";
        taskDelete.className = "task-btn task-btn-delete";
        taskDelete.dataset.index = index;
        taskDelete.addEventListener("click", () => deleteTask(index));

        const taskDo = document.createElement("button");
        taskDo.textContent = element.isDone ? "Undo" : "Done";
        taskDo.className = "task-btn task-btn-do";
        taskDo.dataset.index = index;
        taskDo.addEventListener("click", () => doTask(index));

        taskControls.appendChild(taskEdit);
        taskControls.appendChild(taskDelete);
        taskControls.appendChild(taskDo);

        newTask.appendChild(taskText);
        newTask.appendChild(taskControls);

        tasksList.appendChild(newTask);
    });
}

const addTask = (isDone = false) => {
    const taskInput = document.getElementById("task-input");
    const task = taskInput.value.trim();
    
    // Validate input
    if (!task) return;
    
    // Sanitize task text by limiting length
    const sanitizedTask = task.slice(0, 500);
    
    taskArr.push({ task: sanitizedTask, isDone });
    
    try {
        localStorage.setItem("savedTasks", JSON.stringify(taskArr));
    } catch (error) {
        console.error("Failed to save tasks:", error);
        alert("Failed to save task. Storage might be full.");
        taskArr.pop(); // Remove the task we just added
        return;
    }
    
    updateView();
    taskInput.value = "";
}

const editTask = (taskIndex) => {
    if (taskIndex < 0 || taskIndex >= taskArr.length) return;
    
    const taskText = taskArr[taskIndex].task;
    taskArr.splice(taskIndex, 1);
    
    try {
        localStorage.setItem("savedTasks", JSON.stringify(taskArr));
    } catch (error) {
        console.error("Failed to update tasks:", error);
    }
    
    updateView();

    const taskInput = document.getElementById("task-input");
    taskInput.value = taskText;
    taskInput.focus();
}

const deleteTask = (taskIndex) => {
    if (taskIndex < 0 || taskIndex >= taskArr.length) return;
    
    taskArr.splice(taskIndex, 1);
    
    try {
        localStorage.setItem("savedTasks", JSON.stringify(taskArr));
    } catch (error) {
        console.error("Failed to update tasks:", error);
    }
    
    updateView();
}

const doTask = (taskIndex) => {
    if (taskIndex < 0 || taskIndex >= taskArr.length) return;
    
    taskArr[taskIndex].isDone = !taskArr[taskIndex].isDone;
    
    try {
        localStorage.setItem("savedTasks", JSON.stringify(taskArr));
    } catch (error) {
        console.error("Failed to update tasks:", error);
    }
    
    updateView();
}

document.addEventListener("DOMContentLoaded", () => {
    try {
        const savedTasks = localStorage.getItem("savedTasks");
        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);
            // Validate the loaded data
            if (Array.isArray(parsedTasks)) {
                taskArr = parsedTasks.filter(task => 
                    task && 
                    typeof task === "object" && 
                    typeof task.task === "string" &&
                    typeof task.isDone === "boolean"
                );
            }
        }
    } catch (error) {
        console.error("Failed to load tasks:", error);
        taskArr = [];
    }
    updateView();
});

document.getElementById("task-submit-btn").addEventListener("click", () => addTask(false));

// Add Enter key support for better UX
document.getElementById("task-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        addTask(false);
    }
});

document.getElementById("task-clear-btn").addEventListener("click", () => {
    if (taskArr.length > 0 && !confirm("Are you sure you want to clear all tasks?")) {
        return;
    }
    
    try {
        localStorage.removeItem("savedTasks");
    } catch (error) {
        console.error("Failed to clear tasks:", error);
    }
    
    taskArr = [];
    updateView();
});

