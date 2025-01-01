// document.addEventListener('DOMContentLoaded', () => {
//     const taskList = document.getElementById('task-list');
//     if (taskList) {
//         Sortable.create(taskList, {
//             animation: 150,
//             onEnd: async (evt) => {
//                 const taskIds = [...taskList.children].map((row) => row.dataset.taskId);
//                 try {
//                     const response = await fetch('/api/reorder_tasks/', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                             'X-CSRFToken': getCSRFToken(),
//                         },
//                         body: JSON.stringify({ order: taskIds }),
//                     });
//                     if (!response.ok) {
//                         alert('並び替えの保存に失敗しました。');
//                     }
//                 } catch (error) {
//                     console.error('Error:', error);
//                     alert('通信エラーが発生しました。');
//                 }
//             },
//         });
//     }
// });

// function getCSRFToken() {
//     const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
//     return csrfToken ? csrfToken.value : '';
// }
