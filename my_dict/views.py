from django.shortcuts import render
from bs4 import BeautifulSoup
import requests
from .models import WordEn, WordTr, Search
from django.contrib.auth.models import User
import lxml
import cchardet
from django.http import HttpResponse, JsonResponse
from django.views.generic import View, DeleteView
from django.urls import reverse_lazy
import random
from django.contrib.auth.decorators import login_required
import datetime
from django.core.paginator import Paginator
from django.contrib import messages
from allauth.account.views import PasswordResetView

tureng_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
saurus_url = 'https://www.thesaurus.com/browse/{}'


def home(request):
    req_mer = requests.get('https://www.merriam-webster.com/', headers={"User-Agent": "Mozilla/5.0"}).content
    req_ox = requests.get('https://www.oxfordlearnersdictionaries.com/', headers={"User-Agent": "Mozilla/5.0"}).content
    req_lex = requests.get('https://www.lexico.com/', headers={"User-Agent": "Mozilla/5.0"}).content
    req_camb = requests.get('https://dictionary.cambridge.org/', headers={"User-Agent": "Mozilla/5.0"}).content
    soup_mer = BeautifulSoup(req_mer, 'lxml')
    soup_ox = BeautifulSoup(req_ox, 'lxml')
    soup_lex = BeautifulSoup(req_lex, 'lxml')
    soup_camb = BeautifulSoup(req_camb, 'lxml')
    word_mer = soup_mer.find('a', {'class': 'header-wht'}).get_text().strip()
    word_ox = soup_ox.find('a', {'class': 'headword'}).find_next().get_text().strip()
    word_lex = soup_lex.find('a', {'class': 'linkword'}).text.strip()
    word_camb = soup_camb.find('p', {'class': 'wotd-hw'}).find('a').get_text().strip()
    tur_mer = []
    tur_ox = []
    tur_lex = []
    tur_camb = []
    if search_word(word_mer) is not None:
        tur_mer = search_word(word_mer)
    if search_word(word_ox) is not None:
        tur_ox = search_word(word_ox)
    if search_word(word_lex) is not None:
        tur_lex = search_word(word_lex)
    if search_word(word_camb) is not None:
        tur_camb = search_word(word_camb)

    mer_exists = False
    ox_exists = False
    lex_exists = False
    camb_exists = False

    if request.user.is_authenticated:
        mer_exists = WordEn.objects.filter(user=request.user, english=word_mer).exists()
        ox_exists = WordEn.objects.filter(user=request.user, english=word_ox).exists()
        lex_exists = WordEn.objects.filter(user=request.user, english=word_lex).exists()
        camb_exists = WordEn.objects.filter(user=request.user, english=word_camb).exists()

    last_words = []
    starred_words = []
    random_unlearned = []
    random_learned = []
    random_starred = []
    count_unl = []
    count_l = []

    if request.user.is_authenticated:
        unlearned_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_learned=False).values()]
        learned_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_learned=True).values()]
        starred_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_starred=True).values()]
        count_unl.append(len(unlearned_words))
        count_l.append(len(learned_words))
        last_words = WordEn.objects.filter(user=request.user).order_by("-create_time")[:10]
        if len(learned_words) < 10:
            random_ = random.sample(learned_words, len(learned_words))
            random_learned = random_
        else:
            random_ = random.sample(learned_words, k=10)
            random_learned = random_
        if len(unlearned_words) < 10:
            random_ = random.sample(unlearned_words, len(unlearned_words))
            random_unlearned = random_
        else:
            random_ = random.sample(unlearned_words, k=10)
            random_unlearned = random_
        if len(starred_words) < 10:
            random_ = random.sample(starred_words, len(starred_words))
            random_starred = random_
        else:
            random_ = random.sample(starred_words, k=10)
            random_starred = random_

    context = {
        'word_1': word_mer,
        'word_2': word_ox,
        'word_3': word_lex,
        'word_4': word_camb,
        'tur_1': tur_mer,
        'tur_2': tur_ox,
        'tur_3': tur_lex,
        'tur_4': tur_camb,
        'mer_exists': mer_exists,
        'ox_exists': ox_exists,
        'lex_exists': lex_exists,
        'camb_exists': camb_exists,
        'last_words': last_words,
        'rlwords': random_learned,
        'rulwords': random_unlearned,
        'starred_words': starred_words,
        'rstrwords': random_starred,
        'count_unl': count_unl,
        'count_l': count_l,
    }

    return render(request, 'my_dict/home.html', context=context)


