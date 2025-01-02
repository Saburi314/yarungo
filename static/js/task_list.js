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
document.querySelectorAll('.reorder-btn').forEach(button => {
    button.addEventListener('click', event => {
        const taskId = event.target.dataset.taskId;
        const direction = event.target.dataset.direction;

        fetch("/yarungo/tasks/reorder/", {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task_id: taskId, direction: direction }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Reorder failed');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert(data.error || '並び順の変更に失敗しました。');
            }
        })
        .catch(error => console.error('Error:', error));
    });
});
