from django.shortcuts import redirect
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.timezone import now
from .models import Task
from .forms import CustomUserCreationForm
from django.urls import reverse_lazy
from django.views.generic import CreateView

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
            deleted_at__isnull=True
        ).order_by('sort_order')

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

class TaskDeleteView(LoginRequiredMixin, DeleteView):
    model = Task

    def delete(self, request, *args, **kwargs):
        task = self.get_object()
        task.mark_as_deleted()
        return redirect('task_list')

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
