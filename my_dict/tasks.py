from django.utils import timezone
from .models import WordOfTheDay
from bs4 import BeautifulSoup
import requests
import lxml
import cchardet


def delete_wotd():
    return 5 + 15
    # one_day = timezone.now() - timezone.timedelta(days=1)
    # expired_words = WordOfTheDay.objects.filter(
    #     create_time__lte=one_day
    # )
    # expired_words.delete()