from django.test import TestCase
from bs4 import BeautifulSoup
from .models import *
from django.contrib.auth.models import User

import lxml
import cchardet
import requests
import json


class SearchTurengTests(TestCase):
    tureng_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
    saurus_url = 'https://www.thesaurus.com/browse/{}'

    def setUp(self):
        self.p = User.objects.create_user(username='test123', email='zxcqwebnmasd@hotmail.com', password='test123')
        self.p.save()

    def test_tureng_search(self):
        word_list = ["work", "akışkan", "hale", "asdghj", "perple"]
        for i, word in enumerate(word_list):
            tureng_url_formatted = self.tureng_url.format(word)
            response = self.client.get(tureng_url_formatted)
            self.assertEquals(response.status_code, 200)
            html_tur = requests.get(tureng_url_formatted).content
            soup_tur = BeautifulSoup(html_tur, 'lxml')
            if i == 0:
                create_search = Search.objects.create(user=self.p, search=word)
                create_search.save()
                obj_search = Search.objects.get(user=self.p, search=word)
                self.assertTrue(obj_search)
                create_word = WordEn(user=self.p, english=word)
                create_word.save()
                obj_word = WordEn.objects.filter(user=self.p, english=word)
                self.assertTrue(obj_word)
                WordEn.objects.filter(user=self.p, english=word).delete()
                self.assertFalse(WordEn.objects.filter(user=self.p, english=word))
                tables = soup_tur.find_all('table')
                for table in tables:
                    self.assertTrue(table['id'], 'englishResultsTable')
                self.assertTrue(soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}))
                self.assertEquals(len(tables), 2)

                # Thesaurus -> Synonyms // Antonyms // Examples
                url_saur = self.saurus_url.format(word)
                html_saur = requests.get(url_saur).content
                soup_saur = BeautifulSoup(html_saur, 'lxml')
                self.assertTrue(soup_saur.find('div', id='meanings'))
                self.assertTrue(soup_saur.find('div', id='antonyms'))
                self.assertTrue(soup_saur.find('div', id='example-sentences'))

            if i == 2:
                tables = soup_tur.find_all('table')
                self.assertEquals(len(tables), 3)
            if i == 3:
                h_text = soup_tur.find('h1').text
                self.assertIn('Aradığınız', h_text)
            if i == 4:
                self.assertTrue(soup_tur.find("ul", class_="suggestion-list"))


class WordsOfTheDayTests(TestCase):
    def test_daily_words(self):
        req_mer = requests.get('https://www.merriam-webster.com/', headers={"User-Agent": "Mozilla/5.0"}).content
        req_ox = requests.get('https://www.oxfordlearnersdictionaries.com/',
                              headers={"User-Agent": "Mozilla/5.0"}).content
        req_dict = requests.get('https://www.dictionary.com/', headers={"User-Agent": "Mozilla/5.0"}).content
        req_vocab = requests.get('https://www.vocabulary.com/dictionary/',
                                 headers={"User-Agent": "Mozilla/5.0"}).content
        soup_mer = BeautifulSoup(req_mer, 'lxml')
        soup_ox = BeautifulSoup(req_ox, 'lxml')
        soup_dict = BeautifulSoup(req_dict, 'lxml')
        soup_vocab = BeautifulSoup(req_vocab, 'lxml')
        response_mer = self.client.get('https://www.merriam-webster.com/')
        self.assertEquals(response_mer.status_code, 200)
        response_ox = self.client.get('https://www.oxfordlearnersdictionaries.com/')
        self.assertEquals(response_ox.status_code, 200)
        response_dict = self.client.get('https://www.dictionary.com/')
        self.assertEquals(response_dict.status_code, 200)
        response_vocab = self.client.get('https://www.vocabulary.com/dictionary/')
        self.assertEquals(response_vocab.status_code, 200)
        word_mer = soup_mer.find('a', {'class': 'header-wht'}).text.strip()
        word_ox = soup_ox.find('a', {'class': 'headword'}).find_next().text.strip()
        word_dict = soup_dict.find('span', {'class': 'colored-card-heading'}).text.strip()
        word_vocab = soup_vocab.find('h2', {'class': 'dynamictext'}).find('a').text.strip()
        self.assertTrue(word_mer)
        self.assertTrue(word_ox)
        self.assertTrue(word_dict)
        self.assertTrue(word_vocab)


