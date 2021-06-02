# Generated by Django 3.1.5 on 2021-05-18 16:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0091_auto_20210518_1802'),
    ]

    operations = [
        migrations.RenameField(
            model_name='profile',
            old_name='custom_background',
            new_name='custom_background_color',
        ),
        migrations.RenameField(
            model_name='profile',
            old_name='custom_navbar',
            new_name='custom_navbar_color',
        ),
        migrations.AddField(
            model_name='producttracker',
            name='background_image',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='custom_background_image',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
