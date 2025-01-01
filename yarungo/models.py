from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser
import uuid


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # メールフィールドを追加
    """カスタムユーザーモデル"""
    pass


class Task(models.Model):

    PRIORITY_CHOICES = [
    (1, '低い'),
    (5, '普通'),
    (10, '高い'),
]
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey('yarungo.CustomUser', on_delete=models.CASCADE, related_name='tasks')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=5)
    sort_order = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'due_date']

    def __str__(self):
        return self.title

    def mark_as_completed(self):
        """タスクとサブタスクを完了状態にする"""
        self.completed_at = now()
        self.save()
        self.subtasks.update(completed_at=now())

    def mark_as_deleted(self):
        """タスクとサブタスクを論理削除する"""
        self.deleted_at = now()
        self.save(update_fields=['deleted_at'])
        self.subtasks.update(deleted_at=now())  # サブタスクも削除

    def swap_sort_order(self, other_task):
        """別のタスクと並び順を交換"""
        self.sort_order, other_task.sort_order = other_task.sort_order, self.sort_order
        self.save(update_fields=['sort_order'])
        other_task.save(update_fields=['sort_order'])

    def get_priority_css_class(self):
        if self.priority >= 8:
            return 'priority-high'
        elif 4 <= self.priority < 8:
            return 'priority-medium'
        elif self.priority < 4:
            return 'priority-low'
        return ''