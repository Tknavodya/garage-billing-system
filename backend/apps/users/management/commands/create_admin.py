from django.core.management.base import BaseCommand
from apps.users.models import User


class Command(BaseCommand):
    help = 'Create a test admin user'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email', default='admin@garage.com')
        parser.add_argument('--password', type=str, help='Admin password', default='admin123')
        parser.add_argument('--name', type=str, help='Admin name', default='Admin User')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        name = options['name']

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email {email} already exists')
            )
            return

        user = User.objects.create(
            email=email,
            name=name,
            role='admin',
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        user.set_password(password)
        user.save()

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created admin user: {email}')
        )