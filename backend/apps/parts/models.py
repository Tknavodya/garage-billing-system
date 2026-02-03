from django.db import models

class Part(models.Model):
    CATEGORY_CHOICES = [
        ('Filters', 'Filters'),
        ('Brakes', 'Brakes'),
        ('Engine', 'Engine'),
        ('Exterior', 'Exterior'),
        ('Fluids', 'Fluids'),
        ('Electrical', 'Electrical'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    part_number = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    min_stock = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'parts'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.part_number})"
