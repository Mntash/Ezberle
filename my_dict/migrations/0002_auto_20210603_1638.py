# Generated by Django 3.1.5 on 2021-06-03 13:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='producttracker',
            old_name='id',
            new_name='uuid',
        ),
        migrations.RenameField(
            model_name='shopproducts',
            old_name='id',
            new_name='uuid',
        ),
    ]