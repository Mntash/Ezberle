# Generated by Django 3.1.5 on 2021-02-08 18:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0019_auto_20210109_2018'),
    ]

    operations = [
        migrations.CreateModel(
            name='WordOfTheDay',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('english', models.CharField(max_length=100, null=True)),
                ('turkish', models.CharField(max_length=100, null=True)),
                ('create_time', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
