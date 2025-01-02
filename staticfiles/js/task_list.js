function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const csrftoken = getCookie('csrftoken');

// 削除ボタン非同期処理
document.querySelectorAll('.delete-task-btn').forEach(button => {
    button.addEventListener('click', event => {
        const taskId = event.target.closest('button').dataset.taskId;

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
    });
});

// 完了ボタン非同期処理
document.querySelectorAll('.complete-task-btn').forEach(button => {
    button.addEventListener('click', event => {
        const taskRow = event.target.closest('tr');
        const taskId = taskRow.dataset.taskId;

        const confirmComplete = confirm("このタスクを完了にしますか？");
        if (!confirmComplete) return;

        fetch(`/yarungo/tasks/${taskId}/complete_ajax/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('完了リクエストに失敗しました。');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const icon = button.querySelector('i');
                if (data.completed) {
                    icon.classList.remove('far', 'text-secondary');
                    icon.classList.add('fas', 'text-success');
                } else {
                    icon.classList.remove('fas', 'text-success');
                    icon.classList.add('far', 'text-secondary');
                }
            } else {
                alert(`エラー: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('サーバーエラー:', error);
        });
    });
});

// 並び替えボタン非同期処理
document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");

    let draggedRow = null;

    // ドラッグ開始イベント
    taskList.addEventListener("dragstart", (event) => {
        const dragHandle = event.target.closest(".drag-handle"); // ドラッグハンドルを確認
        if (!dragHandle) {
            event.preventDefault(); // ドラッグを禁止
            return;
        }

        draggedRow = dragHandle.closest("tr"); // 親行を取得
        if (draggedRow) {
            draggedRow.style.opacity = 0.5; // 視覚的なフィードバック
        }
    });

    // ドラッグ終了イベント
    taskList.addEventListener("dragend", () => {
        if (draggedRow) {
            draggedRow.style.opacity = ""; // 元に戻す
            draggedRow = null;
        }
    });

    // ドラッグオーバーイベント
    taskList.addEventListener("dragover", (event) => {
        event.preventDefault();
        const closestRow = event.target.closest("tr"); // ドラッグ対象の行
        if (closestRow && closestRow !== draggedRow) {
            const bounding = closestRow.getBoundingClientRect();
            const offset = event.clientY - bounding.top - bounding.height / 2;
            if (offset > 0) {
                taskList.insertBefore(draggedRow, closestRow.nextSibling); // 次の行の下に挿入
            } else {
                taskList.insertBefore(draggedRow, closestRow); // 現在の行の上に挿入
            }
        }
    });

    // ドロップイベント
    taskList.addEventListener("drop", () => {
        if (!draggedRow) return;

        // 並び替え後の順序を取得
        const order = Array.from(taskList.querySelectorAll("tr")).map(
            (row, index) => ({ id: row.dataset.taskId, order: index + 1 })
        );

        // サーバーに送信
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

