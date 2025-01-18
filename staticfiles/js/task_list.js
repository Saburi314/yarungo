document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    let draggedElement = null;
    let isDragging = false;

    // ドラッグ開始
    taskList.addEventListener('dragstart', (e) => {
        draggedElement = e.target.closest('tr');
        if (draggedElement) {
            console.log('Drag started on:', draggedElement);
            isDragging = true;
            setTimeout(() => draggedElement.classList.add('dragging'), 0);
        }
    });

    // ドラッグ中
    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetRow = e.target.closest('tr');
        if (targetRow && draggedElement !== targetRow) {
            const bounding = targetRow.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            const midpoint = bounding.height / 2;
            taskList.insertBefore(draggedElement, offset > midpoint ? targetRow.nextSibling : targetRow);
        }
    });

    // ドラッグ終了
    taskList.addEventListener('dragend', () => {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            isDragging = false;
            draggedElement = null;

            // 並び替え後の順序をサーバーに送信
            const orderData = Array.from(taskList.children).map((row, index) => ({
                id: row.dataset.taskId,
                order: index + 1,
            }));

            fetch('/tasks/reorder/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ order: orderData }),
            }).catch(console.error);
        }
    });

    // スマホ用タッチイベント
    let touchStartY = 0;
    taskList.addEventListener('touchstart', (e) => {
        const reorderHandle = e.target.closest('.reorder-column');

        if (!reorderHandle) {
            console.log('Touch prevented: Not on reorder-column');
            return;
        }

        draggedElement = e.target.closest('tr');
        if (draggedElement) {
            touchStartY = e.touches[0].clientY;
            isDragging = true;
        }
    });

    taskList.addEventListener('touchmove', (e) => {
        if (!draggedElement) return;
        const touchY = e.touches[0].clientY;
        const targetRow = document.elementFromPoint(e.touches[0].clientX, touchY)?.closest('tr');

        if (targetRow && draggedElement !== targetRow) {
            const bounding = targetRow.getBoundingClientRect();
            const offset = touchY - bounding.top;
            const midpoint = bounding.height / 2;
            taskList.insertBefore(draggedElement, offset > midpoint ? targetRow.nextSibling : targetRow);
        }
        e.preventDefault(); // スクロール防止
    });

    taskList.addEventListener('touchend', () => {
        if (draggedElement) {
            isDragging = false;
            draggedElement = null;

            // 並び替え後の順序をサーバーに送信
            const orderData = Array.from(taskList.children).map((row, index) => ({
                id: row.dataset.taskId,
                order: index + 1,
            }));

            fetch('/tasks/reorder/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ order: orderData }),
            }).catch(console.error);
        }
    });

    // 完了・削除ボタンのクリック処理
    taskList.addEventListener('click', (e) => {
        if (isDragging) return;

        const completeButton = e.target.closest('.complete-task-btn');
        const deleteButton = e.target.closest('.delete-task-btn');
        const taskRow = e.target.closest('tr');

        if (completeButton) handleCompleteTask(completeButton, taskRow);
        if (deleteButton) handleDeleteTask(deleteButton, taskRow);
    });

    // タスク完了処理
    function handleCompleteTask(button, row) {
        const taskId = row.dataset.taskId;

        if (!confirm('このタスクを完了にしますか？')) return;

        // 完了処理リクエスト
        fetch(`/tasks/${taskId}/complete_ajax/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    console.error('Error in complete_ajax:', data.error);
                    throw new Error(data.error);
                });
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                // タスクを削除
                row.remove();

                // ChatGPTから褒め言葉を取得
                return fetch(`/tasks/${taskId}/generate_compliment_ajax/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'Content-Type': 'application/json',
                    },
                });
            } else {
                console.error('Unexpected response in complete_ajax:', data);
                throw new Error('Unexpected response in complete_ajax');
            }
        })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    console.error('Error in generate_compliment_ajax:', data.error);
                    throw new Error(data.error);
                });
            }
            return response.json();
        })
        .then((chatData) => {
            if (chatData.success) {
                // 褒め言葉を表示
                showCompliment(chatData.compliment);
            } else {
                console.error('Unexpected response in generate_compliment_ajax:', chatData);
            }
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            alert('エラーが発生しました。詳細を確認してください。');
        });
    }

    function showCompliment(message) {
        // 既存の褒め言葉ポップアップがある場合は削除
        const existingToast = document.querySelector('.compliment-toast');
        if (existingToast) {
            existingToast.remove();
        }
    
        // 褒め言葉ポップアップの作成
        const complimentDiv = document.createElement('div');
        complimentDiv.className = 'compliment-toast';
        complimentDiv.textContent = message;
        document.body.appendChild(complimentDiv);
    
        // アニメーションの追加
        setTimeout(() => complimentDiv.classList.add('show'), 0);
    
        // 一定時間後に非表示にして削除
        setTimeout(() => {
            complimentDiv.classList.remove('show');
            setTimeout(() => complimentDiv.remove(), 300);
        }, 4000); // 5秒間表示
    }    

    // タスク削除処理
    function handleDeleteTask(button, row) {
        const taskId = row.dataset.taskId;
        if (!confirm('このタスクを削除しますか？')) return;

        fetch(`/tasks/${taskId}/delete_ajax/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) row.remove();
        })
        .catch(console.error);
    }

    // CSRFトークン取得
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    }
});
