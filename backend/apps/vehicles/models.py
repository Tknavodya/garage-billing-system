from django.db import models

from apps.customers.models import Customer

class Vehicle(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='vehicles')
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    plate_number = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.year} {self.make} {self.model} ({self.plate_number})"