def refresh(request):
    unlearned_words = []
    learned_words = []
    starred_words = []
    random_learned = []
    random_unlearned = []
    random_starred = []
    tr_list = []

    if request.user.is_authenticated:
        unlearned_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_learned=False).values()]
        learned_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_learned=True).values()]
        starred_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_starred=True).values()]
    if request.method == "GET":
        if request.GET.get('random-unlearned'):
            if request.GET.get('random-unlearned') == "refresh":
                if len(unlearned_words) < 10:
                    random_ = random.sample(unlearned_words, k=len(unlearned_words))
                    random_unlearned = random_
                else:
                    random_ = random.sample(unlearned_words, k=10)
                    random_unlearned = random_
            else:
                number = int(request.GET.get('random-unlearned'))
                random_ = random.sample(unlearned_words, k=number)
                random_unlearned = random_
                for word in random_:
                    obj = WordEn.objects.get(user=request.user, english=word)
                    tr = [word["turkish"] for word in obj.turkish.all().values()]
                    tr_list.append(tr)
        elif request.GET.get('random-learned'):
            if request.GET.get('random-learned') == "refresh":
                if len(learned_words) < 10:
                    random_ = random.sample(learned_words, k=len(learned_words))
                    random_learned = random_
                else:
                    random_ = random.sample(learned_words, k=10)
                    random_learned = random_
            else:
                number = int(request.GET.get('random-learned'))
                random_ = random.sample(learned_words, k=number)
                random_learned = random_
                for word in random_:
                    obj = WordEn.objects.get(user=request.user, english=word)
                    tr = [word["turkish"] for word in obj.turkish.all().values()]
                    tr_list.append(tr)
        elif request.GET.get('random-starred'):
            if len(starred_words) < 10:
                random_ = random.sample(starred_words, len(starred_words))
                random_starred = random_
            else:
                random_ = random.sample(starred_words, k=10)
                random_starred = random_

    data = {
        'random_unlearned': random_unlearned,
        'random_learned': random_learned,
        'random_starred': random_starred,
        'tr_list': tr_list
    }

    return JsonResponse(data)


def pre_dictionary(request):
    history = []
    if request.user.is_authenticated:
        history = Search.objects.filter(user=request.user).order_by("-create_time")[:20]
        if request.method == "GET":
            word = request.GET.get('q')
            dictionary(request, word)

    context = {
        'last_20_history': history
    }

    return render(request, 'my_dict/dictionary.html', context=context)


