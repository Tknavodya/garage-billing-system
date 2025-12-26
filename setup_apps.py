import os

APPS = [
    'users',
    'customers',
    'vehicles',
    'services',
    'parts',
    'invoices',
    'dashboard'
]

BASE_DIR = os.path.join(os.getcwd(), 'backend', 'apps')

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Created {path}")

def main():
    for app in APPS:
        app_dir = os.path.join(BASE_DIR, app)
        
        # __init__.py
        create_file(os.path.join(app_dir, '__init__.py'), "")
        
        # apps.py
        app_config_name = app.capitalize() + 'Config'
        apps_content = f"""from django.apps import AppConfig

class {app_config_name}(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.{app}'
"""
        create_file(os.path.join(app_dir, 'apps.py'), apps_content)
        
        # models.py
        models_content = "from django.db import models\n\n# Create your models here.\n"
        create_file(os.path.join(app_dir, 'models.py'), models_content)
        
        # serializers.py
        serializers_content = "from rest_framework import serializers\n\n# Create your serializers here.\n"
        create_file(os.path.join(app_dir, 'serializers.py'), serializers_content)
        
        # views.py
        views_content = "from rest_framework import viewsets\nfrom rest_framework.decorators import action\nfrom rest_framework.response import Response\n\n# Create your views here.\n"
        create_file(os.path.join(app_dir, 'views.py'), views_content)
        
        # urls.py
        urls_content = """from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# router.register(r'items', ItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
"""
        create_file(os.path.join(app_dir, 'urls.py'), urls_content)

if __name__ == '__main__':
    main()
