# Generated by Django 3.1.5 on 2021-03-12 13:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0038_auto_20210312_1605'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='reminder_count',
            field=models.IntegerField(default=0),
        ),
    ]
