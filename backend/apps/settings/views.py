from rest_framework import views, response, status, permissions
from .models import GarageSettings
from .serializers import GarageSettingsSerializer

class GarageSettingsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get the first setting object or create one if it doesn't exist
        settings, created = GarageSettings.objects.get_or_create(pk=1)
        serializer = GarageSettingsSerializer(settings)
        return response.Response(serializer.data)

    def put(self, request):
        settings, created = GarageSettings.objects.get_or_create(pk=1)
        serializer = GarageSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
