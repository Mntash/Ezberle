import requests


def count_words_at_url(url):
    resp = requests.get(url)
    print(len(resp.text.split()))
