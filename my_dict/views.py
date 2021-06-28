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
import json
from .forms import FeedbackForm

tureng_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
saurus_url = 'https://www.thesaurus.com/browse/{}'


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

    if request.user.is_authenticated:
        data['last_words'] = WordEn.objects.filter(user=request.user).order_by("-create_time")[:10]
        db_words = [word["english"] for word in WordDb.objects.all().values()]
        unlearned_words = [word["english"] for word in
                           WordEn.objects.filter(user=request.user, is_learned=False).values()]
        learned_words = [word["english"] for word in WordEn.objects.filter(user=request.user, is_learned=True).values()]
        if WordEn.objects.filter(user=request.user, is_new_in_reminder_list=True):
            data['show_reminder_notif'] = True

        random_ = random.sample(db_words, k=10)
        data['random_db'] = random_
        if len(unlearned_words) < 10:
            random_ = random.sample(unlearned_words, len(unlearned_words))
            data['random_unl'] = random_
        else:
            random_ = random.sample(unlearned_words, k=10)
            data['random_unl'] = random_
        if len(learned_words) < 10:
            random_ = random.sample(learned_words, len(learned_words))
            data['random_l'] = random_
        else:
            random_ = random.sample(learned_words, k=10)
            data['random_l'] = random_

        if WordEn.objects.filter(user=request.user, english=word_mer.english).exists():
            data['mer_exists'] = True
        if WordEn.objects.filter(user=request.user, english=word_ox.english).exists():
            data['ox_exists'] = True
        if WordEn.objects.filter(user=request.user, english=word_dict.english).exists():
            data['dict_exists'] = True
        if WordEn.objects.filter(user=request.user, english=word_vocab.english).exists():
            data['vocab_exists'] = True

        if Profile.objects.get(user_id=request.user.id).quiz_db_rights:
            data['quiz_db_rights'] = True
        if Profile.objects.get(user_id=request.user.id).quiz_unl_rights:
            data['quiz_unl_rights'] = True
        if Profile.objects.get(user_id=request.user.id).quiz_l_rights:
            data['quiz_l_rights'] = True

        data['open_reminder_daily'] = Profile.objects.get(user_id=request.user.id).open_reminder_daily
    return render(request, 'my_dict/home.html', context=data)