def dictionary(request, word):
    data = []
    data_2 = []
    synonym_list = []
    antonym_list = []
    examples = []
    audio = ""
    history = []
    word_exists = False
    error = False
    suggestion_exists = False
    suggestion_list = []
    is_english = True
    if request.user.is_authenticated:
        history = Search.objects.filter(user=request.user).order_by("-create_time")[:20]
        if word:
            if WordEn.objects.filter(user=request.user, english=word).exists():
                word_exists = True
    try:
        url_tur = tureng_url.format(word)
        html_tur = requests.get(url_tur).content
        soup_tur = BeautifulSoup(html_tur, 'lxml')
        tables = soup_tur.find_all('table')
        table = soup_tur.find('table')
        rows = table.find_all('tr')[1:]
        if table.find("th", class_="c2").text == "İngilizce":
            if table.find_next_sibling('h2'):
                if 'teriminin İngilizce Türkçe Sözlükte anlamları' in table.find_next_sibling('h2').text:
                    h2 = table.find_next_sibling('h2')
                    table_tr = h2.find_next_sibling('table')
                    rows_table_tr = table_tr.find_all('tr')[1:]
                    if len(rows_table_tr) > len(rows):
                        is_english = False
                        if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}):
                            if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source'):
                                audio_src = soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
                                audio = audio_src
                        for row in rows_table_tr:
                            if not row.attrs:
                                tds = row.find_all('td')
                                category = tds[1].text.strip()
                                turkish = tds[2].text.strip()
                                english = " ".join(tds[3].text.split()[:-1])
                                data.append([category, turkish, english])
                        for tb in tables:
                            if tb.find("th", class_="c2").text == "Türkçe":
                                if 'teriminin diğer terimlerle kazandığı' in tb.find_previous().find_previous().text:
                                    data_2_rows = tb.find_all('tr')[1:100]
                                    for row in data_2_rows:
                                        if not row.attrs:
                                            tds = row.find_all('td')
                                            category = tds[1].text.strip()
                                            turkish = tds[2].text.strip()
                                            english = " ".join(tds[3].text.split()[:-1])
                                            data_2.append([category, turkish, english])
                    else:
                        if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}):
                            if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source'):
                                audio_src = soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
                                audio = audio_src
                        for row in rows:
                            if not row.attrs:
                                tds = row.find_all('td')
                                category = tds[1].text.strip()
                                english = " ".join(tds[2].text.split()[:-1])
                                turkish = tds[3].text.strip()
                                data.append([category, english, turkish])
                        if word:
                            if request.user.is_authenticated:
                                if not Search.objects.filter(user=request.user, english=word).exists():
                                    create_search = Search.objects.create(user=request.user, english=word)
                                    create_search.save()
                                else:
                                    obj = Search.objects.get(user=request.user, english=word)
                                    obj.create_time = datetime.datetime.now()
                                    obj.save()
                        for tb in tables:
                            if tb.find("th", class_="c2").text == "İngilizce":
                                if 'teriminin diğer terimlerle kazandığı' in tb.find_previous().find_previous().text:
                                    data_2_rows = tb.find_all('tr')[1:100]
                                    for row in data_2_rows:
                                        if not row.attrs:
                                            tds = row.find_all('td')
                                            category = tds[1].text.strip()
                                            english = " ".join(tds[2].text.split()[:-1])
                                            turkish = tds[3].text.strip()
                                            data_2.append([category, english, turkish])
                        try:
                            url_saur = saurus_url.format(word)
                            html_saur = requests.get(url_saur).content
                            soup_saur = BeautifulSoup(html_saur, 'lxml')
                            h2_list = soup_saur.find_all('h2')
                            for h2 in h2_list:
                                if "other words" in h2.text:
                                    synonyms = h2.parent.find_all('li')
                                    for synonym in synonyms:
                                        if synonym.find('a'):
                                            text = synonym.find('a').text
                                            synonym_list.append(text)
                                elif "opposites" in h2.text:
                                    antonyms = h2.parent.find_all('li')
                                    for antonym in antonyms:
                                        if antonym.find('a'):
                                            text = antonym.find('a').text
                                            antonym_list.append(text)
                            example_list = soup_saur.find('div', {'id': 'example-sentences'}).find_all('p')
                            for ex in example_list:
                                examples.append(ex.text)
                        except:
                            pass
                else:
                    if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}):
                        if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source'):
                            audio_src = soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
                            audio = audio_src
                    for row in rows:
                        if not row.attrs:
                            tds = row.find_all('td')
                            category = tds[1].text.strip()
                            english = " ".join(tds[2].text.split()[:-1])
                            turkish = tds[3].text.strip()
                            data.append([category, english, turkish])
                    if word:
                        if request.user.is_authenticated:
                            if not Search.objects.filter(user=request.user, english=word).exists():
                                create_search = Search.objects.create(user=request.user, english=word)
                                create_search.save()
                            else:
                                obj = Search.objects.get(user=request.user, english=word)
                                obj.create_time = datetime.datetime.now()
                                obj.save()
                    for tb in tables:
                        if tb.find("th", class_="c2").text == "İngilizce":
                            if 'teriminin diğer terimlerle kazandığı' in tb.find_previous().find_previous().text:
                                data_2_rows = tb.find_all('tr')[1:100]
                                for row in data_2_rows:
                                    if not row.attrs:
                                        tds = row.find_all('td')
                                        category = tds[1].text.strip()
                                        english = " ".join(tds[2].text.split()[:-1])
                                        turkish = tds[3].text.strip()
                                        data_2.append([category, english, turkish])
                    try:
                        url_saur = saurus_url.format(word)
                        html_saur = requests.get(url_saur).content
                        soup_saur = BeautifulSoup(html_saur, 'lxml')
                        h2_list = soup_saur.find_all('h2')
                        for h2 in h2_list:
                            if "other words" in h2.text:
                                synonyms = h2.parent.find_all('li')
                                for synonym in synonyms:
                                    if synonym.find('a'):
                                        text = synonym.find('a').text
                                        synonym_list.append(text)
                            elif "opposites" in h2.text:
                                antonyms = h2.parent.find_all('li')
                                for antonym in antonyms:
                                    if antonym.find('a'):
                                        text = antonym.find('a').text
                                        antonym_list.append(text)
                        example_list = soup_saur.find('div', {'id': 'example-sentences'}).find_all('p')
                        for ex in example_list:
                            examples.append(ex.text)
                    except:
                        pass
            else:
                if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}):
                    if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source'):
                        audio_src = soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
                        audio = audio_src
                for row in rows:
                    if not row.attrs:
                        tds = row.find_all('td')
                        category = tds[1].text.strip()
                        english = " ".join(tds[2].text.split()[:-1])
                        turkish = tds[3].text.strip()
                        data.append([category, english, turkish])
                if word:
                    if request.user.is_authenticated:
                        if not Search.objects.filter(user=request.user, english=word).exists():
                            create_search = Search.objects.create(user=request.user, english=word)
                            create_search.save()
                        else:
                            obj = Search.objects.get(user=request.user, english=word)
                            obj.create_time = datetime.datetime.now()
                            obj.save()
                try:
                    url_saur = saurus_url.format(word)
                    html_saur = requests.get(url_saur).content
                    soup_saur = BeautifulSoup(html_saur, 'lxml')
                    h2_list = soup_saur.find_all('h2')
                    for h2 in h2_list:
                        if "other words" in h2.text:
                            synonyms = h2.parent.find_all('li')
                            for synonym in synonyms:
                                if synonym.find('a'):
                                    text = synonym.find('a').text
                                    synonym_list.append(text)
                        elif "opposites" in h2.text:
                            antonyms = h2.parent.find_all('li')
                            for antonym in antonyms:
                                if antonym.find('a'):
                                    text = antonym.find('a').text
                                    antonym_list.append(text)
                    example_list = soup_saur.find('div', {'id': 'example-sentences'}).find_all('p')
                    for ex in example_list:
                        examples.append(ex.text)
                except:
                    pass
        elif table.find("th", class_="c2").text == "Türkçe":
            if table.find_next_sibling('h2'):
                if 'teriminin Türkçe İngilizce Sözlükte anlamları' in table.find_next_sibling('h2').text:
                    h2 = table.find_next_sibling('h2')
                    table_en = h2.find_next_sibling('table')
                    rows_table_en = table_en.find_all('tr')[1:]
                    if len(rows_table_en) >= len(rows):
                        if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}):
                            if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source'):
                                audio_src = soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
                                audio = audio_src
                        for row in rows_table_en:
                            if not row.attrs:
                                tds = row.find_all('td')
                                category = tds[1].text.strip()
                                english = " ".join(tds[2].text.split()[:-1])
                                turkish = tds[3].text.strip()
                                data.append([category, english, turkish])
                        for tb in tables:
                            if tb.find("th", class_="c2").text == "İngilizce":
                                if 'teriminin diğer terimlerle kazandığı' in tb.find_previous().find_previous().text:
                                    data_2_rows = tb.find_all('tr')[1:100]
                                    for row in data_2_rows:
                                        if not row.attrs:
                                            tds = row.find_all('td')
                                            category = tds[1].text.strip()
                                            english = " ".join(tds[2].text.split()[:-1])
                                            turkish = tds[3].text.strip()
                                            data_2.append([category, english, turkish])
                        try:
                            url_saur = saurus_url.format(word)
                            html_saur = requests.get(url_saur).content
                            soup_saur = BeautifulSoup(html_saur, 'lxml')
                            h2_list = soup_saur.find_all('h2')
                            for h2 in h2_list:
                                if "other words" in h2.text:
                                    synonyms = h2.parent.find_all('li')
                                    for synonym in synonyms:
                                        if synonym.find('a'):
                                            text = synonym.find('a').text
                                            synonym_list.append(text)
                                elif "opposites" in h2.text:
                                    antonyms = h2.parent.find_all('li')
                                    for antonym in antonyms:
                                        if antonym.find('a'):
                                            text = antonym.find('a').text
                                            antonym_list.append(text)
                            example_list = soup_saur.find('div', {'id': 'example-sentences'}).find_all('p')
                            for ex in example_list:
                                examples.append(ex.text)
                        except:
                            pass
                    else:  # is_turkish
                        is_english = False
                        for row in rows:
                            if not row.attrs:
                                tds = row.find_all('td')
                                category = tds[1].text.strip()
                                turkish = tds[2].text.strip()
                                english = " ".join(tds[3].text.split()[:-1])
                                data.append([category, turkish, english])
                        for tb in tables:
                            if tb.find("th", class_="c2").text == "Türkçe":
                                if 'teriminin diğer terimlerle kazandığı' in tb.find_previous().find_previous().text:
                                    data_2_rows = tb.find_all('tr')[1:100]
                                    for row in data_2_rows:
                                        if not row.attrs:
                                            tds = row.find_all('td')
                                            category = tds[1].text.strip()
                                            turkish = tds[2].text.strip()
                                            english = " ".join(tds[3].text.split()[:-1])
                                            data_2.append([category, turkish, english])
                else:
                    is_english = False
                    for row in rows:
                        if not row.attrs:
                            tds = row.find_all('td')
                            category = tds[1].text.strip()
                            turkish = tds[2].text.strip()
                            english = " ".join(tds[3].text.split()[:-1])
                            data.append([category, turkish, english])
                    for tb in tables:
                        if tb.find("th", class_="c2").text == "Türkçe":
                            if 'teriminin diğer terimlerle kazandığı' in tb.find_previous().find_previous().text:
                                data_2_rows = tb.find_all('tr')[1:100]
                                for row in data_2_rows:
                                    if not row.attrs:
                                        tds = row.find_all('td')
                                        category = tds[1].text.strip()
                                        turkish = tds[2].text.strip()
                                        english = " ".join(tds[3].text.split()[:-1])
                                        data_2.append([category, turkish, english])
            else:  # is_turkish
                is_english = False
                for row in rows:
                    if not row.attrs:
                        tds = row.find_all('td')
                        category = tds[1].text.strip()
                        turkish = tds[2].text.strip()
                        english = " ".join(tds[3].text.split()[:-1])
                        data.append([category, turkish, english])
                for tb in tables:
                    if tb.find("th", class_="c2").text == "Türkçe":
                        if 'teriminin diğer terimlerle kazandığı' in tb.find_previous().find_previous().text:
                            data_2_rows = tb.find_all('tr')[1:100]
                            for row in data_2_rows:
                                if not row.attrs:
                                    tds = row.find_all('td')
                                    if '(' not in tds[1].text or tds[2].text:
                                        category = tds[1].text.strip()
                                        turkish = tds[2].text.strip()
                                        english = " ".join(tds[3].text.split()[:-1])
                                        data_2.append([category, turkish, english])
    except AttributeError:
        url_tur = tureng_url.format(word)
        html_tur = requests.get(url_tur).content
        soup_tur = BeautifulSoup(html_tur, 'lxml')
        if soup_tur.find("ul", class_="suggestion-list"):
            lis = soup_tur.find("ul", class_="suggestion-list").find_all("li")
            for li in lis:
                suggestion_list.append(li.find("a").text)
            suggestion_exists = True
        error = True

    context = {
        'data': data,
        'data_2': data_2,
        'word': word,
        'audio': audio,
        'synonyms': synonym_list[:3],
        'antonyms': antonym_list[:3],
        'examples': examples[:3],
        'last_20_history': history,
        'word_exists': word_exists,
        'error': error,
        'suggestion_exists': suggestion_exists,
        'suggestion_list': suggestion_list,
        'is_english': is_english
    }

    return render(request, 'my_dict/dictionary.html', context=context)


