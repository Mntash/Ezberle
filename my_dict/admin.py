from django.contrib import admin
from .models import *

admin.site.register(WordEn)
admin.site.register(WotdEn)
admin.site.register(Search)
admin.site.register(QuizRecorder)
admin.site.register(WordDb)
admin.site.register(Feedback)

class ShopProductsAdmin(admin.ModelAdmin):
    list_filter = (
        ('type',)
    )
    ordering = ['type']
    search_fields = ['text']


class AchievTrackerInline(admin.TabularInline):
    model = AchievementTracker
    extra = 0


class ProductTrackerInline(admin.TabularInline):
    model = ProductTracker
    extra = 0


class ProfileAdmin(admin.ModelAdmin):
    fieldsets = [
        ("Kullanıcı", {"fields": ["user"]}),
        ("Biliyor muydun? quiz'ine giriş hakları:", {"fields": ["quiz_db_rights"]}),
        ("Öğreneceğim Kelimeler quiz'ine giriş hakları:", {"fields": ["quiz_unl_rights"]}),
        ("Öğrendiğim Kelimeler quiz'ine giriş hakları:", {"fields": ["quiz_l_rights"]}),
        ("Hatırlatıcı bugün açıldı mı?", {"fields": ["open_reminder_daily"]}),
        ("Hatırlatıcıya eklediği kelimelerin sayısı", {"fields": ["reminder_count"]}),
        ("Sahip olduğu Ezber Coin'i", {"fields": ["coin"]}),
        ("Menü arka planını değiştir", {"fields": ["custom_navbar_color"]}),
        ("Arka planı değiştir", {"fields": ["custom_background_color"]}),
        ("Arka plan resmini değiştir", {"fields": ["custom_background_image"]}),
    ]
    inlines = [AchievTrackerInline, ProductTrackerInline]


class AchievementDetailInline(admin.TabularInline):
    model = AchievementDetail
    extra = 0


class AchievementsAdmin(admin.ModelAdmin):
    fieldsets = [
        ("Başarı", {"fields": ["text"]})
    ]
    inlines = [AchievementDetailInline]


admin.site.register(Profile, ProfileAdmin)
admin.site.register(Achievements, AchievementsAdmin)
admin.site.register(ShopProducts, ShopProductsAdmin)




