from django.db import models

from apps.customers.models import Customer

class Vehicle(models.Model):
    FUEL_CHOICES = [
        ('Petrol', 'Petrol'),
        ('Diesel', 'Diesel'),
        ('Electric', 'Electric'),
        ('Hybrid', 'Hybrid'),
        ('CNG', 'CNG'),
        ('LPG', 'LPG'),
    ]

    TRANSMISSION_CHOICES = [
        ('Manual', 'Manual'),
        ('Automatic', 'Automatic'),
        ('CVT', 'CVT'),
        ('DCT', 'DCT'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='vehicles')
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    plate_number = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=30, blank=True, null=True)
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES, default='Petrol')
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, default='Manual')
    mileage = models.IntegerField(blank=True, null=True, help_text="Current mileage in km")
    vin = models.CharField(max_length=17, blank=True, null=True, help_text="Vehicle Identification Number")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.year} {self.make} {self.model} ({self.plate_number})"
