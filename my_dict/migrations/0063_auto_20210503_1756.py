# Generated by Django 3.1.5 on 2021-05-03 14:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0062_auto_20210503_1721'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='producttracker',
            name='product',
        ),
        migrations.AddField(
            model_name='producttracker',
            name='color',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='producttracker',
            name='type',
            field=models.CharField(default='', max_length=30),
        ),
    ]
