# Generated by Django 3.1.5 on 2021-05-18 15:02

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0090_auto_20210518_1758'),
    ]

    operations = [
        migrations.AlterField(
            model_name='producttracker',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False),
        ),
    ]
