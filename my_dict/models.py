from django.db import models
from django.contrib.auth.models import User
from model_utils import FieldTracker
from django.utils import timezone


class WordEn(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    english = models.CharField(max_length=100)
    audio = models.CharField(max_length=300)
    create_time = models.DateTimeField(auto_now_add=True)
    is_learned = models.BooleanField(default=False)
    is_seen = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)

    memorize_tracker = FieldTracker(fields=['is_learned'])

    def save(self, *args, **kw):
        if self.english:
            if self.memorize_tracker.changed():
                self.create_time = timezone.now()
        super().save(*args, **kw)

    class Meta:
        ordering = ['-create_time']


class WordTr(models.Model):
    english = models.ForeignKey(WordEn, on_delete=models.CASCADE, null=True, related_name="turkish")
    turkish = models.CharField(max_length=100)


class Search(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    english = models.CharField(max_length=100, null=True)
    create_time = models.DateTimeField(auto_now=True)


class WordOfTheDay(models.Model):
    english = models.CharField(max_length=100, null=True)
    turkish = models.CharField(max_length=100, null=True)
    create_time = models.DateTimeField(auto_now=True)


