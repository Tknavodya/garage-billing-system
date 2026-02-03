from django.db import models
from django.core.exceptions import ValidationError

class GarageSettings(models.Model):
    # Business Info
    garage_name = models.CharField(max_length=255, default='AutoGarage')
    email = models.EmailField(default='support@autogarage.com')
    phone = models.CharField(max_length=50, default='+1 (555) 000-0000')
    address = models.TextField(default='123 Garage Street, New York, NY 10001')
    
    # Notifications
    email_notifications = models.BooleanField(default=True)
    overdue_reminders = models.BooleanField(default=True)
    low_stock_alerts = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.pk and GarageSettings.objects.exists():
            # If you want to ensure only one instance, block creation if one exists
            # Or simpler: just update the existing one if we try to create another?
            # Enforcing logic here to prevent multiple rows via shell/admin
             raise ValidationError('There can be only one GarageSettings instance')
        return super(GarageSettings, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.garage_name} Settings"
