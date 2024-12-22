from django.db import models
from django.contrib.auth.models import AbstractUser
from django.urls import reverse
import uuid
from django.utils.timezone import now

class CustomUser(AbstractUser):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    def __str__(self):
        return self.username

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('lowest', '最低'),
        ('low', '低'),
        ('normal', '通常'),
        ('high', '高'),
        ('highest', '最高'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  # タスク固有のUUID
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    completed_at = models.DateTimeField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sort_order = models.PositiveIntegerField(default=0)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)  # ログインユーザーが関連付けられる場合
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subtasks')

    def __str__(self):
        return self.title

    @property
    def is_completed(self):
        return self.completed_at is not None

    def get_priority_color(self):
        colors = {
            'lowest': 'blue',
            'low': 'green',
            'normal': 'white',
            'high': 'orange',
            'highest': 'red',
        }
        return colors.get(self.priority, 'white')

    def get_absolute_url(self):
        return reverse('task_detail', args=[str(self.id)])

    def mark_as_completed(self):
        self.completed_at = now()
        self.save()

    def mark_as_deleted(self):
        self.deleted_at = now()
        self.save(update_fields=['deleted_at']) 

    class Meta:
        ordering = ['sort_order', 'created_at']
