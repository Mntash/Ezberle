# Generated by Django 3.1.5 on 2021-05-17 11:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0082_auto_20210517_1407'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shopproducts',
            name='keyword',
        ),
    ]
