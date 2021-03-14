from django.shortcuts import render
from bs4 import BeautifulSoup
import requests
from .models import *
from django.contrib.auth.models import User
import lxml
import cchardet
from django.http import HttpResponse, JsonResponse
from django.views.generic import View
import random
from django.contrib.auth.decorators import login_required
import datetime
from django.core.paginator import Paginator

tureng_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
saurus_url = 'https://www.thesaurus.com/browse/{}'


def home(request):
    word_mer = WotdEn.objects.get(website="Merriam")
    word_ox = WotdEn.objects.get(website="Oxford")
    word_dict = WotdEn.objects.get(website="Dictionary")
    word_camb = WotdEn.objects.get(website="Cambridge")

    mer_exists = False
    ox_exists = False
    dict_exists = False
    camb_exists = False

    if request.user.is_authenticated:
        mer_exists = WordEn.objects.filter(user=request.user, english=word_mer.english).exists()
        ox_exists = WordEn.objects.filter(user=request.user, english=word_ox.english).exists()
        dict_exists = WordEn.objects.filter(user=request.user, english=word_dict.english).exists()
        camb_exists = WordEn.objects.filter(user=request.user, english=word_camb.english).exists()

    last_words = []
    random_db = []
    random_unlearned = []
    random_learned = []

    if request.user.is_authenticated:
        last_words = WordEn.objects.filter(user=request.user).order_by("-create_time")[:10]
        db_words = [word["english"] for word in WordDb.objects.all().values()]
        unlearned_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_learned=False).values()]
        learned_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_learned=True).values()]

        random_ = random.sample(db_words, k=10)
        random_db = random_
        if len(unlearned_words) < 10:
            random_ = random.sample(unlearned_words, len(unlearned_words))
            random_unlearned = random_
        else:
            random_ = random.sample(unlearned_words, k=10)
            random_unlearned = random_
        if len(learned_words) < 10:
            random_ = random.sample(learned_words, len(learned_words))
            random_learned = random_
        else:
            random_ = random.sample(learned_words, k=10)
            random_learned = random_

    is_quiz_db_finished = False
    is_quiz_unl_finished = False
    is_quiz_l_finished = False

    if request.user.is_authenticated:
        if Profile.objects.get(user_id=request.user.id).is_quiz_db_finished:
            is_quiz_db_finished = True
        if Profile.objects.get(user_id=request.user.id).is_quiz_unlearned_finished:
            is_quiz_unl_finished = True
        if Profile.objects.get(user_id=request.user.id).is_quiz_learned_finished:
            is_quiz_l_finished = True

    show_reminder_notif = False
    open_reminder_daily = False
    reminder_count = ""
    if request.user.is_authenticated:
        pre_reminder_count = Profile.objects.get(user_id=request.user.id).reminder_count
        new_reminder_count = len(WordEn.objects.filter(user=request.user, is_in_reminder_list=True))
        prof = Profile.objects.get(user_id=request.user.id)
        prof.reminder_count = new_reminder_count
        reminder_count = new_reminder_count
        prof.save()
        if new_reminder_count > pre_reminder_count:
            show_reminder_notif = True
        open_reminder_daily = Profile.objects.get(user_id=request.user.id).open_reminder_daily

    context = {
        'word_mer': word_mer,
        'word_ox': word_ox,
        'word_dict': word_dict,
        'word_camb': word_camb,
        'mer_exists': mer_exists,
        'ox_exists': ox_exists,
        'dict_exists': dict_exists,
        'camb_exists': camb_exists,
        'last_words': last_words,
        'random_db': random_db,
        'random_unl': random_unlearned,
        'random_l': random_learned,
        'is_quiz_db_finished': is_quiz_db_finished,
        'is_quiz_unl_finished': is_quiz_unl_finished,
        'is_quiz_l_finished': is_quiz_l_finished,
        'open_reminder_daily': open_reminder_daily,
        'show_reminder_notif': show_reminder_notif,
        'reminder_count': reminder_count,
    }

    return render(request, 'my_dict/home.html', context=context)


