from django.urls import path
from django.contrib.auth import views as auth_views
from .views import (
    TaskListView,
    CompletedTaskListView,
    TaskCreateView,
    TaskUpdateView,
    TaskDeleteView,
    TaskDetailView,
    TaskReorderAPI,
)

urlpatterns = [
    # 認証関連
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='tasks/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),

    # メインタスク
    path('tasks/', TaskListView.as_view(), name='task_list'),
    path('tasks/completed/', CompletedTaskListView.as_view(), name='completed_tasks'),
    path('tasks/create/', TaskCreateView.as_view(), name='task_create'),
    path('tasks/<int:pk>/update/', TaskUpdateView.as_view(), name='task_update'),
    path('tasks/<int:pk>/delete/', TaskDeleteView.as_view(), name='task_delete'),

    # タスク並び替えAPI
    path('tasks/reorder/', TaskReorderAPI.as_view(), name='task_reorder'),

    # ルートURLをタスク一覧に設定
    path('', TaskListView.as_view(), name='home'),
]
