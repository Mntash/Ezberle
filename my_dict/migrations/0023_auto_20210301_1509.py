# Generated by Django 3.1.5 on 2021-03-01 12:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0022_auto_20210228_1724'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='wordoftheday',
            name='create_time',
        ),
        migrations.AddField(
            model_name='wordoftheday',
            name='audio',
            field=models.CharField(max_length=300, null=True),
        ),
    ]