@login_required
def my_word_list(request):
    learned_words = WordEn.objects.filter(user=request.user, is_learned=True)
    unlearned_words = WordEn.objects.filter(user=request.user, is_learned=False)
    learned_count = len(learned_words)
    unlearned_count = len(unlearned_words)

    if request.method == 'POST':
        if "english-unl" in request.POST:
            word_en = request.POST.get('english-unl')
            word_tr_list = request.POST.getlist('turkish-unl[]')
            if not WordEn.objects.filter(user=request.user, english=word_en).exists():
                create_word_en = WordEn(user=request.user, english=word_en)
                create_word_en.save()
                for word_tr in word_tr_list:
                    if word_tr.strip() != "":
                        create_word_tr = create_word_en.turkish.create(turkish=word_tr)
                        create_word_tr.save()
                is_added = True
            else:
                is_added = False
            data = {'is_added': is_added}
            return JsonResponse(data)
        elif "english-l" in request.POST:
            word_en = request.POST.get('english-l')
            word_tr_list = request.POST.getlist('turkish-l[]')
            if not WordEn.objects.filter(user=request.user, english=word_en).exists():
                create_word_en = WordEn(user=request.user, english=word_en, is_learned=True)
                create_word_en.save()
                for word_tr in word_tr_list:
                    if word_tr.strip() != "":
                        create_word_tr = create_word_en.turkish.create(turkish=word_tr)
                        create_word_tr.save()
                is_added = True
            else:
                is_added = False
            data = {'is_added': is_added}
            return JsonResponse(data)
    elif request.method == "GET":
        word = request.GET.get("q")
        my_word_list_search(request, word)

    paginator_unl = Paginator(unlearned_words, 10)
    page_no_unl = request.GET.get('s')
    page_unl = paginator_unl.get_page(page_no_unl)
    paginator_l = Paginator(learned_words, 10)
    page_no_l = request.GET.get('p')
    page_l = paginator_l.get_page(page_no_l)

    context = {
        'page_obj_unl': page_unl,
        'page_obj_l': page_l,
        'learned_words': learned_words,
        'unlearned_words': unlearned_words,
        'learned_count': learned_count,
        'unlearned_count': unlearned_count,
    }

    return render(request, 'my_dict/word_list.html', context=context)