def quiz_and_refresh(request):
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
                    tr_list.append(search_word(word, 1))
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
                    tr_list.append(search_word(word, 1))
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
                    tr_list.append(search_word(word, 1))

    data = {
        'random_db': random_db,
        'random_unlearned': random_unlearned,
        'random_learned': random_learned,
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
    data = []
    data_2 = []
    error = False
    suggestion_exists = False
    suggestion_list = []
    is_english = True
    audio = ""
    synonym_list = []
    antonym_list = []
    example_list = []

    try:
        url_tur = tureng_url.format(word)
        html_tur = requests.get(url_tur).content
        soup_tur = BeautifulSoup(html_tur, 'lxml')
        tables = soup_tur.find_all('table')
        table = soup_tur.find('table')
        rows = table.find_all('tr')[1:]

        def english(history_save, is_true):
            if soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source'):
                audio = soup_tur.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
            for row in rows:
                if not row.attrs:
                    tds = row.find_all('td')
                    category = tds[1].text.strip()
                    english = " ".join(tds[2].text.split()[:-1])
                    turkish = tds[3].text.strip()
                    data.append([category, english, turkish])
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
                            data_2_rows = tb.find_all('tr')[1:100]
                            for row in data_2_rows:
                                if not row.attrs:
                                    tds = row.find_all('td')
                                    category = tds[1].text.strip()
                                    english = " ".join(tds[2].text.split()[:-1])
                                    turkish = tds[3].text.strip()
                                    data_2.append([category, english, turkish])
            return audio

        def turkish():
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
                examples = soup_saur.find('div', id='example-sentences').find('h2').next_siblings
                for example in examples:
                    text = example.find('div').find('div').find('div').find('span').text
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
                        turkish()
                    else:
                        audio = english(True, True)
                        try:
                            synonym_list, antonym_list, example_list = synAntoExs()
                        except:
                            pass
                else:
                    audio = english(True, True)
                    try:
                        synonym_list, antonym_list, example_list = synAntoExs()
                    except:
                        pass
            else:
                audio = english(True, False)
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
                        audio = english(False, True)
                        try:
                            synonym_list, antonym_list, example_list = synAntoExs()
                        except:
                            pass
                    else:
                        is_english = False
                        turkish()
                else:
                    is_english = False
                    turkish()
            else:
                is_english = False
                turkish()
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

    data = {
        'data': data,
        'data_2': data_2,
        'word': word,
        'audio': audio,
        'synonyms': synonym_list[:3],
        'antonyms': antonym_list[:3],
        'examples': example_list[:3],
        'error': error,
        'suggestion_exists': suggestion_exists,
        'suggestion_list': suggestion_list,
        'is_english': is_english
    }

    if request.user.is_authenticated:
        data['last_20_history'] = Search.objects.filter(user=request.user).order_by("-create_time")[:20]
        if word:
            if WordEn.objects.filter(user=request.user, english=word).exists():
                data['word_exists'] = True
        if WordEn.objects.filter(user=request.user, is_new_in_reminder_list=True):
            data['show_reminder_notif'] = True

    return render(request, 'my_dict/dictionary.html', context=data)


@login_required
def my_word_list(request):
    l_words = WordEn.objects.filter(user=request.user, is_learned=True)
    unl_words = WordEn.objects.filter(user=request.user, is_learned=False)

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
    unl_words = WordEn.objects.filter(user=request.user, is_learned=False)
    l_words = WordEn.objects.filter(user=request.user, is_learned=True)
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
                return JsonResponse(data={'is_added': True})
            except:
                create_word_en = WordEn(user=request.user, english=word_en)
                create_word_en.save()
                return JsonResponse(data={'is_added': True})
        else:
            WordEn.objects.filter(user=request.user, english=word_en).delete()
            return JsonResponse(data={'is_deleted': True})

    return HttpResponse()


class DelSeenLearnedStarred(View):
    def get(self, request):
        word_id = request.GET.get('id')
        word = WordEn.objects.get(user=request.user, id=word_id)
        data = {}
        if request.GET.get('seen'):
            if not word.is_seen:
                word.is_seen = True
                word.save()
                data['is_seen'] = True
            else:
                word.is_seen = False
                word.save()
                data['is_seen'] = False
        elif request.GET.get('learned'):
            word.is_learned = True
            word.save()
            data['is_learned'] = True
            unl_words = WordEn.objects.filter(user=request.user, is_learned=False).order_by('-create_time')
            if len(unl_words) >= 10:
                obj = unl_words[9]
                tr_list = []
                for tr in obj.turkish.all():
                    tr_list.append(tr.turkish)
                data['word'] = {
                    'english': obj.english,
                    'id': obj.id,
                    'audio': obj.audio,
                    'is_seen': obj.is_seen,
                    'is_starred': obj.is_starred,
                    'tr_list': tr_list
                }
            data['word_count'] = {
                'count': len(unl_words)
            }
        elif request.GET.get('unlearned'):
            word.is_learned = False
            word.save()
            data['is_learned'] = False
            l_words = WordEn.objects.filter(user=request.user, is_learned=True).order_by('-create_time')
            if len(l_words) >= 10:
                obj = l_words[9]
                tr_list = []
                for tr in obj.turkish.all():
                    tr_list.append(tr.turkish)
                data['word'] = {
                    'english': obj.english,
                    'id': obj.id,
                    'audio': obj.audio,
                    'is_seen': obj.is_seen,
                    'is_starred': obj.is_starred,
                    'tr_list': tr_list
                }
            data['word_count'] = {
                'count': len(l_words)
            }
        elif request.GET.get('starred'):
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
            if obj.is_in_reminder_list:
                data['is_added'] = True

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
    if request.method == "GET":
        words = WordEn.objects.filter(user=request.user, is_in_reminder_list=True)
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
        obj_unl = QuizRecorder.objects.filter(user=request.user, is_learned=False)
        for obj in obj_unl:
            quiz_unl.append(
                {
                  'english': obj.english,
                  'is_correct': obj.is_correct,
                  'create_time': obj.create_time.strftime('%d/%m/%Y')
                }
            )
        obj_l = QuizRecorder.objects.filter(user=request.user, is_learned=True)
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
                obj = WordEn.objects.get(user=request.user, english=word, is_new_in_reminder_list=True)
                obj.is_new_in_reminder_list = False
                obj.save()

    data = {
        'reminder_list': reminder_list,
        'new_in_reminder_list': new_in_reminder_list,
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
            obj = WordEn.objects.filter(user=request.user, is_learned=False)
            quiz_rights = prof.quiz_unl_rights
            count = len(obj)
            return JsonResponse(data={'count_unl': count, 'quiz_rights': quiz_rights})
        elif request.GET.get('count_l'):
            obj = WordEn.objects.filter(user=request.user, is_learned=True)
            quiz_rights = prof.quiz_l_rights
            count = len(obj)
            return JsonResponse(data={'count_l': count, 'quiz_rights': quiz_rights})
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
            return None
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
                                "prg_percentage": round(percentage_calc(achievement_tracker[i].progress_current, achievements[i].progress_max), 1),
                                "prg_star": achievement_tracker[i].progress_star
                            })
                        elif achievement_tracker[i].progress_star == 1:
                            ach_list.append({
                                "ach_text": achievements[i+1].text,
                                "ach_coin": achievements[i+1].coin_value,
                                "ach_prg_max": achievements[i+1].progress_max,
                                "ach_daily": False,
                            })
                            ach_tracker_list.append({
                                "prg_current": achievement_tracker[i+1].progress_current,
                                "prg_percentage": round(percentage_calc(achievement_tracker[i+1].progress_current, achievements[i+1].progress_max), 1),
                                "prg_star": achievement_tracker[i].progress_star
                            })
                        elif achievement_tracker[i].progress_star >= 2:
                            ach_list.append({
                                "ach_text": achievements[i+2].text,
                                "ach_coin": achievements[i+2].coin_value,
                                "ach_prg_max": achievements[i+2].progress_max,
                                "ach_daily": False,
                            })
                            if achievement_tracker[i].progress_star == 2:
                                ach_tracker_list.append({
                                    "prg_current": achievement_tracker[i+2].progress_current,
                                    "prg_percentage": round(percentage_calc(achievement_tracker[i+2].progress_current, achievements[i+2].progress_max), 1),
                                    "prg_star": achievement_tracker[i].progress_star
                                })
                            else:
                                ach_tracker_list.append({
                                    "prg_current": achievement_tracker[i+2].progress_current,
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
                        obj = AchievementTracker.objects.get(profile=prof.id, achiev_no=int(ach_no)+1)
                        if obj.progress_star == 0:
                            if up_or_down:
                                obj.progress_current += 1
                                obj.save()
                            else:
                                if obj.progress_current > 0:
                                    obj.progress_current -= 1
                                    obj.save()
                    elif obj.progress_star == 2:
                        obj = AchievementTracker.objects.get(profile=prof.id, achiev_no=int(ach_no)+2)
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
                ach_next = AchievementDetail.objects.get(achiev_no=int(ach_no)+1)
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
