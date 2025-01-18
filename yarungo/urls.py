from django.urls import path
from django.contrib.auth import views as auth_views
from .views import (
    SignUpView,
    TaskListView,
    CompletedTaskListView,
    TaskCreateView,
    TaskUpdateView,
    TaskDeleteAjaxView,
    TaskCompleteAjaxView,
    TaskReorderAjaxView,
    TaskCompleteWithComplimentAjaxView,
)

urlpatterns = [
    # 認証関連
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),

    # ルートURL
    path('', TaskListView.as_view(), name='home'),

    # タスク関連
    path('tasks/', TaskListView.as_view(), name='task_list'),
    path('tasks/completed/', CompletedTaskListView.as_view(), name='completed_tasks'),
    path('tasks/create/', TaskCreateView.as_view(), name='task_create'),
    path('tasks/<int:pk>/update/', TaskUpdateView.as_view(), name='task_update'),
    path('tasks/<int:pk>/delete_ajax/', TaskDeleteAjaxView.as_view(), name='task_delete_ajax'),
    path('tasks/<int:pk>/complete_ajax/', TaskCompleteAjaxView.as_view(), name='task_complete_ajax'),
    path('tasks/<int:pk>/generate_compliment_ajax/', TaskCompleteWithComplimentAjaxView.as_view(), name='generate_compliment_ajax'),
    path('tasks/reorder/', TaskReorderAjaxView.as_view(), name='task_reorder'),
]
