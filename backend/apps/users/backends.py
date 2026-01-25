from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from .models import User


class EmailBackend(BaseBackend):
    """Custom authentication backend using email instead of username."""
    
    def authenticate(self, request, email=None, password=None, **kwargs):
        """Authenticate user using email and password."""
        if email is None or password is None:
            return None
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password) and user.is_active:
                return user
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user.
            User().set_password(password)
            return None
    
    def get_user(self, user_id):
        """Get user by ID."""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None