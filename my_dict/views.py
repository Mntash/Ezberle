from django.shortcuts import render, redirect
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
import json
from .forms import FeedbackForm

tureng_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
saurus_url = 'https://www.thesaurus.com/browse/{}'


def get_word_list(request, obj):
    if obj == 'db_words':
        db_words = WordDb.objects.all()
        return db_words
    elif obj == 'db_words_en':
        db_words_en = [word["english"] for word in WordDb.objects.all().values()]
        return db_words_en
    if request.user.is_authenticated:
        if obj == 'unlearned_words':
            unlearned_words = WordEn.objects.filter(user=request.user, is_learned=False)
            return unlearned_words
        elif obj == 'learned_words':
            learned_words = WordEn.objects.filter(user=request.user, is_learned=True)
            return learned_words
        elif obj == 'unlearned_words_en':
            unlearned_words_en = [word["english"] for word in
                                  WordEn.objects.filter(user=request.user, is_learned=False).values()]
            return unlearned_words_en
        elif obj == 'learned_words_en':
            learned_words_en = [word["english"] for word in
                                WordEn.objects.filter(user=request.user, is_learned=True).values()]
            return learned_words_en


def home(request):
    word_mer = WotdEn.objects.get(website="Merriam")
    word_ox = WotdEn.objects.get(website="Oxford")
    word_dict = WotdEn.objects.get(website="Dictionary")
    word_vocab = WotdEn.objects.get(website="Vocabulary")

    data = {
        'word_mer': word_mer,
        'word_ox': word_ox,
        'word_dict': word_dict,
        'word_vocab': word_vocab,
    }
    db_words = get_word_list(request, 'db_words_en')
    random_ = random.sample(db_words, k=10)
    data['random_db'] = random_

    if request.user.is_authenticated:
        # 4 kategorideki tüm kelimeler

        data['last_words'] = WordEn.objects.filter(user=request.user).order_by("-create_time")[:10]
        unlearned_words = get_word_list(request, 'unlearned_words_en')
        learned_words = get_word_list(request, 'learned_words_en')
        if WordEn.objects.filter(user=request.user, is_new_in_reminder_list=True):
            data['show_reminder_notif'] = True

        # Sayfa açılırken 4 karttaki rastgele kelimeler

        random_unl = random.sample(unlearned_words, len(unlearned_words)) \
            if len(unlearned_words) < 10 else random.sample(unlearned_words, k=10)
        data['random_unl'] = random_unl
        random_l = random.sample(learned_words, len(learned_words)) \
            if len(learned_words) < 10 else random.sample(learned_words, k=10)
        data['random_l'] = random_l

        # Günlük kelimeler eklenmiş mi

        if WordEn.objects.filter(user=request.user, english=word_mer.english).exists():
            data['mer_exists'] = True
        if WordEn.objects.filter(user=request.user, english=word_ox.english).exists():
            data['ox_exists'] = True
        if WordEn.objects.filter(user=request.user, english=word_dict.english).exists():
            data['dict_exists'] = True
        if WordEn.objects.filter(user=request.user, english=word_vocab.english).exists():
            data['vocab_exists'] = True

        # Quiz hakları

        if Profile.objects.get(user_id=request.user.id).quiz_db_rights:
            data['quiz_db_rights'] = True
        if Profile.objects.get(user_id=request.user.id).quiz_unl_rights:
            data['quiz_unl_rights'] = True
        if Profile.objects.get(user_id=request.user.id).quiz_l_rights:
            data['quiz_l_rights'] = True

        # Hatırlatıcıyı günde 1 kere aç

        data['open_reminder_daily'] = Profile.objects.get(user_id=request.user.id).open_reminder_daily
        data['reminder_count'] = Profile.objects.get(user_id=request.user.id).reminder_count
    return render(request, 'my_dict/home.html', context=data)


def quiz_and_refresh(request):
    db_words = get_word_list(request, 'db_words_en')
    unlearned_words = []
    learned_words = []
    random_list = []
    tr_list = []

    if request.user.is_authenticated:
        unlearned_words = get_word_list(request, 'unlearned_words_en')
        learned_words = get_word_list(request, 'learned_words_en')

    if request.method == "GET":
        if request.GET.get('random-db'):
            if request.GET.get('random-db') == "refresh":
                random_ = random.sample(db_words, k=10)
                random_list = random_
            else:
                number = int(request.GET.get('random-db'))
                random_ = random.sample(db_words, k=number)
                random_list = random_
                for word in random_:
                    tr_list.append(search_word(word, 1))
        elif request.GET.get('random-unl'):
            if request.GET.get('random-unl') == "refresh":
                if len(unlearned_words) < 10:
                    random_ = random.sample(unlearned_words, k=len(unlearned_words))
                    random_list = random_
                else:
                    random_ = random.sample(unlearned_words, k=10)
                    random_list = random_
            else:
                number = int(request.GET.get('random-unl'))
                random_ = random.sample(unlearned_words, k=number)
                random_list = random_
                for word in random_:
                    tr_list.append(search_word(word, 1))
        elif request.GET.get('random-l'):
            if request.GET.get('random-l') == "refresh":
                if len(learned_words) < 10:
                    random_ = random.sample(learned_words, k=len(learned_words))
                    random_list = random_
                else:
                    random_ = random.sample(learned_words, k=10)
                    random_list = random_
            else:
                number = int(request.GET.get('random-l'))
                random_ = random.sample(learned_words, k=number)
                random_list = random_
                for word in random_:
                    tr_list.append(search_word(word, 1))

    data = {
        'random_list': random_list,
        'tr_list': tr_list
    }

    return JsonResponse(data)


