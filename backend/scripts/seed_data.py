import os
import sys
import django
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.services.models import Service
from apps.customers.models import Customer
from apps.vehicles.models import Vehicle

User = get_user_model()

def run_seed():
    print("Seeding data...")

    # 1. Create Superuser
    email = "admin@example.com"
    password = "password123"
    name = "Admin User"
    
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email,
            password=password,
            name=name
        )
        print(f"Created superuser: {email} / {password}")
    else:
        # Reset password if exists
        user = User.objects.get(email=email)
        user.set_password(password)
        user.save()
        print(f"Reset password for: {email} / {password}")

    # 2. Create Dummy Services
    # Service model: name, description, price, duration (minutes), category
    services = [
        {"name": "Oil Change", "description": "Full synthetic oil change", "price": 50.00, "duration": 30, "category": "Maintenance"},
        {"name": "Brake Inspection", "description": "Check brake pads and rotors", "price": 30.00, "duration": 60, "category": "Brakes"},
        {"name": "Tire Rotation", "description": "Rotate tires for even wear", "price": 25.00, "duration": 30, "category": "Tires"},
    ]

    for svc_data in services:
        service, created = Service.objects.get_or_create(
            name=svc_data["name"],
            defaults=svc_data
        )
        if created:
            print(f"Created service: {service.name}")
        else:
            print(f"Service exists: {service.name}")

    # 3. Create Dummy Customer & Vehicle
    # Customer model: name, email, phone, address
    # Vehicle model: customer, make, model, year, plate_number
    customer_email = "customer@example.com"
    if not Customer.objects.filter(email=customer_email).exists():
        customer = Customer.objects.create(
            name="John Doe",
            email=customer_email,
            phone="555-0101",
            address="123 Main St"
        )
        print(f"Created customer: {customer.name}")
        
        Vehicle.objects.create(
            customer=customer,
            make="Toyota",
            model="Camry",
            year=2020,
            plate_number="ABC-1234"
        )
        print("Created vehicle for customer")
    else:
        print("Customer exists")

    print("Seeding complete!")

if __name__ == "__main__":
    run_seed()
