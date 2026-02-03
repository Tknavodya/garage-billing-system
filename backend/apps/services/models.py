from django.db import models

class Service(models.Model):
    CATEGORY_CHOICES = [
        ('Maintenance', 'Maintenance'),
        ('Brakes', 'Brakes'),
        ('Tires', 'Tires'),
        ('Engine', 'Engine'),
        ('Climate', 'Climate'),
        ('Electrical', 'Electrical'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Duration in minutes")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Maintenance')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'services'
        ordering = ['category', 'name']

    def __str__(self):
        return self.name
