from django.utils import timezone
from .models import WotdEn, Profile
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


def word_of_the_day():
    try:
        all_wotds = WotdEn.objects.all()
        for wotd in all_wotds:
            wotd.delete()
    except:
        pass
    req_mer = requests.get('https://www.merriam-webster.com/', headers={"User-Agent": "Mozilla/5.0"}).content
    req_ox = requests.get('https://www.oxfordlearnersdictionaries.com/', headers={"User-Agent": "Mozilla/5.0"}).content
    req_dict = requests.get('https://www.dictionary.com/', headers={"User-Agent": "Mozilla/5.0"}).content
    req_camb = requests.get('https://dictionary.cambridge.org/', headers={"User-Agent": "Mozilla/5.0"}).content
    soup_mer = BeautifulSoup(req_mer, 'lxml')
    soup_ox = BeautifulSoup(req_ox, 'lxml')
    soup_dict = BeautifulSoup(req_dict, 'lxml')
    soup_camb = BeautifulSoup(req_camb, 'lxml')
    word_mer = soup_mer.find('a', {'class': 'header-wht'}).get_text().strip()
    word_ox = soup_ox.find('a', {'class': 'headword'}).find_next().get_text().strip()
    word_dict = soup_dict.find('span', {'class': 'colored-card-heading'}).text.strip()
    word_camb = soup_camb.find('p', {'class': 'wotd-hw'}).find('a').get_text().strip()
    tur_mer = []
    tur_ox = []
    tur_dict = []
    tur_camb = []
    if search_word(word_mer) is not None:
        tur_mer = search_word(word_mer)
    if search_word(word_ox) is not None:
        tur_ox = search_word(word_ox)
    if search_word(word_dict) is not None:
        tur_dict = search_word(word_dict)
    if search_word(word_camb) is not None:
        tur_camb = search_word(word_camb)

    create_mer = WotdEn.objects.create(english=word_mer, audio=tur_mer[1], website="Merriam")
    create_mer.save()
    create_ox = WotdEn.objects.create(english=word_ox, audio=tur_ox[1], website="Oxford")
    create_ox.save()
    create_dict = WotdEn.objects.create(english=word_dict, audio=tur_dict[1], website="Dictionary")
    create_dict.save()
    create_camb = WotdEn.objects.create(english=word_camb, audio=tur_camb[1], website="Cambridge")
    create_camb.save()

    for tr in tur_mer[0]:
        create_tr = create_mer.turkish.create(turkish=tr)
        create_tr.save()
    for tr in tur_ox[0]:
        create_tr = create_ox.turkish.create(turkish=tr)
        create_tr.save()
    for tr in tur_dict[0]:
        create_tr = create_dict.turkish.create(turkish=tr)
        create_tr.save()
    for tr in tur_camb[0]:
        create_tr = create_camb.turkish.create(turkish=tr)
        create_tr.save()


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
        tr_list = []

        for row in rows:
            if not row.attrs:
                tds = row.find_all('td')
                tr = tds[3].text.strip()
                tr_list.append(tr)

        audio_and_tr.append(tr_list[:3])

        if soup.find('audio', {'id': 'turengVoiceENTRENus'}):
            if soup.find('audio', {'id': 'turengVoiceENTRENus'}).find('source'):
                audio = soup.find('audio', {'id': 'turengVoiceENTRENus'}).find('source')['src']
                audio_and_tr.append(audio)
        else:
            audio_and_tr.append(None)

        return audio_and_tr[0], audio_and_tr[1]

    except AttributeError:
        return None