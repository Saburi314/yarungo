function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const csrftoken = getCookie('csrftoken');

// 完了ボタン非同期処理
document.querySelectorAll('.complete-task-btn').forEach(button => {
    button.addEventListener('click', event => {
        const taskRow = event.target.closest('tr');
        const taskId = taskRow.dataset.taskId;
        const isCompleted = button.dataset.completed === "true";

        // 完了の場合は確認ダイアログを表示
        if (!isCompleted) {
            if (!confirm("このタスクを完了にしますか？")) return;
        }

        fetch(`/tasks/${taskId}/complete_ajax/`, {
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
                    // タスクを完了に変更
                    icon.classList.remove('far', 'text-secondary');
                    icon.classList.add('fas', 'text-success');
                    button.dataset.completed = "true";
                    taskRow.remove(); // 完了済みの場合はリストから削除
                } else {
                    // タスクを未完了に戻す（確認ダイアログなし）
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
    });
});

// 削除ボタン非同期処理
document.querySelectorAll('.delete-task-btn').forEach(button => {
    button.addEventListener('click', event => {
        const taskId = event.target.closest('button').dataset.taskId;

        const isConfirmed = confirm('このタスクを削除しますか？');
        if (!isConfirmed) return;

        fetch(`/tasks/${taskId}/delete_ajax/`, {
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

// 並び替えボタン非同期処理
document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('task-list');

    let draggedElement = null;
    let touchStartY = 0;

    function handleDragStart(e) {
        if (e.target.classList.contains('drag-handle')) {
            draggedElement = e.target.closest('tr');
            e.dataTransfer.effectAllowed = 'move';
        } else {
            e.preventDefault();
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        const targetRow = e.target.closest('tr');
        if (targetRow && draggedElement !== targetRow) {
            const bounding = targetRow.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            const midpoint = bounding.height / 2;
            if (offset > midpoint) {
                taskList.insertBefore(draggedElement, targetRow.nextSibling);
            } else {
                taskList.insertBefore(draggedElement, targetRow);
            }
        }
    }

    function handleTouchStart(e) {
        const touchTarget = e.target;
        if (touchTarget.classList.contains('drag-handle')) {
            draggedElement = touchTarget.closest('tr');
            touchStartY = e.touches[0].clientY;
        } else {
            draggedElement = null;
        }
    }

    function handleTouchMove(e) {
        if (!draggedElement) return;

        const touchY = e.touches[0].clientY;
        const targetRow = document.elementFromPoint(e.touches[0].clientX, touchY)?.closest('tr');

        if (targetRow && draggedElement !== targetRow) {
            const bounding = targetRow.getBoundingClientRect();
            const offset = touchY - bounding.top;
            const midpoint = bounding.height / 2;
            if (offset > midpoint) {
                taskList.insertBefore(draggedElement, targetRow.nextSibling);
            } else {
                taskList.insertBefore(draggedElement, targetRow);
            }
        }
    }

    function handleTouchEnd() {
        if (draggedElement) {
            draggedElement = null;

            // 並び替え後の順序を取得してサーバーに送信
            const orderData = Array.from(taskList.children).map((row, index) => ({
                id: row.dataset.taskId,
                order: index + 1,
            }));

            fetch('/tasks/reorder/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
                body: JSON.stringify({ order: orderData }),
            }).then(response => {
                if (!response.ok) {
                    console.error('Reorder failed');
                }
            });
        }
    }

    taskList.addEventListener('dragstart', handleDragStart);
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('dragend', handleTouchEnd);

    taskList.addEventListener('touchstart', handleTouchStart);
    taskList.addEventListener('touchmove', handleTouchMove);
    taskList.addEventListener('touchend', handleTouchEnd);
});







