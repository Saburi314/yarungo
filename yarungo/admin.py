from django.contrib import admin
from .models import CustomUser, Task

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'uuid', 'is_staff']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'title', 'user', 'priority', 'due_date', 'get_is_completed', 'get_is_deleted']
    list_filter = ['priority', 'due_date', 'completed_at', 'deleted_at']
    search_fields = ['title', 'description']

    def get_is_completed(self, obj):
        return obj.is_completed
    get_is_completed.boolean = True
    get_is_completed.short_description = '完了'

    def get_is_deleted(self, obj):
        return obj.deleted_at is not None
    get_is_deleted.boolean = True
    get_is_deleted.short_description = '削除済み'
