from django.utils import timezone
from .models import WotdEn, Profile, WordDb
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
        if WotdEn.objects.all():
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
    if search_word(word_camb) is not None:
        tur_camb = search_word(word_camb)
    else:
        tur_camb = [None, None]

    create_mer = WotdEn.objects.create(english=word_mer, audio=tur_mer[1], website="Merriam")
    create_mer.save()
    create_ox = WotdEn.objects.create(english=word_ox, audio=tur_ox[1], website="Oxford")
    create_ox.save()
    create_dict = WotdEn.objects.create(english=word_dict, audio=tur_dict[1], website="Dictionary")
    create_dict.save()
    create_camb = WotdEn.objects.create(english=word_camb, audio=tur_camb[1], website="Cambridge")
    create_camb.save()

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
    if tur_camb[0] is not None:
        for tr in tur_camb[0]:
            create_tr = create_camb.turkish.create(turkish=tr)
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


def add_words2_db():
    url = "https://twinword-word-graph-dictionary.p.rapidapi.com/association/"
    headers = {
        'x-rapidapi-key': "c5cbdceae4msh740bd52ea8d5e8bp1f6881jsn7c651aa39638",
        'x-rapidapi-host': "twinword-word-graph-dictionary.p.rapidapi.com"
    }
    github = "https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears-long.txt"
    html_tur = requests.get(github).content
    soup_tur = BeautifulSoup(html_tur, 'lxml')
    tds = soup_tur.find_all('td', class_='blob-code')[:100]
    for td in tds:
        response = requests.request("GET", url, headers=headers, params={'entry': td.text})
        en = response.json()['response']
        obj = WordDb.objects.create(english=en)
        obj.save()








