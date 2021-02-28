from django.utils import timezone
from .models import WordOfTheDay, Profile
from bs4 import BeautifulSoup
import requests
import lxml
import cchardet


def reset_quiz():
    profiles = Profile.objects.all()
    for p in profiles:
        p.is_quiz_unlearned_finished = False
        p.is_quiz_learned_finished = False
        p.save()
