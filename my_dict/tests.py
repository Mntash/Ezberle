from django.test import TestCase
from bs4 import BeautifulSoup
import lxml
import cchardet


class SearchTurengTests(TestCase):
    tureng_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
    saurus_url = 'https://www.thesaurus.com/browse/{}'
    data_tur = []

    def test_tureng_search(self, word):
        tureng_search = self.tureng_url.format(word)

    test_tureng_search("word")

