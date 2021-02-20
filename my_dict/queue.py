from rq import Queue
from dictionary.worker import conn
from dictionary.my_dict.utils import count_words_at_url
from datetime import timedelta


q = Queue(connection=conn)
result = q.enqueue(count_words_at_url, 'http://heroku.com')