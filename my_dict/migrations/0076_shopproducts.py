# Generated by Django 3.1.5 on 2021-05-17 10:42

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('my_dict', '0075_delete_shopproducts'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShopProducts',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('text', models.TextField()),
                ('price', models.IntegerField(default=0)),
                ('type', models.CharField(default='', max_length=30)),
                ('color', models.CharField(blank=True, max_length=30, null=True)),
                ('background_image', models.CharField(blank=True, max_length=30, null=True)),
                ('keyword', models.CharField(max_length=30, null=True)),
            ],
        ),
    ]
