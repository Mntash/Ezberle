# Generated by Django 3.1.5 on 2021-06-02 14:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0099_auto_20210602_1747'),
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