def dictionary(request):
    data = {}
    if request.user.is_authenticated:
        data['last_20_history'] = Search.objects.filter(user=request.user).order_by("-create_time")[:20]
        if request.method == "GET":
            word = request.GET.get('q')
            dictionary_search(request, word)
        if WordEn.objects.filter(user=request.user, is_new_in_reminder_list=True):
            data['show_reminder_notif'] = True

    return render(request, 'my_dict/dictionary.html', context=data)


def dictionary_search(request, word):
    data_list = []
    data_list_2 = []
    error = False
    suggestion_exists = False
    suggestion_list = []
    is_english = True
    synonym_list = []
    antonym_list = []
    example_list = []

    data = {}

    try:
        url_tur = tureng_url.format(word)
        html_tur = requests.get(url_tur).content
        soup_tur = BeautifulSoup(html_tur, 'lxml')
        tables = soup_tur.find_all('table')
        table = soup_tur.find('table')
        rows = table.find_all('tr')[1:]

        def english(rows_table_en, history_save, is_true):
            if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}):
                audio = soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
                data['audio'] = audio
            if rows_table_en:
                for row in rows_table_en:
                    if not row.attrs:
                        tds = row.find_all('td')
                        category = tds[1].text.strip()
                        english = " ".join(tds[2].text.split()[:-1])
                        turkish = tds[3].text.strip()
                        data_list.append([category, english, turkish])
            else:
                for row in rows:
                    if not row.attrs:
                        tds = row.find_all('td')
                        category = tds[1].text.strip()
                        english = " ".join(tds[2].text.split()[:-1])
                        turkish = tds[3].text.strip()
                        data_list.append([category, english, turkish])
            if history_save:
                if word:
                    if request.user.is_authenticated:
                        if not Search.objects.filter(user=request.user, search=word).exists():
                            create_search = Search.objects.create(user=request.user, search=word)
                            create_search.save()
                        else:
                            obj = Search.objects.get(user=request.user, search=word)
                            obj.create_time = datetime.datetime.now()
                            obj.save()
            if is_true:
                for tb in tables:
                    if tb.find("th", class_="c2").text == "İngilizce":
                        if 'teriminin diğer terimlerle kazandığı' in tb.find_previous().find_previous().text:
                            data_list_2_rows = tb.find_all('tr')[1:100]
                            for row in data_list_2_rows:
                                if not row.attrs:
                                    tds = row.find_all('td')
                                    category = tds[1].text.strip()
                                    english = " ".join(tds[2].text.split()[:-1])
                                    turkish = tds[3].text.strip()
                                    data_list_2.append([category, english, turkish])

        def turkish(rows_table_tr):
            if rows_table_tr:
                for row in rows_table_tr:
                    if not row.attrs:
                        tds = row.find_all('td')
                        category = tds[1].text.strip()
                        turkish = tds[2].text.strip()
                        english = " ".join(tds[3].text.split()[:-1])
                        data_list.append([category, turkish, english])
            else:
                for row in rows:
                    if not row.attrs:
                        tds = row.find_all('td')
                        category = tds[1].text.strip()
                        turkish = tds[2].text.strip()
                        english = " ".join(tds[3].text.split()[:-1])
                        data_list.append([category, turkish, english])
            for tb in tables:
                if tb.find("th", class_="c2").text == "Türkçe":
                    if 'teriminin diğer terimlerle kazandığı' in tb.find_previous().find_previous().text:
                        data_list_2_rows = tb.find_all('tr')[1:100]
                        for row in data_list_2_rows:
                            if not row.attrs:
                                tds = row.find_all('td')
                                if '(' not in tds[1].text or tds[2].text:
                                    category = tds[1].text.strip()
                                    turkish = tds[2].text.strip()
                                    english = " ".join(tds[3].text.split()[:-1])
                                    data_list_2.append([category, turkish, english])

        def synAntoExs():
            synonym_list = []
            antonym_list = []
            example_list = []
            url_saur = saurus_url.format(word)
            html_saur = requests.get(url_saur).content
            soup_saur = BeautifulSoup(html_saur, 'lxml')
            if soup_saur.find('div', id='meanings'):
                synonyms = soup_saur.find('div', id='meanings').find_all('li')
                for synonym in synonyms:
                    if synonym.find('a'):
                        text = synonym.find('a').text
                        synonym_list.append(text)
            if soup_saur.find('div', id='antonyms'):
                antonyms = soup_saur.find('div', id='antonyms').find_all('li')
                for antonym in antonyms:
                    if antonym.find('a'):
                        text = antonym.find('a').text
                        antonym_list.append(text)
            if soup_saur.find('div', id='example-sentences'):
                examples = soup_saur.find('div', id='example-sentences').find('span', class_='collapsible-content') \
                               .contents[2:]
                for example in examples:
                    text = example.find('span').text
                    example_list.append(text)
            return synonym_list, antonym_list, example_list

        if table.find("th", class_="c2").text == "İngilizce":
            if table.find_next_sibling('h2'):
                if 'teriminin İngilizce Türkçe Sözlükte anlamları' in table.find_next_sibling('h2').text:
                    h2 = table.find_next_sibling('h2')
                    table_tr = h2.find_next_sibling('table')
                    rows_table_tr = table_tr.find_all('tr')[1:]
                    if len(rows_table_tr) > len(rows):
                        is_english = False
                        turkish(rows_table_tr)
                    else:
                        english(False, True, True)
                        try:
                            synonym_list, antonym_list, example_list = synAntoExs()
                        except:
                            pass
                else:
                    english(False, True, True)
                    try:
                        synonym_list, antonym_list, example_list = synAntoExs()
                    except:
                        pass
            else:
                english(False, True, False)
                try:
                    synonym_list, antonym_list, example_list = synAntoExs()
                except:
                    pass
        elif table.find("th", class_="c2").text == "Türkçe":
            if table.find_next_sibling('h2'):
                if 'teriminin Türkçe İngilizce Sözlükte anlamları' in table.find_next_sibling('h2').text:
                    h2 = table.find_next_sibling('h2')
                    table_en = h2.find_next_sibling('table')
                    rows_table_en = table_en.find_all('tr')[1:]
                    if len(rows_table_en) >= len(rows):
                        is_english = True
                        english(rows_table_en, False, True)
                        try:
                            synonym_list, antonym_list, example_list = synAntoExs()
                        except:
                            pass
                    else:
                        is_english = False
                        turkish(False)
                else:
                    is_english = False
                    turkish(False)
            else:
                is_english = False
                turkish(False)
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

    if request.user.is_authenticated:
        data['last_20_history'] = Search.objects.filter(user=request.user).order_by("-create_time")[:20]
        if word:
            if WordEn.objects.filter(user=request.user, english=word).exists():
                data['word_exists'] = True
        if WordEn.objects.filter(user=request.user, is_new_in_reminder_list=True):
            data['show_reminder_notif'] = True

    data['data'] = data_list
    data['data_2'] = data_list_2
    data['word'] = word
    data['synonyms'] = synonym_list[:3]
    data['antonyms'] = antonym_list[:3]
    data['examples'] = example_list[:3]
    data['error'] = error
    data['suggestion_exists'] = suggestion_exists
    data['suggestion_list'] = suggestion_list
    data['is_english'] = is_english

    return render(request, 'my_dict/dictionary.html', context=data)


