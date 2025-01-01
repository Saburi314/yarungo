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
        ('lowest', '最低'),
        ('low', '低'),
        ('normal', '通常'),
        ('high', '高'),
        ('highest', '最高'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey('yarungo.CustomUser', on_delete=models.CASCADE, related_name='tasks')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
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
        self.subtasks.update(deleted_at=now())
