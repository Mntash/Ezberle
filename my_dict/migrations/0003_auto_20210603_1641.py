# Generated by Django 3.1.5 on 2021-06-03 13:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0002_auto_20210603_1638'),
    ]

    operations = [
        migrations.RenameField(
            model_name='producttracker',
            old_name='uuid',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='shopproducts',
            old_name='uuid',
            new_name='id',
        ),
    ]