@login_required
def my_word_list(request):
    unl_words = get_word_list(request, 'unlearned_words')
    l_words = get_word_list(request, 'learned_words')

    if request.method == "GET":
        word = request.GET.get("q")
        my_word_list_search(request, word)

    paginator_unl = Paginator(unl_words, 10)
    page_no_unl = request.GET.get('s')
    page_unl = paginator_unl.get_page(page_no_unl)
    paginator_l = Paginator(l_words, 10)
    page_no_l = request.GET.get('p')
    page_l = paginator_l.get_page(page_no_l)

    data = {
        'page_obj_unl': page_unl,
        'page_obj_l': page_l,
        'unlearned_count': len(unl_words),
        'learned_count': len(l_words),
    }

    if WordEn.objects.filter(user=request.user, is_new_in_reminder_list=True):
        data['show_reminder_notif'] = True

    return render(request, 'my_dict/word_list.html', context=data)


@login_required
def my_word_list_search(request, word):
    unl_words = get_word_list(request, "unlearned_words")
    l_words = get_word_list(request, "learned_words")
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

    data = {
        'page_obj_unl': page_unl,
        'page_obj_l': page_l,
        'unlearned_count': len(unl_words),
        'learned_count': len(l_words),
        'unl_pg_count': len(word_unl),
        'l_pg_count': len(word_l),
        'word': word
    }

    if WordEn.objects.filter(user=request.user, is_new_in_reminder_list=True):
        data['show_reminder_notif'] = True

    return render(request, 'my_dict/word_list.html', context=data)


def ajax_search(request):
    if 'q' in request.GET:
        words = list()
        all_words = WordEn.objects.filter(user=request.user, english__contains=request.GET.get("q"))
        for word in all_words:
            words.append(word.english)

        return JsonResponse(words, safe=False)


def word_cd(request):
    if request.method == "GET":
        add = False
        word_en = request.GET['word_en']
        word_tr_list = request.GET.getlist('tr[]')
        if request.GET.get('is_btn_add'):
            add = json.loads(request.GET.get('is_btn_add'))
        if add:
            if not WordEn.objects.filter(user=request.user, english=word_en).exists():
                try:
                    audio_src = request.GET['audio']
                    if request.GET.get('type'):
                        type = json.loads(request.GET.get('type'))
                        create_word_en = WordEn(user=request.user, english=word_en, audio=audio_src, is_learned=type)
                        create_word_en.save()
                    else:
                        create_word_en = WordEn(user=request.user, english=word_en, audio=audio_src)
                        create_word_en.save()
                    for word_tr in word_tr_list:
                        create_word_tr = create_word_en.turkish.create(turkish=word_tr)
                        create_word_tr.save()
                    if request.GET.get('word_list'):
                        obj = WordEn.objects.get(user=request.user, english=word_en)
                        tr_list = [tr["turkish"] for tr in obj.turkish.all().values()]
                        data = {
                            'english': obj.english,
                            'id': obj.id,
                            'tr_list': tr_list,
                            'is_added': True
                        }
                        return JsonResponse(data=data)
                    else:
                        return JsonResponse(data={'is_added': True})
                except:
                    create_word_en = WordEn(user=request.user, english=word_en)
                    create_word_en.save()
                    return JsonResponse(data={'is_added': True})
            else:
                return JsonResponse(
                    data={
                        'error_msg': 'Kelime zaten eklenmiş'
                    })
        else:
            if WordEn.objects.filter(user=request.user, english=word_en).exists():
                WordEn.objects.filter(user=request.user, english=word_en).delete()
                return JsonResponse(
                    data={
                        'is_deleted': True,
                    })
            else:
                return JsonResponse(
                    data={
                        'error_msg': 'Kelime zaten silinmiş'
                    })

    return HttpResponse()


