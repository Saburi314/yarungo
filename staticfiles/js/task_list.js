function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const csrftoken = getCookie('csrftoken');

// 完了ボタン非同期処理
document.addEventListener('click', (event) => {
    if (event.target.closest('.complete-task-btn')) {

        console.log('test');
        
        const button = event.target.closest('.complete-task-btn');
        const taskRow = button.closest('tr');
        const taskId = taskRow.dataset.taskId;
        const isCompleted = button.dataset.completed === "true";

        // 完了の場合は確認ダイアログを表示
        if (!isCompleted) {
            if (!confirm("このタスクを完了にしますか？")) return;
        }

        fetch(`/yarungo/tasks/${taskId}/complete_ajax/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('完了/未完了リクエストに失敗しました。');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const icon = button.querySelector('i');
                if (data.completed) {
                    icon.classList.remove('far', 'text-secondary');
                    icon.classList.add('fas', 'text-success');
                    button.dataset.completed = "true";
                    taskRow.remove();
                } else {
                    icon.classList.remove('fas', 'text-success');
                    icon.classList.add('far', 'text-secondary');
                    button.dataset.completed = "false";
                }
            } else {
                alert(`エラー: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('サーバーエラー:', error);
        });
    }
});

// 削除ボタン非同期処理
document.addEventListener('click', (event) => {
    if (event.target.closest('.delete-task-btn')) {
        const button = event.target.closest('.delete-task-btn');
        const taskId = button.dataset.taskId;

        const isConfirmed = confirm('このタスクを削除しますか？');
        if (!isConfirmed) return;

        fetch(`/yarungo/tasks/${taskId}/delete_ajax/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('削除リクエストに失敗しました。');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                document.querySelector(`tr[data-task-id="${data.task_id}"]`).remove();
            } else {
                alert(`エラー: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('サーバーエラー:', error);
        });
    }
});

// 並び替えボタン非同期処理
document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");

    let draggedRow = null;

    taskList.addEventListener("dragstart", (event) => {
        const dragHandle = event.target.closest(".drag-handle");

        if (!dragHandle) {
            event.preventDefault();
            return;
        }

        draggedRow = dragHandle.closest("tr");
        if (draggedRow) {
            draggedRow.style.opacity = 0.5;
        }
    });

    taskList.addEventListener("dragend", () => {
        if (draggedRow) {
            draggedRow.style.opacity = "";
        }
        draggedRow = null;
    });

    taskList.addEventListener("dragover", (event) => {
        event.preventDefault();
        const closestRow = event.target.closest("tr");
        if (closestRow && closestRow !== draggedRow) {
            const bounding = closestRow.getBoundingClientRect();
            const offset = event.clientY - bounding.top - bounding.height / 2;
            if (offset > 0) {
                taskList.insertBefore(draggedRow, closestRow.nextSibling);
            } else {
                taskList.insertBefore(draggedRow, closestRow);
            }
        }
    });

    taskList.addEventListener("drop", () => {
        if (!draggedRow) return;

        const order = Array.from(taskList.querySelectorAll("tr")).map(
            (row, index) => ({ id: row.dataset.taskId, order: index + 1 })
        );

        fetch("/yarungo/tasks/reorder/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrftoken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ order }),
        })
        .then((response) => {
            if (!response.ok) throw new Error("並び替えの保存に失敗しました。");
            return response.json();
        })
        .then((data) => {
            if (!data.success) alert("並び替えの保存中にエラーが発生しました。");
        })
        .catch((error) => console.error("Error:", error));
    });
});
