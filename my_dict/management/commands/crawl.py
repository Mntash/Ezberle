from django.core.management.base import BaseCommand
from words_spider.words_spider.spiders.word_spider import WordsSpider
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings


class Command(BaseCommand):
    help = "Release the spiders"

    def handle(self, *args, **options):
        process = CrawlerProcess(get_project_settings())
        process.crawl(WordsSpider)
        process.start()