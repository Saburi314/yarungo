from django.http import JsonResponse
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.shortcuts import redirect
from django.contrib import messages
from .models import Task
from django.urls import reverse_lazy
from .forms import CustomUserCreationForm


class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    template_name = 'tasks/signup.html'
    success_url = reverse_lazy('login')  # サインアップ後のリダイレクト先


# タスク並び替えAPI
class TaskReorderAPI(View):
    def post(self, request, *args, **kwargs):
        import json
        data = json.loads(request.body.decode('utf-8'))
        task_order = data.get('order', [])

        for index, task_id in enumerate(task_order):
            Task.objects.filter(id=task_id).update(sort_order=index)
        return JsonResponse({'status': 'success'})


# メインタスク一覧
class TaskListView(ListView):
    model = Task
    template_name = 'tasks/task_list.html'
    context_object_name = 'tasks'

    def get_queryset(self):
        user_filter = self.request.user if self.request.user.is_authenticated else None
        return Task.objects.filter(
            parent__isnull=True,
            deleted_at__isnull=True,  # 論理削除されていないデータを取得
            user=user_filter
        ).order_by('sort_order')



# 完了タスク一覧
class CompletedTaskListView(ListView):
    model = Task
    template_name = 'tasks/completed_task_list.html'
    context_object_name = 'tasks'

    def get_queryset(self):
        user_filter = self.request.user if self.request.user.is_authenticated else None
        return Task.objects.filter(
            parent__isnull=True,
            deleted_at__isnull=True,  # 論理削除されていないデータを取得
            completed_at__isnull=False,
            user=user_filter
        ).order_by('sort_order')



# タスク詳細
class TaskDetailView(DetailView):
    model = Task
    template_name = 'tasks/task_detail.html'
    context_object_name = 'task'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['subtasks'] = self.object.subtasks.filter(deleted_at__isnull=True)
        return context


# タスク作成
class TaskCreateView(CreateView):
    model = Task
    fields = ['title', 'description', 'due_date', 'priority', 'parent']
    template_name = 'tasks/task_form.html'

    def form_valid(self, form):
        form.instance.user = self.request.user if self.request.user.is_authenticated else None
        form.instance.sort_order = Task.objects.filter(parent__isnull=True).count() + 1
        form.save()
        messages.success(self.request, "タスクが正常に作成されました。")
        return redirect('task_list')


# タスク更新
class TaskUpdateView(UpdateView):
    model = Task
    fields = ['title', 'description', 'due_date', 'priority']
    template_name = 'tasks/task_form.html'

    def form_valid(self, form):
        task = form.save(commit=False)
        if 'is_completed' in self.request.POST:
            task.mark_as_completed()
        task.save()
        messages.success(self.request, "タスクが更新されました。")
        return redirect('task_list')


# タスク削除
class TaskDeleteView(DeleteView):
    model = Task
    template_name = 'tasks/task_confirm_delete.html'
    success_url = reverse_lazy('task_list')

    def delete(self, request, *args, **kwargs):
        task = self.get_object()
        task.mark_as_deleted()  # 論理削除
        messages.success(request, f"タスク '{task.title}' が削除されました（論理削除）。")
        return redirect(self.success_url)

