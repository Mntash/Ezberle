from django.test import TestCase
from bs4 import BeautifulSoup
import lxml
import cchardet
import requests


class SearchTurengTests(TestCase):
    tureng_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
    saurus_url = 'https://www.thesaurus.com/browse/{}'
    data_tur = []

    def test_tureng_search(self):
        response = self.client.get(self.tureng_url.format("word"))
        # self.assertEquals(response.status_code, 200)
        html_tur = requests.get(self.tureng_url.format("asdghj")).content
        soup_tur = BeautifulSoup(html_tur, 'lxml')
        self.assertTrue(soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}))





