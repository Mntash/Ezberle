import requests
from bs4 import BeautifulSoup


github = "https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears-long.txt"
html_tur = requests.get(github).content
soup_tur = BeautifulSoup(html_tur, 'lxml')
tds = soup_tur.find_all('td', class_='blob-code')[530:540]
print(tds)