class DelSeenLearnedStarred(View):
    def get(self, request):
        word_id = request.GET.get('id')
        word = WordEn.objects.get(user=request.user, id=word_id)
        data = {}
        if request.GET.get('is_seen'):
            if not word.is_seen:
                word.is_seen = True
                word.save()
                data['is_seen'] = True
            else:
                word.is_seen = False
                word.save()
                data['is_seen'] = False
        elif request.GET.get('memo-l'):
            word.is_learned = True
            word.save()
            word_no = int(request.GET.get('get_nth_word')) * 10
            is_last_page = json.loads(request.GET.get('is_last_page'))
            data = get_nth_word(request, False, word_no, is_last_page)
        elif request.GET.get('memo-unl'):
            word.is_learned = False
            word.save()
            word_no = int(request.GET.get('get_nth_word')) * 10
            is_last_page = json.loads(request.GET.get('is_last_page'))
            data = get_nth_word(request, True, word_no, is_last_page)
        elif request.GET.get('star'):
            if not word.is_starred:
                word.is_starred = True
                word.save()
                data['is_starred'] = True
            else:
                word.is_starred = False
                word.save()
                data['is_starred'] = False
        elif request.GET.get('delete'):
            word.delete()
            word_no = int(request.GET.get('get_nth_word')) * 10
            is_last_page = json.loads(request.GET.get('is_last_page'))
            if request.GET.get('del_unl'):
                data = get_nth_word(request, False, word_no, is_last_page)
            else:
                data = get_nth_word(request, True, word_no, is_last_page)

        return JsonResponse(data)


def reminder_cd(request):
    data = {}
    if request.method == "GET":
        word = request.GET.get("word")
        if request.GET.get("add 2 reminder"):
            obj = WordEn.objects.get(user=request.user, english=word)
            obj.is_in_reminder_list = True
            obj.is_new_in_reminder_list = True
            obj.save()
        elif request.GET.get("remove from reminder"):
            obj = WordEn.objects.get(user=request.user, english=word)
            obj.is_in_reminder_list = False
            obj.save()
        elif request.GET.get("is_added"):
            obj = WordEn.objects.get(user=request.user, english=word)
            data['is_added'] = True if obj.is_in_reminder_list else False

    return JsonResponse(data=data)


def error_404_view(request, exception):
    return render(request, 'my_dict/404.html')


def complete_quiz(request):
    if request.method == "POST":
        if request.POST.get('quiz-db'):
            obj = Profile.objects.get(user_id=request.user.id)
            obj.quiz_db_rights -= 1
            obj.save()
        elif request.POST.get('quiz-unl'):
            obj = Profile.objects.get(user_id=request.user.id)
            obj.quiz_unl_rights -= 1
            obj.save()
        if request.POST.get('quiz-l'):
            obj = Profile.objects.get(user_id=request.user.id)
            obj.quiz_l_rights -= 1
            obj.save()

    return HttpResponse('')