def refresh(request):
    db_words = []
    unlearned_words = []
    learned_words = []
    random_db = []
    random_unlearned = []
    random_learned = []
    tr_list = []

    if request.user.is_authenticated:
        db_words = [word["english"] for word in WordDb.objects.all().values()]
        unlearned_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_learned=False).values()]
        learned_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_learned=True).values()]

    if request.method == "GET":
        if request.GET.get('random-db'):
            if request.GET.get('random-db') == "refresh":
                random_ = random.sample(db_words, k=10)
                random_db = random_
            else:
                number = int(request.GET.get('random-db'))
                random_ = random.sample(db_words, k=number)
                random_db = random_
                for word in random_:
                    tr_list.append(search_word(word))
        elif request.GET.get('random-unlearned'):
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

    data = {
        'random_db': random_db,
        'random_unlearned': random_unlearned,
        'random_learned': random_learned,
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
    example_list = []
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
                                if not Search.objects.filter(user=request.user, search=word).exists():
                                    create_search = Search.objects.create(user=request.user, search=word)
                                    create_search.save()
                                else:
                                    obj = Search.objects.get(user=request.user, search=word)
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
                                    synonyms = h2.parent.find_next_sibling().find_all('li')
                                    for synonym in synonyms:
                                        if synonym.find('a'):
                                            text = synonym.find('a').text
                                            synonym_list.append(text)
                                elif "opposites" in h2.text:
                                    antonyms = h2.parent.find_next_sibling().find_all('li')
                                    for antonym in antonyms:
                                        if antonym.find('a'):
                                            text = antonym.find('a').text
                                            antonym_list.append(text)
                                elif "EXAMPLE SENTENCES" in h2.text:
                                    examples = h2.next_siblings
                                    for example in examples:
                                        text = example.find('span').text
                                        example_list.append(text)
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
                            if not Search.objects.filter(user=request.user, search=word).exists():
                                create_search = Search.objects.create(user=request.user, search=word)
                                create_search.save()
                            else:
                                obj = Search.objects.get(user=request.user, search=word)
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
                                synonyms = h2.parent.find_next_sibling().find_all('li')
                                for synonym in synonyms:
                                    if synonym.find('a'):
                                        text = synonym.find('a').text
                                        synonym_list.append(text)
                            elif "opposites" in h2.text:
                                antonyms = h2.parent.find_next_sibling().find_all('li')
                                for antonym in antonyms:
                                    if antonym.find('a'):
                                        text = antonym.find('a').text
                                        antonym_list.append(text)
                            elif "EXAMPLE SENTENCES" in h2.text:
                                examples = h2.next_siblings
                                for example in examples:
                                    text = example.find('span').text
                                    example_list.append(text)
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
                        if not Search.objects.filter(user=request.user, search=word).exists():
                            create_search = Search.objects.create(user=request.user, search=word)
                            create_search.save()
                        else:
                            obj = Search.objects.get(user=request.user, search=word)
                            obj.create_time = datetime.datetime.now()
                            obj.save()
                try:
                    url_saur = saurus_url.format(word)
                    html_saur = requests.get(url_saur).content
                    soup_saur = BeautifulSoup(html_saur, 'lxml')
                    h2_list = soup_saur.find_all('h2')
                    for h2 in h2_list:
                        if "other words" in h2.text:
                            synonyms = h2.parent.find_next_sibling().find_all('li')
                            for synonym in synonyms:
                                if synonym.find('a'):
                                    text = synonym.find('a').text
                                    synonym_list.append(text)
                        elif "opposites" in h2.text:
                            antonyms = h2.parent.find_next_sibling().find_all('li')
                            for antonym in antonyms:
                                if antonym.find('a'):
                                    text = antonym.find('a').text
                                    antonym_list.append(text)
                        elif "EXAMPLE SENTENCES" in h2.text:
                            examples = h2.next_siblings
                            for example in examples:
                                text = example.find('span').text
                                example_list.append(text)
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
                                    synonyms = h2.parent.find_next_sibling().find_all('li')
                                    for synonym in synonyms:
                                        if synonym.find('a'):
                                            text = synonym.find('a').text
                                            synonym_list.append(text)
                                elif "opposites" in h2.text:
                                    antonyms = h2.parent.find_next_sibling().find_all('li')
                                    for antonym in antonyms:
                                        if antonym.find('a'):
                                            text = antonym.find('a').text
                                            antonym_list.append(text)
                                elif "EXAMPLE SENTENCES" in h2.text:
                                    examples = h2.next_siblings
                                    for example in examples:
                                        text = example.find('span').text
                                        example_list.append(text)
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
        'examples': example_list[:3],
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


def reminder_cd(request):
    is_added = False
    if request.method == "GET":
        word = request.GET.get("word")
        if request.GET.get("add 2 reminder"):
            obj = WordEn.objects.get(user=request.user, english=word)
            obj.is_in_reminder_list = True
            obj.save()
        elif request.GET.get("remove from reminder"):
            obj = WordEn.objects.get(user=request.user, english=word)
            obj.is_in_reminder_list = False
            obj.save()
        elif request.GET.get("is_added"):
            obj = WordEn.objects.get(user=request.user, english=word)
            if obj.is_in_reminder_list:
                is_added = True
    data = {
        'is_added': is_added
    }

    return JsonResponse(data=data)


def error_404_view(request, exception):
    return render(request, 'my_dict/404.html')


def complete_quiz(request):
    if request.method == "POST":
        if request.POST.get('quiz-db'):
            obj = Profile.objects.get(user_id=request.user.id)
            obj.is_quiz_db_finished = True
            obj.save()
        elif request.POST.get('quiz-unl'):
            obj = Profile.objects.get(user_id=request.user.id)
            obj.is_quiz_unlearned_finished = True
            obj.save()
        if request.POST.get('quiz-l'):
            obj = Profile.objects.get(user_id=request.user.id)
            obj.is_quiz_learned_finished = True
            obj.save()

    return HttpResponse('')


def get_reminder_list(request):
    reminder_list = []
    quiz_db = []
    quiz_unl = []
    quiz_l = []
    if request.method == "GET":
        words = WordEn.objects.filter(user=request.user, is_in_reminder_list=True)
        for word in words:
            reminder_list.append(word.english)
        obj_db = QuizRecorder.objects.filter(user=request.user, is_db=True)
        for obj in obj_db:
            quiz_db.append(
                {
                  'english': obj.english,
                  'is_correct': obj.is_correct
                }
            )
        obj_unl = QuizRecorder.objects.filter(user=request.user, is_learned=False)
        for obj in obj_unl:
            quiz_unl.append(
                {
                  'english': obj.english,
                  'is_correct': obj.is_correct
                }
            )
        obj_l = QuizRecorder.objects.filter(user=request.user, is_learned=True)
        for obj in obj_l:
            quiz_l.append(
                {
                  'english': obj.english,
                  'is_correct': obj.is_correct
                }
            )

    data = {
        'reminder_list': reminder_list,
        'quiz_db': quiz_db,
        'quiz_unl': quiz_unl,
        'quiz_l': quiz_l
    }

    return JsonResponse(data=data)


def open_reminder(request):
    if request.method == "GET":
        obj = Profile.objects.get(user_id=request.user.id)
        obj.open_reminder_daily = True
        obj.save()

    return HttpResponse("")


def save_quiz(request):
    if request.method == "POST":
        if request.POST.get("quiz_db"):
            QuizRecorder.objects.filter(user=request.user, is_db=True).delete()
            correct_list = request.POST.getlist("correct_list[]")
            incorrect_list = request.POST.getlist("incorrect_list[]")
            for cor in correct_list:
                obj = QuizRecorder.objects.create(user=request.user, english=cor, is_db=True, is_correct=True)
                obj.save()
            for incor in incorrect_list:
                obj = QuizRecorder.objects.create(user=request.user, english=incor, is_db=True, is_correct=False)
                obj.save()
        elif request.POST.get("quiz_unl"):
            QuizRecorder.objects.filter(user=request.user, is_learned=False).delete()
            correct_list = request.POST.getlist("correct_list[]")
            incorrect_list = request.POST.getlist("incorrect_list[]")
            for cor in correct_list:
                obj = QuizRecorder.objects.create(user=request.user, english=cor, is_learned=False, is_correct=True)
                obj.save()
            for incor in incorrect_list:
                obj = QuizRecorder.objects.create(user=request.user, english=incor, is_learned=False, is_correct=False)
                obj.save()
        elif request.POST.get("quiz_l"):
            QuizRecorder.objects.filter(user=request.user, is_learned=True).delete()
            correct_list = request.POST.getlist("correct_list[]")
            incorrect_list = request.POST.getlist("incorrect_list[]")
            for cor in correct_list:
                obj = QuizRecorder.objects.create(user=request.user, english=cor, is_learned=True, is_correct=True)
                obj.save()
            for incor in incorrect_list:
                obj = QuizRecorder.objects.create(user=request.user, english=incor, is_learned=True, is_correct=False)
                obj.save()

    return HttpResponse("")


def get_word_count(request):
    if request.method == "GET":
        if request.GET.get('count_unl'):
            obj_unl = WordEn.objects.filter(user=request.user, is_learned=False)
            count_unl = len(obj_unl)
            return JsonResponse(data={'count_unl': count_unl})
        if request.GET.get('count_l'):
            obj_l = WordEn.objects.filter(user=request.user, is_learned=True)
            count_l = len(obj_l)
            return JsonResponse(data={'count_l': count_l})


def search_word(word):
    pre_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
    plus_added_search = '+'.join(str(word).split())
    url = pre_url.format(str(plus_added_search))
    html = requests.get(url).content
    soup = BeautifulSoup(html, 'lxml')

    try:
        table = soup.find('table')
        rows = table.find_all('tr')[1:]
        tr_list = []
        for row in rows:
            if not row.attrs:
                tds = row.find_all('td')
                tr = tds[3].text.strip()
                tr_list.append(tr)
        return tr_list
    except:
        return None


def ev(request):
    return render(request, 'my_dict/ev.html', context={})