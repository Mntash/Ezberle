# Generated by Django 3.1.5 on 2021-04-18 09:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0046_auto_20210417_1504'),
    ]

    operations = [
        migrations.AddField(
            model_name='achievements',
            name='progress_max',
            field=models.IntegerField(default=0),
        ),
    ]
