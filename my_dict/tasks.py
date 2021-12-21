from django.utils import timezone
from .models import *
from bs4 import BeautifulSoup
import requests
import lxml
import cchardet
from django.core.mail import send_mail


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
            WotdEn.objects.all().delete()
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


def reminder_subscription():
    subject = 'Hatırlatıcı'
    email_from = 'Ezberle <ezberle@outlook.com.tr>'
    email_list = []
    reminder_subs = ReminderSubscription.objects.all()
    html_message = ''
    for sub in reminder_subs:
        email_list.append(sub.email)
    for email in email_list:
        user = User.objects.get(email=email)
        reminder_words_table = "<div class='column-table'><table><tr><th>Hatırlatıcıya Kaydedilen Kelimeler</th></tr>"
        if WordEn.objects.filter(user=user, is_in_reminder_list=True):
            reminder_list = []
            reminder_words = WordEn.objects.filter(user=user, is_in_reminder_list=True)
            for word in reminder_words:
                reminder_list.append(word.english.capitalize())
            for i, word in enumerate(reminder_list):
                if i is not len(reminder_list) - 1:
                    reminder_words_table += f'<tr><td>{word}</td></tr>'
                else:
                    reminder_words_table += f'<tr><td>{word}</td></tr></table></div>'
        else:
            data_is_null = "<tr><td>Yok</td></tr></table></div>"
            reminder_words_table += data_is_null

        types = ['db', 'unl', 'l']
        quiz_table = ''
        for type in types:

            if type == 'db':
                obj_filter = QuizRecorder.objects.filter(user=user, is_db=True)
            elif type == 'unl':
                obj_filter = QuizRecorder.objects.filter(user=user, is_db=False, is_learned=False)
            else:
                obj_filter = QuizRecorder.objects.filter(user=user, is_db=False, is_learned=True)

            if obj_filter:
                quiz = []
                obj = obj_filter
                for obj in obj:
                    quiz.append(
                        {
                            'english': obj.english.capitalize(),
                            'is_correct': obj.is_correct,
                            'create_time': obj.create_time.strftime('%d/%m/%Y')
                        }
                    )
                for i, word in enumerate(quiz):
                    is_correct = "#2cb74c" if word['is_correct'] else "#cd5c5c"
                    quiz_ctime = word['create_time']
                    if i == 0:
                        if type == 'db':
                            if quiz_ctime:
                                quiz_table += f"<div class='column-table'><table><tr><th>Biliyor Muydun? Quizi Sonuçları (<span style='font-size:small'>{quiz_ctime}</span>)</th></tr>"
                            else:
                                quiz_table += "<div class='column-table'><table><tr><th>Biliyor Muydun? Quizi Sonuçları</th></tr>"
                        elif type == 'unl':
                            if quiz_ctime:
                                quiz_table += f"<div class='column-table'><table><tr><th>Öğreneceklerim Quizi Sonuçları (<span style='font-size:small'>{quiz_ctime}</span>)</th></tr>"
                            else:
                                quiz_table += "<div class='column-table'><table><tr><th>Öğreneceklerim Quizi Sonuçları</th></tr>"
                        else:
                            if quiz_ctime:
                                quiz_table += f"<div class='column-table'><table><tr><th>Öğrendiklerim Quizi Sonuçları (<span style='font-size:small'>{quiz_ctime}</span>)</th></tr>"
                            else:
                                quiz_table += "<div class='column-table'><table><tr><th>Öğrendiklerim Quizi Sonuçları</th></tr>"
                    if i is not len(quiz) - 1:
                        quiz_table += f'<tr><td style="color:{is_correct}">{word["english"]}</td></tr>'
                    else:
                        quiz_table += f'<tr><td style="color:{is_correct}">{word["english"]}</td></tr></table></div>'
            else:
                if type == 'db':
                    quiz_table += "<div class='column-table'><table><tr><th>Biliyor Muydun? Quizi Sonuçları</th></tr>"
                elif type == 'unl':
                    quiz_table += "<div class='column-table'><table><tr><th>Öğreneceklerim Quizi Sonuçları</th></tr>"
                else:
                    quiz_table += "<div class='column-table'><table><tr><th>Öğrendiklerim Quizi Sonuçları</th></tr>"
                data_is_null = "<tr><td>Yok</td></tr></table></div>"
                quiz_table += data_is_null

        html_message = "<style>" \
                       "td,th {border:1px solid #dddddd;text-align:left;padding:8px}" \
                       "td {background:ghostwhite;font-family:audiowide}" \
                       "table {border-collapse:collapse}" \
                       ".row-table::after {content: "";clear: both;display: table;}" \
                       ".column-table {float: left;width: 20%;padding: 5px;}" \
                       "</style>" \
                       "<br><br><a href='https://ezberle.herokuapp.com/accounts/login/'>Ezberle'ye git</a><br>" \
                       f"<a href='http://127.0.0.1:8000/reminder_sub/unsubscribe/{email}/true'>Aboneliği iptal et (Siteye yönlendirir)</a>" \
                       "<div class='row-table'>"
        html_message += reminder_words_table + quiz_table + '</div>'
        send_mail(subject, "", email_from, (email, ), fail_silently=False, html_message=html_message)











