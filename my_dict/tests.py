from django.test import TestCase
from bs4 import BeautifulSoup
import lxml
import cchardet


class SearchTurengTests(TestCase):
    tureng_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
    saurus_url = 'https://www.thesaurus.com/browse/{}'
    data_tur = []

    def test_tureng_search(self, word):
        response = self.client.get(self.tureng_url.format(word))
        self.assertEquals(response.status_code, 200)

    test_tureng_search("word")

