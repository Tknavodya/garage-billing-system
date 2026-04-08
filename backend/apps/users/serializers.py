import secrets
from datetime import timedelta

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.contrib.auth import authenticate
from .models import User, PasswordResetOTP


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with user information."""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['name'] = user.name
        token['email'] = user.email
        token['role'] = user.role
        
        return token

    def validate(self, attrs):
        """Validate user credentials and return tokens with user data."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('Your account is pending administrator approval.')
                
                refresh = self.get_token(user)
                
                return {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                }
            else:
                raise serializers.ValidationError('Invalid email or password.')
        else:
            raise serializers.ValidationError('Must include email and password.')


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate user credentials."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Check if user exists first to provide specific error
            from .models import User
            try:
                user_obj = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError('We cannot find an account with that email address.')
            
            # Use authenticate to verify password
            from django.contrib.auth import authenticate
            user = authenticate(email=email, password=password)
            
            if user:
                if user.is_active:
                    attrs['user'] = user
                    return attrs
                else:
                    raise serializers.ValidationError('Your account is pending administrator approval.')
            else:
                raise serializers.ValidationError('The password you entered is incorrect.')
        else:
            raise serializers.ValidationError('Must include email and password.')


class PublicRegistrationSerializer(serializers.Serializer):
    """Serializer for public account requests."""

    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')

        user = User.objects.create(
            name=validated_data['name'].strip(),
            email=validated_data['email'],
            role='staff',
            is_active=False,
            is_staff=False,
            is_superuser=False,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information."""
    
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'role', 'created_at', 'is_active')
        read_only_fields = ('id', 'created_at')


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users."""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'password_confirm', 'role')
        
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        """Create new user with hashed password."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    def validate(self, attrs):
        """Validate password change."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for initiating a password reset email."""

    email = serializers.EmailField()

    def save(self):
        email = self.validated_data['email'].strip().lower()
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return None

        PasswordResetOTP.objects.filter(user=user, used=False).update(used=True)

        otp_code = f"{secrets.randbelow(1000000):06d}"
        expires_at = timezone.now() + timedelta(minutes=10)
        otp_record = PasswordResetOTP.objects.create(
            user=user,
            code=otp_code,
            expires_at=expires_at,
        )

        subject = 'Your GarageCore password reset code'
        message = (
            f"Hello {user.name},\n\n"
            f"Use the OTP below to reset your GarageCore password:\n\n"
            f"{otp_code}\n\n"
            f"This code expires in 10 minutes. If you did not request this reset, you can ignore this email."
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as exc:
            otp_record.delete()
            raise serializers.ValidationError(
                'Unable to send OTP email. Check SMTP settings and app password.'
            ) from exc

        return user


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for completing a password reset."""

    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': "New passwords don't match."
            })

        user = User.objects.filter(email__iexact=attrs['email'].strip()).first()
        if not user:
            raise serializers.ValidationError({'email': 'No user found with this email.'})

        otp_record = PasswordResetOTP.objects.filter(
            user=user,
            code=attrs['otp'],
            used=False,
            expires_at__gte=timezone.now(),
        ).first()

        if not otp_record:
            raise serializers.ValidationError({'otp': 'Invalid or expired OTP.'})

        attrs['user'] = user
        attrs['otp_record'] = otp_record
        return attrs

    def save(self):
        user = self.validated_data['user']
        otp_record = self.validated_data['otp_record']

        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password_hash'])

        otp_record.used = True
        otp_record.save(update_fields=['used'])

        return user
