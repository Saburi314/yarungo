from django.db import models

class Task(models.Model):
    PRIORITY_CHOICES = [
        (1, '1 - 最優先'),
        (2, '2 - 高'),
        (3, '3 - 中'),
        (4, '4 - 低'),
        (5, '5 - 最低'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)  # null と blank を許可
    due_date = models.DateTimeField(null=True, blank=True)  # null と blank を許可
    is_completed = models.BooleanField(default=False)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3, null=True, blank=True)  # null と blank を許可

    def __str__(self):
        return f"{self.title} - 優先順位: {self.get_priority_display()}"

    def get_priority_color(self):
        """ 優先順位に応じて色を返す """
        if self.priority == 1:
            return 'red'  # 最優先
        elif self.priority == 2:
            return 'orange'  # 高
        elif self.priority == 3:
            return 'yellow'  # 中
        elif self.priority == 4:
            return 'blue'  # 低
        elif self.priority == 5:
            return 'green'  # 最低
        return 'white'  # デフォルト
