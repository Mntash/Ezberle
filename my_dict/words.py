import requests
from .models import WordDb
from bs4 import BeautifulSoup

github = "https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears-long.txt"
html_tur = requests.get(github).content
soup_tur = BeautifulSoup(html_tur, 'lxml')
tables = soup_tur.find_all('table')

url = "https://twinword-word-graph-dictionary.p.rapidapi.com/association/"

querystring = {"entry": ""}
print(querystring)

# headers = {
#     'x-rapidapi-key': "c5cbdceae4msh740bd52ea8d5e8bp1f6881jsn7c651aa39638",
#     'x-rapidapi-host': "twinword-word-graph-dictionary.p.rapidapi.com"
#     }
#
# response = requests.request("GET", url, headers=headers, params=querystring)
#
# print(response.text)