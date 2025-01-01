from django.shortcuts import redirect
from django.views.generic import ListView, CreateView, UpdateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.timezone import now
from .models import Task
from .forms import CustomUserCreationForm
from django.urls import reverse_lazy
from django.views.generic import CreateView
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    template_name = 'registration/signup.html'
    success_url = reverse_lazy('login')  # ログインページにリダイレクト

    def form_invalid(self, form):
        print("エラー内容:", form.errors)  # サーバーログにエラーを出力
        print("入力データ:", form.cleaned_data)  # クリーン済みデータを出力
        return super().form_invalid(form)


class TaskListView(LoginRequiredMixin, ListView):
    model = Task
    template_name = 'tasks/task_list.html'
    context_object_name = 'tasks'

    def get_queryset(self):
        return Task.objects.filter(
            user=self.request.user,
            parent__isnull=True,
            deleted_at__isnull=True,
            completed_at__isnull=True  # 完了済みタスクを除外
        ).order_by('sort_order')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['now'] = now()  # 現在時刻をテンプレートに渡す
        return context

class TaskCreateView(LoginRequiredMixin, CreateView):
    model = Task
    fields = ['title', 'description', 'due_date', 'priority', 'parent']
    template_name = 'tasks/task_form.html'

    def form_valid(self, form):
        form.instance.user = self.request.user
        form.instance.sort_order = Task.objects.filter(
            user=self.request.user, parent__isnull=True
        ).count() + 1
        form.save()
        return redirect('task_list')

class TaskUpdateView(LoginRequiredMixin, UpdateView):
    model = Task
    fields = ['title', 'description', 'due_date', 'priority']
    template_name = 'tasks/task_form.html'

    def form_valid(self, form):
        form.save()
        return redirect('task_list')

class TaskDeleteAjaxView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        task_id = kwargs.get('pk')
        try:
            task = get_object_or_404(Task, id=task_id, user=request.user)
            task.mark_as_deleted()  # 論理削除
            return JsonResponse({'success': True, 'task_id': task_id})
        except Task.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Task not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

class TaskCompleteAjaxView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        task_id = self.kwargs.get('pk')
        try:
            task = get_object_or_404(Task, id=task_id, user=self.request.user)
            if task.completed_at:
                task.completed_at = None  # 完了を解除
                completed = False
            else:
                task.completed_at = now()  # 完了日時を設定
                completed = True
            task.save(update_fields=['completed_at'])
            return JsonResponse({'success': True, 'completed': completed})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)


class CompletedTaskListView(LoginRequiredMixin, ListView):
    model = Task
    template_name = 'tasks/completed_task_list.html'
    context_object_name = 'tasks'

    def get_queryset(self):
        return Task.objects.filter(
            user=self.request.user,
            completed_at__isnull=False,
            deleted_at__isnull=True
        )
