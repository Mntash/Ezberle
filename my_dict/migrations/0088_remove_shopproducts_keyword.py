# Generated by Django 3.1.5 on 2021-05-18 14:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0087_shopproducts_keyword'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shopproducts',
            name='keyword',
        ),
    ]
