from django.contrib import admin
from .models import *


class WotdTrInline(admin.TabularInline):
    model = WotdTr
    extra = 0


class WotdEnAdmin(admin.ModelAdmin):
    fieldsets = [
        ("English", {"fields": ["english"]}),
        ("Audio", {"fields": ["audio"]}),
        ("Website", {"fields": ["website"]}),
    ]
    inlines = [WotdTrInline]


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
    search_fields = ['user__username']


class AchievementDetailInline(admin.TabularInline):
    model = AchievementDetail
    extra = 0


class AchievementsAdmin(admin.ModelAdmin):
    fieldsets = [
        ("Başarı", {"fields": ["text"]})
    ]
    inlines = [AchievementDetailInline]


class SearchAdmin(admin.ModelAdmin):
    search_fields = ['search', 'user__username']


class WordDbAdmin(admin.ModelAdmin):
    search_fields = ['english']


class QuizRecorderAdmin(admin.ModelAdmin):
    search_fields = ['user__username']


class WordEnAdmin(admin.ModelAdmin):
    search_fields = ['user__username']

#
# class ReminderSubscriptionAdmin(admin.ModelAdmin):
#     search_fields = ['email']
#
# admin.site.register(ReminderSubscription)
admin.site.register(Feedback)
admin.site.register(WordEn, WordEnAdmin)
admin.site.register(QuizRecorder, QuizRecorderAdmin)
admin.site.register(Search, SearchAdmin)
admin.site.register(WordDb, WordDbAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Achievements, AchievementsAdmin)
admin.site.register(ShopProducts, ShopProductsAdmin)
admin.site.register(WotdEn, WotdEnAdmin)

admin.site.site_title = "Site Yönetimi"
admin.site.site_header = "Ezberle"
admin.site.index_title = "Ezberle"