@login_required
def my_word_list_search(request, word):
    unlearned_words = WordEn.objects.filter(user=request.user, is_learned=False)
    learned_words = WordEn.objects.filter(user=request.user, is_learned=True)
    learned_count = len(learned_words)
    unlearned_count = len(unlearned_words)
    word_unl = list()
    word_l = list()
    if word:
        if '$favorites' in word:
            word_unl = WordEn.objects.filter(user=request.user, is_learned=False, is_starred=True)
            word_l = WordEn.objects.filter(user=request.user, is_learned=True, is_starred=True)
        else:
            word_unl = WordEn.objects.filter(user=request.user, english__contains=word, is_learned=False)
            word_l = WordEn.objects.filter(user=request.user, english__contains=word, is_learned=True)
    paginator_unl = Paginator(word_unl, 10)
    page_no_unl = request.GET.get('s')
    page_unl = paginator_unl.get_page(page_no_unl)
    paginator_l = Paginator(word_l, 10)
    page_no_l = request.GET.get('p')
    page_l = paginator_l.get_page(page_no_l)

    context = {
        'page_obj_unl': page_unl,
        'page_obj_l': page_l,
        'learned_words': learned_words,
        'unlearned_words': unlearned_words,
        'learned_count': learned_count,
        'unlearned_count': unlearned_count,
        'unl_pg_count': len(word_unl),
        'l_pg_count': len(word_l),
        'word': word
    }

    return render(request, 'my_dict/word_list.html', context=context)


