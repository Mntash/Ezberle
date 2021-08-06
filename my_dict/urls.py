from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import path
from django.views.generic.base import RedirectView
from .views import *

urlpatterns = [
    path('', main_home),
    path('anasayfa', home, name='home'),
    path('sözlük/', dictionary, name='dictionary'),
    path('sözlük/q=<path:word>/', dictionary_search, name='dictionary-search'),
    path('kelime_listesi/', my_word_list, name='word-list'),
    path('kelime_listesi/q=<path:word>/', my_word_list_search, name='word-list-search'),
    path('kelime_listesi/ajax_search/', ajax_search, name='autocomplete'),
    path('word_cd/', word_cd, name="word-cd"),
    path('crud/delete/', DelSeenLearnedStarred.as_view(), name='del-word'),
    path('word_is_seen/', DelSeenLearnedStarred.as_view(), name='is-seen'),
    path('word_is_learned/', DelSeenLearnedStarred.as_view(), name='is-learned'),
    path('word_is_starred/', DelSeenLearnedStarred.as_view(), name='is-starred'),
    path('quiz_and_refresh/', quiz_and_refresh, name='quiz-and-refresh'),
    path('search/', ajax_search, name="search"),
    path('complete_quiz/', complete_quiz, name='complete-quiz'),
    path("favicon.ico", RedirectView.as_view(url=staticfiles_storage.url("favicon.ico")),),
    path('reminder/', reminder_cd, name="reminder"),
    path('get_reminder/', get_reminder_list, name="get-reminder"),
    path('open_reminder/', open_reminder, name="open-reminder"),
    path('save_quiz/', save_quiz, name="save-quiz"),
    path('get_count/', get_word_count_and_quiz_rights, name="get-count"),
    path('ajax_word_info/', ajax_word_info, name="ajax-word-info"),
    path('get_achievs/', get_achievs, name="get-achievs"),
    path('prg_tracker/', prg_tracker, name="prg-tracker"),
    path('shop_preview/', shop_preview, name="shop-preview"),
    path('shop_purchase/', shop_purchase, name="shop-purchase"),
    path('get_customization/', get_customization, name="get-customization"),
    path('customization/', customization, name="customization"),
    path('save_feedback/', save_feedback, name="save-feedback"),
    path('word_list_ajax_search/', word_list_ajax_search, name="ajax-search"),
    path('api/category_products/<str:search>', api_get_category_products),
    path('api/category_list/', api_get_categories),
    path('api/search_results/<str:search>/', api_get_search_results)
]