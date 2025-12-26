from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # App URLs will be included here once created
    path('api/users/', include('apps.users.urls')),
    path('api/customers/', include('apps.customers.urls')),
    path('api/vehicles/', include('apps.vehicles.urls')),
    path('api/services/', include('apps.services.urls')),
    path('api/parts/', include('apps.parts.urls')),
    path('api/invoices/', include('apps.invoices.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]