def ajax_search(request):
    if 'q' in request.GET:
        words = list()
        all_words = WordEn.objects.filter(user=request.user, english__contains=request.GET.get("q"))
        for word in all_words:
            words.append(word.english)

        return JsonResponse(words, safe=False)


def search_word(word):
    pre_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
    plus_added_search = '+'.join(str(word).split())
    url = pre_url.format(str(plus_added_search))
    html = requests.get(url).content
    soup = BeautifulSoup(html, 'lxml')
    table = soup.find('table')
    try:
        rows = table.find_all('tr')[1:]
        audio_and_tr = []

        for row in rows:
            if not row.attrs:
                tds = row.find_all('td')
                tr = tds[3].text.strip()
                audio_and_tr.append(tr)

        if soup.find('audio', {'id': 'turengVoiceENTRENus'}):
            if soup.find('audio', {'id': 'turengVoiceENTRENus'}).find('source'):
                audio = soup.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
                audio_and_tr.append(audio)

        if audio_and_tr:
            return audio_and_tr[0], audio_and_tr[-1]
    except AttributeError:
        return None


def word_cd(request):
    if request.method == "GET":
        word_en = request.GET['word_en']
        word_tr_list = request.GET.getlist('tr[]')

        if not WordEn.objects.filter(user=request.user, english=word_en).exists():
            try:
                audio_src = request.GET['audio']
                create_word_en = WordEn(user=request.user, english=word_en, audio=audio_src)
                create_word_en.save()
                for word_tr in word_tr_list:
                    create_word_tr = create_word_en.turkish.create(turkish=word_tr)
                    create_word_tr.save()
            except:
                create_word_en = WordEn(user=request.user, english=word_en)
                create_word_en.save()
        else:
            WordEn.objects.filter(user=request.user, english=word_en).delete()

    return HttpResponse()


class DelSeenLearned(View):
    def get(self, request):
        word_id = request.GET.get('id')
        word = WordEn.objects.get(user=request.user, id=word_id)
        is_seen = False
        is_learned = False
        is_deleted = False
        is_starred = False
        if request.GET.get('seen'):
            if not word.is_seen:
                word.is_seen = True
                word.save()
                is_seen = True
            else:
                word.is_seen = False
                word.save()
                is_seen = False
        elif request.GET.get('learned'):
            word.is_learned = True
            word.save()
            is_learned = True
        elif request.GET.get('unlearned'):
            word.is_learned = False
            word.save()
        elif request.GET.get('starred'):
            if not word.is_starred:
                word.is_starred = True
                word.save()
                is_starred = True
            else:
                word.is_starred = False
                word.save()
                is_starred = False
        elif request.GET.get('delete'):
            word.delete()
            is_deleted = True

        data = {
            'seen': is_seen,
            'learned': is_learned,
            'unlearned': is_learned,
            'starred': is_starred,
            'deleted': is_deleted
        }

        return JsonResponse(data)


def error_404_view(request, exception):
    return render(request, 'my_dict/404.html')