def get_reminder_list(request):
    reminder_list = []
    quiz_db = []
    quiz_unl = []
    quiz_l = []
    new_in_reminder_list = []
    user_email = request.user.email
    reminder_subscriber_list = []
    for obj in ReminderSubscription.objects.all():
        reminder_subscriber_list.append(obj.email)
    if user_email in reminder_subscriber_list:
        is_registered_to_reminder = True
    else:
        is_registered_to_reminder = False

    if request.method == "GET":
        words = WordEn.objects.filter(user=request.user, is_in_reminder_list=True).order_by('-is_new_in_reminder_list')
        for word in words:
            reminder_list.append(word.english)
        obj_db = QuizRecorder.objects.filter(user=request.user, is_db=True)
        for obj in obj_db:
            quiz_db.append(
                {
                    'english': obj.english,
                    'is_correct': obj.is_correct,
                    'create_time': obj.create_time.strftime('%d/%m/%Y')
                }
            )
        obj_unl = QuizRecorder.objects.filter(user=request.user, is_db=False, is_learned=False)
        for obj in obj_unl:
            quiz_unl.append(
                {
                    'english': obj.english,
                    'is_correct': obj.is_correct,
                    'create_time': obj.create_time.strftime('%d/%m/%Y')
                }
            )
        obj_l = QuizRecorder.objects.filter(user=request.user, is_db=False, is_learned=True)
        for obj in obj_l:
            quiz_l.append(
                {
                    'english': obj.english,
                    'is_correct': obj.is_correct,
                    'create_time': obj.create_time.strftime('%d/%m/%Y')
                }
            )
        new_in_reminder = WordEn.objects.filter(user=request.user, is_new_in_reminder_list=True)
        if new_in_reminder:
            for word in new_in_reminder:
                new_in_reminder_list.append(word.english)
                obj = WordEn.objects.get(user=request.user, english=word.english, is_new_in_reminder_list=True)
                obj.is_new_in_reminder_list = False
                obj.save()

    data = {
        'reminder_list': reminder_list,
        'new_in_reminder_list': new_in_reminder_list,
        'quiz_db': quiz_db,
        'quiz_unl': quiz_unl,
        'quiz_l': quiz_l,
        'user_email': user_email,
        'is_registered_to_reminder': is_registered_to_reminder
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
            qr_objs = QuizRecorder.objects.filter(user=request.user, is_db=True)
            for obj in qr_objs:
                obj.delete()
            correct_list = request.POST.getlist("correct_list[]")
            incorrect_list = request.POST.getlist("incorrect_list[]")
            for cor in correct_list:
                obj = QuizRecorder.objects.create(user=request.user, english=cor, is_db=True, is_correct=True)
                obj.save()
            for incor in incorrect_list:
                obj = QuizRecorder.objects.create(user=request.user, english=incor, is_db=True, is_correct=False)
                obj.save()
        elif request.POST.get("quiz_unl"):
            qr_objs = QuizRecorder.objects.filter(user=request.user, is_db=False, is_learned=False)
            for obj in qr_objs:
                obj.delete()
            correct_list = request.POST.getlist("correct_list[]")
            incorrect_list = request.POST.getlist("incorrect_list[]")
            for cor in correct_list:
                obj = QuizRecorder.objects.create(user=request.user, english=cor, is_learned=False, is_correct=True)
                obj.save()
            for incor in incorrect_list:
                obj = QuizRecorder.objects.create(user=request.user, english=incor, is_learned=False, is_correct=False)
                obj.save()
        elif request.POST.get("quiz_l"):
            qr_objs = QuizRecorder.objects.filter(user=request.user, is_db=False, is_learned=True)
            for obj in qr_objs:
                obj.delete()
            correct_list = request.POST.getlist("correct_list[]")
            incorrect_list = request.POST.getlist("incorrect_list[]")
            for cor in correct_list:
                obj = QuizRecorder.objects.create(user=request.user, english=cor, is_learned=True, is_correct=True)
                obj.save()
            for incor in incorrect_list:
                obj = QuizRecorder.objects.create(user=request.user, english=incor, is_learned=True, is_correct=False)
                obj.save()

    return HttpResponse("")


def get_word_count_and_quiz_rights(request):
    if request.method == "GET":
        prof = Profile.objects.get(user=request.user)
        if request.GET.get('count_unl'):
            quiz_rights = prof.quiz_unl_rights
            count = len(get_word_list(request, 'unlearned_words'))
            return JsonResponse(data={'count': count, 'quiz_rights': quiz_rights})
        elif request.GET.get('count_l'):
            quiz_rights = prof.quiz_l_rights
            count = len(get_word_list(request, 'learned_words'))
            return JsonResponse(data={'count': count, 'quiz_rights': quiz_rights})
        elif request.GET.get('count_db'):
            quiz_rights = prof.quiz_db_rights
            return JsonResponse(data={'quiz_rights': quiz_rights})


def search_word(word, opt):
    pre_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
    plus_added_search = '+'.join(str(word).split())
    url = pre_url.format(str(plus_added_search))
    html = requests.get(url).content
    soup = BeautifulSoup(html, 'lxml')

    if opt == 1:
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
            tr_list = []
            return tr_list
    else:
        try:
            table = soup.find('table')
            rows = table.find_all('tr')[1:]
            audio_and_tr = [None, None]
            tr_list = []
            for row in rows:
                if not row.attrs:
                    tds = row.find_all('td')
                    tr = tds[3].text.strip()
                    tr_list.append(tr)
            if tr_list:
                audio_and_tr[0] = tr_list[:9]
            else:
                audio_and_tr[0] = None

            try:
                if soup.find('audio', {'id': 'turengVoiceENTRENus'}).find('source'):
                    audio = soup.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
                    audio_and_tr[1] = audio
                else:
                    audio_and_tr[1] = None
            except:
                pass

            return audio_and_tr
        except:
            return None


def main_home(request):
    form = FeedbackForm(request.POST or None)
    if form.is_valid():
        form.save()
    context = {
        'form': form
    }
    return render(request, 'my_dict/mainhome.html', context)


def ajax_word_info(request):
    words_api = "https://wordsapiv1.p.rapidapi.com/words/{}"
    if request.method == "GET":
        data = {}
        sel = request.GET.get("selection")
        headers = {
            'x-rapidapi-key': "c5cbdceae4msh740bd52ea8d5e8bp1f6881jsn7c651aa39638",
            'x-rapidapi-host': "wordsapiv1.p.rapidapi.com"
        }

        response = requests.request("GET", words_api.format(sel), headers=headers)
        if 'success' not in json.loads(response.text):
            tr_audio = search_word(sel, 2)[:9]
            if tr_audio[0] is not None:
                data['tr'] = tr_audio[0]
            else:
                data['tr'] = "None"
            if tr_audio[1] is not None:
                data['audio'] = tr_audio[1]
            else:
                data['audio'] = "None"
            if json.loads(response.text).get('word'):
                data['word'] = json.loads(response.text)['word']
            else:
                data['word'] = "—"
            if json.loads(response.text).get('syllables'):
                data['syllables'] = json.loads(response.text)['syllables']['count']
            else:
                data['syllables'] = "—"
            if json.loads(response.text).get('pronunciation'):
                try:
                    data['pronunciation'] = json.loads(response.text)['pronunciation']['all']
                except TypeError:
                    data['pronunciation'] = json.loads(response.text)['pronunciation']
            else:
                data['pronunciation'] = "—"
            if json.loads(response.text).get('results'):
                res = json.loads(response.text)['results']
                all_results = []
                for r in res:
                    result = {}
                    if r.get('definition'):
                        result['definition'] = r['definition']
                    if r.get('partOfSpeech'):
                        if r['partOfSpeech'] == 'noun':
                            result['partOfSpeech'] = 'isim'
                        elif r['partOfSpeech'] == 'verb':
                            result['partOfSpeech'] = 'fiil'
                        elif r['partOfSpeech'] == 'pronoun':
                            result['partOfSpeech'] = 'zamir'
                        elif r['partOfSpeech'] == 'adjective':
                            result['partOfSpeech'] = 'sıfat'
                        elif r['partOfSpeech'] == 'adverb':
                            result['partOfSpeech'] = 'zarf'
                        elif r['partOfSpeech'] == 'preposition':
                            result['partOfSpeech'] = 'edat'
                        elif r['partOfSpeech'] == 'conjunction':
                            result['partOfSpeech'] = 'bağlaç'
                        elif r['partOfSpeech'] == 'interjection':
                            result['partOfSpeech'] = 'ünlem'
                    if r.get('synonyms'):
                        result['synonyms'] = r['synonyms']
                    if r.get('antonyms'):
                        result['antonyms'] = r['antonyms']
                    if r.get('examples'):
                        result['examples'] = r['examples']
                    all_results.append(result)
                data['all_results'] = all_results
            else:
                data['success'] = "False"
        else:
            data['success'] = "False"

        return JsonResponse(data)

    return HttpResponse("")


def get_achievs(request):
    data = {}
    if request.method == "GET":
        if request.user.is_authenticated:
            achievements = AchievementDetail.objects.all().order_by("achiev_no")
            shop_products = ShopProducts.objects.all().order_by("price", "text")
            prof = Profile.objects.get(user=request.user)
            achievement_tracker = AchievementTracker.objects.filter(profile=prof.id).order_by('achiev_no')
            ach_tracker_list = []
            ach_list = []
            pdt_list = []
            for i in range(16):
                prg_current = achievement_tracker[i].progress_current
                prg_star = achievement_tracker[i].progress_star
                if achievements[i].is_daily:
                    ach_list.append({
                        "ach_text": achievements[i].text,
                        "ach_coin": achievements[i].coin_value,
                        "ach_prg_max": achievements[i].progress_max,
                        "ach_daily": True,
                    })
                    if achievement_tracker[i].progress_star == 1:
                        ach_tracker_list.append({
                            "prg_current": achievements[i].progress_max,
                            "prg_percentage": 100,
                            "prg_star": prg_star
                        })
                    else:
                        ach_tracker_list.append({
                            "prg_current": prg_current,
                            "prg_percentage": round(percentage_calc(prg_current, achievements[i].progress_max), 1),
                            "prg_star": prg_star
                        })
                else:
                    if i == 4 or i == 7 or i == 10 or i == 13:
                        if achievement_tracker[i].progress_star == 0:
                            ach_list.append({
                                "ach_text": achievements[i].text,
                                "ach_coin": achievements[i].coin_value,
                                "ach_prg_max": achievements[i].progress_max,
                                "ach_daily": False,
                            })
                            ach_tracker_list.append({
                                "prg_current": achievement_tracker[i].progress_current,
                                "prg_percentage": round(percentage_calc(achievement_tracker[i].progress_current,
                                                                        achievements[i].progress_max), 1),
                                "prg_star": achievement_tracker[i].progress_star
                            })
                        elif achievement_tracker[i].progress_star == 1:
                            ach_list.append({
                                "ach_text": achievements[i + 1].text,
                                "ach_coin": achievements[i + 1].coin_value,
                                "ach_prg_max": achievements[i + 1].progress_max,
                                "ach_daily": False,
                            })
                            ach_tracker_list.append({
                                "prg_current": achievement_tracker[i + 1].progress_current,
                                "prg_percentage": round(percentage_calc(achievement_tracker[i + 1].progress_current,
                                                                        achievements[i + 1].progress_max), 1),
                                "prg_star": achievement_tracker[i].progress_star
                            })
                        elif achievement_tracker[i].progress_star >= 2:
                            ach_list.append({
                                "ach_text": achievements[i + 2].text,
                                "ach_coin": achievements[i + 2].coin_value,
                                "ach_prg_max": achievements[i + 2].progress_max,
                                "ach_daily": False,
                            })
                            if achievement_tracker[i].progress_star == 2:
                                ach_tracker_list.append({
                                    "prg_current": achievement_tracker[i + 2].progress_current,
                                    "prg_percentage": round(percentage_calc(achievement_tracker[i + 2].progress_current,
                                                                            achievements[i + 2].progress_max), 1),
                                    "prg_star": achievement_tracker[i].progress_star
                                })
                            else:
                                ach_tracker_list.append({
                                    "prg_current": achievement_tracker[i + 2].progress_current,
                                    "prg_percentage": 100,
                                    "prg_star": achievement_tracker[i].progress_star
                                })
            for pdt in shop_products:
                pdt_list.append({
                    "pdt_text": pdt.text,
                    "pdt_price": pdt.price,
                    "pdt_type": pdt.type,
                    "pdt_color": pdt.color,
                    "pdt_bg_img": json.dumps(str(pdt.background_image)),
                    "pdt_id": pdt.id,
                    "is_purchased": ProductTracker.objects.filter(profile=prof.id, text=pdt.text).exists()
                })
            data["pdt_list"] = pdt_list
            data["ach_list"] = ach_list
            data["ach_tracker_list"] = ach_tracker_list
            data["acc_coin"] = prof.coin

    return JsonResponse(data)


def prg_tracker(request):
    if request.method == "GET":
        ach_no_list = request.GET.getlist("ach_no[]")
        prof = Profile.objects.get(user=request.user)
        if "up_or_down" in request.GET:
            up_or_down = int(request.GET.get("up_or_down"))
            for ach_no in ach_no_list:
                if int(ach_no) <= 4:
                    obj = AchievementTracker.objects.get(profile=prof.id, achiev_no=int(ach_no))
                    if up_or_down:
                        obj.progress_current += 1
                        obj.save()
                    else:
                        if obj.progress_current > 0:
                            obj.progress_current -= 1
                            obj.save()
                else:
                    obj = AchievementTracker.objects.get(profile=prof.id, achiev_no=int(ach_no))
                    if obj.progress_star == 0:
                        if up_or_down:
                            obj.progress_current += 1
                            obj.save()
                        else:
                            if obj.progress_current > 0:
                                obj.progress_current -= 1
                                obj.save()
                    elif obj.progress_star == 1:
                        obj = AchievementTracker.objects.get(profile=prof.id, achiev_no=int(ach_no) + 1)
                        if obj.progress_star == 0:
                            if up_or_down:
                                obj.progress_current += 1
                                obj.save()
                            else:
                                if obj.progress_current > 0:
                                    obj.progress_current -= 1
                                    obj.save()
                    elif obj.progress_star == 2:
                        obj = AchievementTracker.objects.get(profile=prof.id, achiev_no=int(ach_no) + 2)
                        if obj.progress_star == 0:
                            if up_or_down:
                                obj.progress_current += 1
                                obj.save()
                            else:
                                if obj.progress_current > 0:
                                    obj.progress_current -= 1
                                    obj.save()
        elif "prg_star" in request.GET:
            for ach_no in ach_no_list:
                obj = AchievementTracker.objects.get(profile=prof.id, achiev_no=int(ach_no))
                ach = AchievementDetail.objects.get(achiev_no=int(ach_no))
                ach_next = AchievementDetail.objects.get(achiev_no=int(ach_no) + 1)
                prof.coin += ach.coin_value
                prof.save()
                obj.progress_star += 1
                obj.save()
                return JsonResponse(
                    data={
                        'prg_max': ach_next.progress_max,
                        'ach_text': ach_next.text,
                        'next_coin_value': ach_next.coin_value,
                        'coin_value': ach.coin_value,
                        'cur_balance': prof.coin
                    })

    return HttpResponse("")


def percentage_calc(n1, n2):
    return 100 / n2 * n1


def shop_purchase(request):
    pdt_id = request.GET.get("pdt_id")
    pdt = ShopProducts.objects.get(id=pdt_id)
    prof = Profile.objects.get(user=request.user)
    if prof.coin - int(pdt.price) >= 0:
        if not ProductTracker.objects.filter(profile=prof, text=pdt.text).exists():
            if pdt.type == "bg-img":
                image = str(pdt.background_image)
                obj = ProductTracker.objects.create(
                    profile=prof, text=pdt.text, type=pdt.type, color=pdt.color, background_image=image
                )
                obj.save()
            elif pdt.type == "rights":
                image = ""
                obj = ProductTracker.objects.create(
                    profile=prof, text=pdt.text, type=pdt.type, color=pdt.color, background_image=image
                )
                obj.save()
                if pdt.text == "Biliyor muydun?":
                    prof.quiz_db_rights += 1
                elif pdt.text == "Öğreneceklerim":
                    prof.quiz_unl_rights += 1
                elif pdt.text == "Öğrendiklerim":
                    prof.quiz_l_rights += 1
            elif pdt.type == "clr":
                image = ""
                obj = ProductTracker.objects.create(
                    profile=prof, text=pdt.text, type=pdt.type, color=pdt.color, background_image=image
                )
                obj.save()
            prof.coin = prof.coin - int(pdt.price)
            prof.save()
            return JsonResponse(data={
                "is_purchased": True,
                "pdt_price": int(pdt.price),
                "cur_balance": prof.coin
            })
        else:
            return JsonResponse(data={})
    else:
        return JsonResponse(data={
            "gap": int(pdt.price) - prof.coin,
            "is_purchased": False
        })


def get_customization(request):
    if request.method == "GET":
        prof = Profile.objects.get(user=request.user)
        product_tracker = ProductTracker.objects.filter(profile=prof.id)
        owned_colors = []
        owned_bg_imgs = []
        data = {}
        for pdt in product_tracker:
            if pdt.type == "clr":
                owned_colors.append({
                    "owned_pdt_text": pdt.text,
                    "pdt_id": pdt.id
                })
            elif pdt.type == "bg-img":
                owned_bg_imgs.append({
                    "owned_pdt_text": pdt.text,
                    "pdt_id": pdt.id
                })
        data["owned_colors"] = owned_colors
        data["owned_bg_imgs"] = owned_bg_imgs
        return JsonResponse(data=data)


def customization(request):
    if request.method == "POST":
        prof = Profile.objects.get(user=request.user)
        if request.POST.get("custom_navbar_color"):
            pdt_id = request.POST.get("pdt_id")
            pdt = ProductTracker.objects.get(id=pdt_id)
            prof.custom_navbar_color = pdt.color
            prof.save()
            data = {
                "pdt_color": pdt.color
            }
            return JsonResponse(data=data)
        elif request.POST.get("custom_background_color"):
            pdt_id = request.POST.get("pdt_id")
            pdt = ProductTracker.objects.get(id=pdt_id)
            prof.custom_background_color = pdt.color
            prof.custom_background_image = ""
            prof.save()
            data = {
                "pdt_color": pdt.color
            }
            return JsonResponse(data=data)
        elif request.POST.get("custom_background_image"):
            pdt_id = request.POST.get("pdt_id")
            pdt = ProductTracker.objects.get(id=pdt_id)
            prof.custom_background_image = f"url(https://ezberle.herokuapp.com/static/img/{str(pdt.background_image).split('img/')[1]})"
            prof.custom_background_color = ""
            prof.save()
            data = {
                "pdt_image": json.dumps(str(pdt.background_image)).split("img/")[1].rstrip('\n"')
            }
            return JsonResponse(data=data)
        elif request.POST.get("custom_bg_navbar"):
            prof.custom_background_image = ""
            prof.custom_background_color = "#008080"
            prof.custom_navbar_color = "#008080"
            prof.save()
            return JsonResponse(data={})


def shop_preview(request):
    if request.method == "GET":
        pdt_id = request.GET.get("pdt_id")
        pdt = ShopProducts.objects.get(id=pdt_id)
        data = {}
        if pdt.color:
            data["pdt_color"] = pdt.color
        elif pdt.background_image:
            pdt_bg_img = json.dumps(str(pdt.background_image)).split("img/")[1].rstrip('\n"')
            data["pdt_bg_img"] = pdt_bg_img

        return JsonResponse(data=data)


def save_feedback(request):
    if request.method == 'GET':
        name = request.GET.get("name")
        lastname = request.GET.get("lastname")
        feedback = request.GET.get("feedback")
        obj = Feedback(isim=name, soyisim=lastname, mesaj=feedback)
        obj.save()
        return JsonResponse(data={})


def word_list_ajax_search(request):
    if request.method == 'GET':
        search = request.GET.get('search')
        if len(search) >= 2:
            obj = WordEn.objects.filter(user=request.user, english__contains=search)
        else:
            unlearned_words = list(WordEn.objects.filter(user=request.user, is_learned=False)[:10])
            learned_words = list(WordEn.objects.filter(user=request.user, is_learned=True)[:10])
            obj = unlearned_words[:10] + learned_words[:10]
        obj_list = []
        for o in obj:
            obj_list.append({
                'id': o.id,
                'english': o.english,
                'is_learned': o.is_learned,
                'is_seen': o.is_seen,
                'is_starred': o.is_starred,
                'audio': o.audio,
                'tr_list': [tr["turkish"] for tr in o.turkish.all().values()]
            })

        data = {
            'obj_list': obj_list
        }

        return JsonResponse(data=data)


def get_nth_word(request, is_learned, word_no, del_is_last_page):
    word_list = WordEn.objects.filter(user=request.user, is_learned=is_learned).order_by('-create_time')
    data = {}
    if not del_is_last_page:
        if len(word_list) >= 10:
            obj = word_list[word_no - 1]
            tr_list = []
            for tr in obj.turkish.all():
                tr_list.append(tr.turkish)
            data['word'] = {
                'english': obj.english,
                'id': obj.id,
                'audio': obj.audio,
                'is_seen': obj.is_seen,
                'is_starred': obj.is_starred,
                'tr_list': [tr["turkish"] for tr in obj.turkish.all().values()]
            }
    data['word_count'] = {
        'count': len(word_list)
    }

    return data


def reminder_subscription(request, sub, email, is_external):
    if request.method == "GET":
        if not ReminderSubscription.objects.filter(email=email) and sub == 'subscribe' and is_external == 'false':
            create_sub = ReminderSubscription.objects.create(email=email)
            create_sub.save()
        elif ReminderSubscription.objects.filter(email=email) and sub == 'unsubscribe' and is_external == 'false':
            delete_sub = ReminderSubscription.objects.get(email=email)
            delete_sub.delete()
        elif email and is_external == 'true':
            delete_sub = ReminderSubscription.objects.get(email=email)
            delete_sub.delete()
            return redirect(home)

    return HttpResponse()





