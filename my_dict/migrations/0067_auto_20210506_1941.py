# Generated by Django 3.1.5 on 2021-05-06 16:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0066_auto_20210506_1934'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='custom_background',
            field=models.CharField(blank=True, default='teal', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='custom_navbar',
            field=models.CharField(blank=True, default='teal', max_length=100, null=True),
        ),
    ]
