from django.db import models
from django.contrib.auth.models import User
from model_utils import FieldTracker
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    quiz_db_rights = models.PositiveIntegerField(default=1)
    quiz_unl_rights = models.PositiveIntegerField(default=1)
    quiz_l_rights = models.PositiveIntegerField(default=1)
    open_reminder_daily = models.BooleanField(default=False)
    reminder_count = models.IntegerField(default=0)
    coin = models.IntegerField(default=0)
    custom_navbar_color = models.CharField(max_length=100, null=True, blank=True, default="teal")
    custom_background_color = models.CharField(max_length=100, null=True, blank=True, default="teal")
    custom_background_image = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name_plural = "Profiller"


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
    is_new_in_reminder_list = models.BooleanField(default=False)

    memorize_tracker = FieldTracker(fields=['is_learned'])

    def save(self, *args, **kw):
        if self.english:
            if self.memorize_tracker.changed():
                self.create_time = timezone.now()
        super().save(*args, **kw)

    class Meta:
        ordering = ['-create_time']
        verbose_name_plural = "İngilizce Kelimeler"

    def __str__(self):
        return f'{self.user} --- {self.english}'


class WordTr(models.Model):
    english = models.ForeignKey(WordEn, on_delete=models.CASCADE, null=True, related_name="turkish")
    turkish = models.CharField(max_length=100)

    def __str__(self):
        return self.turkish


class Search(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    search = models.CharField(max_length=100, null=True)
    create_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user} --- {self.search}'

    class Meta:
        verbose_name_plural = "Aramalar"


class WotdEn(models.Model):
    english = models.CharField(max_length=100, null=True)
    audio = models.CharField(max_length=300, null=True)
    website = models.CharField(max_length=50, null=True)

    def __str__(self):
        return self.english

    class Meta:
        verbose_name_plural = "Günün Kelimeleri"


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
    create_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.is_db:
            return f"{self.user} -- Database -- {self.english}"
        if self.is_learned:
            return f"{self.user} -- Öğrendiklerim -- {self.english}"
        if not self.is_learned:
            return f"{self.user} -- Öğreneceklerim -- {self.english}"

    class Meta:
        verbose_name_plural = "Quiz kayıtları"


class WordDb(models.Model):
    english = models.CharField(max_length=50)
    is_in_reminder_list = models.BooleanField(default=False)

    def __str__(self):
        return self.english

    class Meta:
        verbose_name_plural = "Database Kelimeleri"


class Achievements(models.Model):
    text = models.TextField(max_length=250)

    def __str__(self):
        return self.text

    class Meta:
        verbose_name_plural = "Başarılar"


class AchievementDetail(models.Model):
    ach_original = models.ForeignKey(Achievements, on_delete=models.CASCADE, related_name="details")
    text = models.TextField(max_length=250)
    coin_value = models.IntegerField(default=0)
    is_daily = models.BooleanField(default=False)
    achiev_no = models.IntegerField(default=0)
    progress_max = models.IntegerField(default=0)

    def __str__(self):
        return self.text


class AchievementTracker(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True)
    achiev_no = models.IntegerField(default=0)
    progress_current = models.PositiveIntegerField(default=0)
    progress_star = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.profile} - {self.achiev_no}"


def create_achievement_tracker(sender, **kwargs):
    profile = kwargs["instance"]
    if kwargs["created"]:
        for x in range(1, 17):
            obj = AchievementTracker(profile=profile, achiev_no=x)
            obj.save()


post_save.connect(create_achievement_tracker, sender=Profile)


class ShopProducts(models.Model):
    product_types = [
        ("clr", 'Renk'),
        ("bg-img", 'Arka plan resim'),
        ("rights", 'Haklar')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    text = models.TextField()
    price = models.IntegerField(default=0)
    type = models.CharField(max_length=15, choices=product_types, default='Renk')
    color = models.CharField(max_length=30, null=True, blank=True)
    background_image = models.ImageField(null=True, blank=True, upload_to='static/img')

    def __str__(self):
        return self.text

    class Meta:
        verbose_name_plural = "Market Ürünleri"


class ProductTracker(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    text = models.TextField(default="")
    type = models.CharField(max_length=30, default="")
    color = models.CharField(max_length=30, null=True, blank=True)
    background_image = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.profile} --- {self.text}"


class Feedback(models.Model):
    isim = models.CharField(max_length=25)
    soyisim = models.CharField(max_length=25)
    mesaj = models.TextField(max_length=2500)

    def __str__(self):
        return f"{self.isim} {self.soyisim} --- {self.mesaj}"

    class Meta:
        verbose_name_plural = "Geri Bildirimler"


class ReminderSubscription(models.Model):
    email = models.EmailField()

    def __str__(self):
        return f"{self.email}"

    class Meta:
        verbose_name_plural = "Hatırlatıcıya Abone Olanlar"

