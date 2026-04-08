from django.db import models

from apps.customers.models import Customer
from apps.vehicles.models import Vehicle

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Overdue', 'Overdue'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('Cash', 'Cash'),
        ('Card', 'Card'),
        ('Bank Transfer', 'Bank Transfer'),
        ('UPI', 'UPI'),
        ('Wallet', 'Wallet'),
        ('Other', 'Other'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    invoice_number = models.CharField(max_length=20, unique=True, blank=True)
    date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=40, choices=PAYMENT_METHOD_CHOICES, default='Cash')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-date', '-created_at']

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            last_invoice = Invoice.objects.all().order_by('id').last()
            if last_invoice:
                 # Extract number from INV-00001
                 try:
                     last_number = int(last_invoice.invoice_number.split('-')[1])
                     new_number = last_number + 1
                 except (IndexError, ValueError):
                     new_number = Invoice.objects.count() + 1
            else:
                new_number = 1
            self.invoice_number = f"INV-{new_number:05d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.name}"

class InvoiceService(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='services', on_delete=models.CASCADE)
    service = models.ForeignKey('services.Service', on_delete=models.PROTECT)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.service.name}"

class InvoicePart(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='parts', on_delete=models.CASCADE)
    part = models.ForeignKey('parts.Part', on_delete=models.PROTECT)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.part.name} ({self.quantity})"
