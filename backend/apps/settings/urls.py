from django.urls import path
from .views import GarageSettingsView

urlpatterns = [
    path('', GarageSettingsView.as_view(), name='settings'),
]