class WordsApiTest(TestCase):
    def test_words_api(self):
        words_api_suc = "https://wordsapiv1.p.rapidapi.com/words/work"
        headers = {
            'x-rapidapi-key': "c5cbdceae4msh740bd52ea8d5e8bp1f6881jsn7c651aa39638",
            'x-rapidapi-host': "wordsapiv1.p.rapidapi.com"
        }
        response = requests.request("GET", words_api_suc, headers=headers)
        self.assertEquals(response.status_code, 200)
        self.assertTrue('success' not in json.loads(response.text))

        words_api_fail = "https://wordsapiv1.p.rapidapi.com/words/iyi"
        response = requests.request("GET", words_api_fail, headers=headers)
        self.assertEquals(response.status_code, 404)
        self.assertTrue('success' in json.loads(response.text))


class WordCountAndQuizRightsTest(TestCase):
    def setUp(self):
        self.p = User.objects.create_user(username='test123', email='zxcqwebnmasd@hotmail.com', password='test123')
        self.p.save()

    def test_count_words_and_quiz_rights(self):
        # Quiz Db rights
        prof = Profile.objects.get(user=self.p)
        quiz_rights_db = prof.quiz_db_rights
        self.assertTrue(quiz_rights_db)

        # Quiz Unlearned words counts and quiz rights
        add_word_unl = WordEn(user=self.p, english="work", is_learned=False)
        add_word_unl.save()
        add_word_tr = add_word_unl.turkish.create(turkish="iş")
        add_word_tr.save()
        quiz_rights_unl = prof.quiz_unl_rights
        self.assertTrue(quiz_rights_unl)
        count_unl = WordEn.objects.filter(user=self.p, is_learned=False).count()
        self.assertTrue(count_unl)

        # Quiz Learned words counts and quiz rights
        add_word_l = WordEn(user=self.p, english="word", is_learned=True)
        add_word_l.save()
        add_word_tr = add_word_l.turkish.create(turkish="kelime")
        add_word_tr.save()
        quiz_rights_l = prof.quiz_l_rights
        self.assertTrue(quiz_rights_l)
        count_l = WordEn.objects.filter(user=self.p, is_learned=True).count()
        self.assertTrue(count_l)


class ApiTest(TestCase):
    def test_get_categories(self):
        afyoresel_url = "https://www.afyoresel.com"
        request = requests.get(afyoresel_url, headers={"User-Agent": "Mozilla/5.0"}).content
        soup = BeautifulSoup(request, 'lxml')
        response = self.client.get(request)
        self.assertEquals(response.status_code, 200)
        find_category_ul = soup.find('ul', id='ResimliMenu1')
        self.assertTrue(find_category_ul)
        self.assertTrue(find_category_ul.find_all('li'))
        find_categories = find_category_ul.find_all('li')
        category_list = []

        for cat in find_categories:
            category_name = cat.find('a').text
            category_list.append({
                'category_name': category_name
            })
        self.assertTrue(len(category_list) > 1)

    def test_get_category_and_search_results(self):
        url_list = [
            "https://www.afyoresel.com/{}",
            "https://www.afyoresel.com/Arama?1&kelime={}"
        ]
        for url in url_list:
            if 'Arama' in url:
                formatted_url = url.format('sucuk')
            else:
                formatted_url = url.format('lokum-cesitleri')
            request = requests.get(formatted_url, headers={"User-Agent": "Mozilla/5.0"}).content
            soup = BeautifulSoup(request, 'lxml')
            response = self.client.get(request)
            self.assertEquals(response.status_code, 200)
            find_products = soup.find_all('div', class_='ItemOrj')
            self.assertTrue(find_products)
            product_list = []

            for prod in find_products:
                prod_image = prod.find("div", class_='productImage')
                self.assertTrue(prod_image)
                link = prod_image.find("a").get("href")
                self.assertTrue(link)
                image = prod_image.find("img").get("data-original")
                self.assertTrue(image)
                title = prod_image.find("img").get("alt")
                self.assertTrue(title)
                price = prod.find('div', class_='productPrice')
                self.assertTrue(price)
                old_price = ''
                new_price = ''
                if price.find('div', class_='regularPrice'):
                    old_price = prod.find('div', class_='regularPrice').find('span').text
                    self.assertTrue(old_price)
                if price.find('div', class_='discountPrice'):
                    new_price = prod.find('div', class_='discountPrice').find('span').text
                    self.assertTrue(new_price)

                product_list.append({
                    'link': f'afyoresel.com{link}',
                    'image': f'afyoresel.com{image}',
                    'title': title,
                    'old_price': old_price,
                    'new_price': new_price
                })

            self.assertTrue(len(product_list) >= 1)

