document.addEventListener("DOMContentLoaded", () => {
    const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;

    document.querySelectorAll(".incomplete-task-btn").forEach(button => {
        button.addEventListener("click", event => {
            const taskRow = event.target.closest("tr");
            const taskId = taskRow.dataset.taskId;

            const confirmIncomplete = confirm("このタスクを未完了に戻しますか？");
            if (!confirmIncomplete) return;

            fetch(`/tasks/${taskId}/complete_ajax/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrftoken,
                    "Content-Type": "application/json",
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("未完了リクエストに失敗しました。");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success && !data.completed) {
                        taskRow.remove();
                    } else {
                        alert(`エラー: ${data.error}`);
                    }
                })
                .catch(error => {
                    console.error("サーバーエラー:", error);
                });
        });
    });
});
