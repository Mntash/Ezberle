from django.db import models
from django.contrib.auth.models import User
from model_utils import FieldTracker
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_quiz_db_finished = models.BooleanField(default=False)
    is_quiz_unlearned_finished = models.BooleanField(default=False)
    is_quiz_learned_finished = models.BooleanField(default=False)
    open_reminder_daily = models.BooleanField(default=False)
    reminder_count = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class WordEn(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    english = models.CharField(max_length=100)
    audio = models.CharField(max_length=300)
    create_time = models.DateTimeField(auto_now_add=True)
    is_learned = models.BooleanField(default=False)
    is_seen = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)
    is_in_reminder_list = models.BooleanField(default=False)

    memorize_tracker = FieldTracker(fields=['is_learned'])

    def save(self, *args, **kw):
        if self.english:
            if self.memorize_tracker.changed():
                self.create_time = timezone.now()
        super().save(*args, **kw)

    class Meta:
        ordering = ['-create_time']

    def __str__(self):
        return self.english


class WordTr(models.Model):
    english = models.ForeignKey(WordEn, on_delete=models.CASCADE, null=True, related_name="turkish")
    turkish = models.CharField(max_length=100)


class Search(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    search = models.CharField(max_length=100, null=True)
    create_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.search


class WotdEn(models.Model):
    english = models.CharField(max_length=100, null=True)
    audio = models.CharField(max_length=300, null=True)
    website = models.CharField(max_length=50, null=True)

    def __str__(self):
        return self.english


class WotdTr(models.Model):
    english = models.ForeignKey(WotdEn, on_delete=models.CASCADE, null=True, related_name="turkish")
    turkish = models.CharField(max_length=100)

    def __str__(self):
        return self.turkish


class QuizRecorder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    english = models.CharField(max_length=100)
    is_db = models.BooleanField(default=False)
    is_learned = models.BooleanField(default=False)
    is_correct = models.BooleanField(default=False)


class WordDb(models.Model):
    english = models.CharField(max_length=50)
    is_in_reminder_list = models.BooleanField(default=False)

    def __str__(self):
        return self.english

