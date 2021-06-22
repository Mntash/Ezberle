from django.utils import timezone
from .models import *
from bs4 import BeautifulSoup
import requests
import lxml
import cchardet


def reset_quiz():
    profiles = Profile.objects.all()
    for p in profiles:
        if ProductTracker.objects.filter(profile=p.id, text="Biliyor muydun?"):
            p.quiz_db_rights = 2
            p.save()
        else:
            p.quiz_db_rights = 1
            p.save()
        if ProductTracker.objects.filter(profile=p.id, text="Öğreneceklerim"):
            p.quiz_unl_rights = 2
            p.save()
        else:
            p.quiz_unl_rights = 1
            p.save()
        if ProductTracker.objects.filter(profile=p.id, text="Öğrendiklerim"):
            p.quiz_l_rights = 2
            p.save()
        else:
            p.quiz_l_rights = 1
            p.save()


def word_of_the_day():
    try:
        if WotdEn.objects.all():
            all_wotds = WotdEn.objects.all()
            for wotd in all_wotds:
                wotd.delete()
    except:
        pass

    req_mer = requests.get('https://www.merriam-webster.com/', headers={"User-Agent": "Mozilla/5.0"}).content
    req_ox = requests.get('https://www.oxfordlearnersdictionaries.com/', headers={"User-Agent": "Mozilla/5.0"}).content
    req_dict = requests.get('https://www.dictionary.com/', headers={"User-Agent": "Mozilla/5.0"}).content
    req_vocab = requests.get('https://www.vocabulary.com/dictionary/', headers={"User-Agent": "Mozilla/5.0"}).content
    soup_mer = BeautifulSoup(req_mer, 'lxml')
    soup_ox = BeautifulSoup(req_ox, 'lxml')
    soup_dict = BeautifulSoup(req_dict, 'lxml')
    soup_vocab = BeautifulSoup(req_vocab, 'lxml')
    word_mer = soup_mer.find('a', {'class': 'header-wht'}).text.strip()
    word_ox = soup_ox.find('a', {'class': 'headword'}).find_next().text.strip()
    word_dict = soup_dict.find('span', {'class': 'colored-card-heading'}).text.strip()
    word_vocab = soup_vocab.find('h2', {'class': 'dynamictext'}).find('a').text.strip()
    tur_mer = []
    tur_ox = []
    tur_dict = []
    tur_vocab = []
    if search_word(word_mer) is not None:
        tur_mer = search_word(word_mer)
    else:
        tur_mer = [None, None]
    if search_word(word_ox) is not None:
        tur_ox = search_word(word_ox)
    else:
        tur_ox = [None, None]
    if search_word(word_dict) is not None:
        tur_dict = search_word(word_dict)
    else:
        tur_dict = [None, None]
    if search_word(word_vocab) is not None:
        tur_vocab = search_word(word_vocab)
    else:
        tur_vocab = [None, None]

    create_mer = WotdEn.objects.create(english=word_mer, audio=tur_mer[1], website="Merriam")
    create_mer.save()
    create_ox = WotdEn.objects.create(english=word_ox, audio=tur_ox[1], website="Oxford")
    create_ox.save()
    create_dict = WotdEn.objects.create(english=word_dict, audio=tur_dict[1], website="Dictionary")
    create_dict.save()
    create_vocab = WotdEn.objects.create(english=word_vocab, audio=tur_vocab[1], website="Vocabulary")
    create_vocab.save()

    if tur_mer[0] is not None:
        for tr in tur_mer[0]:
            create_tr = create_mer.turkish.create(turkish=tr)
            create_tr.save()
    if tur_ox[0] is not None:
        for tr in tur_ox[0]:
            create_tr = create_ox.turkish.create(turkish=tr)
            create_tr.save()
    if tur_dict[0] is not None:
        for tr in tur_dict[0]:
            create_tr = create_dict.turkish.create(turkish=tr)
            create_tr.save()
    if tur_vocab[0] is not None:
        for tr in tur_vocab[0]:
            create_tr = create_vocab.turkish.create(turkish=tr)
            create_tr.save()


def search_word(word):
    pre_url = 'https://tureng.com/tr/turkce-ingilizce/{}'
    plus_added_search = '+'.join(str(word).split())
    url = pre_url.format(str(plus_added_search))
    html = requests.get(url).content
    soup = BeautifulSoup(html, 'lxml')

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
            audio_and_tr[0] = tr_list[:3]
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


def reset_reminder_open():
    profiles = Profile.objects.all()
    for p in profiles:
        p.open_reminder_daily = False
        p.save()


def reset_daily_achievements():
    achievements = AchievementTracker.objects.all()
    for ach in achievements:
        if 1 <= ach.achiev_no <= 4:
            ach.progress_current = 0
            ach.progress_star = 0
            ach.save()








