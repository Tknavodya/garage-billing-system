# JWT Authentication System

This document explains the JWT-based authentication system implemented for the Garage Billing System.

## 🔐 Authentication Features

### ✅ Implemented Features
- **JWT Token Authentication** using djangorestframework-simplejwt
- **Custom User Model** mapped to existing `users` table
- **Email-based Authentication** instead of username
- **Role-based Permissions** (admin, staff)
- **Secure Password Hashing** using Django's built-in hashers
- **Token Refresh** mechanism
- **User Management** endpoints
- **Custom Permissions** and utilities

### 🛠️ Technical Implementation

#### User Model
- Maps to existing `users` table in database
- Custom `UserManager` for user creation
- Email as USERNAME_FIELD
- Secure password handling with `password_hash` field
- Role-based system (admin, staff)

#### Authentication Endpoints
```
POST /api/users/auth/login/      - User login (get tokens)
POST /api/users/auth/refresh/    - Refresh access token
POST /api/users/auth/token/      - Alternative token endpoint
POST /api/users/logout/          - Logout (blacklist refresh token)
```

#### User Management Endpoints
```
GET    /api/users/users/         - List users (admin only)
POST   /api/users/users/         - Create user (admin only)
GET    /api/users/users/me/      - Get current user profile
PUT    /api/users/users/update_profile/  - Update profile
POST   /api/users/users/change_password/ - Change password
POST   /api/users/users/{id}/toggle_active/ - Toggle user status (admin)
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Database
Ensure your `.env` file in the backend directory contains:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_NAME=garage_management
DATABASE_USER=root
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=3306
```

### 3. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Admin User
```bash
python manage.py create_admin --email admin@garage.com --password admin123 --name "Admin User"
```

### 5. Start Development Server
```bash
python manage.py runserver
```

### 6. Test Authentication
```bash
python test_auth.py
```

## 📋 Usage Examples

### Login Request
```bash
curl -X POST http://localhost:8000/api/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@garage.com",
    "password": "admin123"
  }'
```

### Login Response
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@garage.com",
    "role": "admin",
    "created_at": "2026-01-20T10:00:00Z",
    "is_active": true
  }
}
```

### Authenticated Request
```bash
curl -X GET http://localhost:8000/api/users/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Token Refresh
```bash
curl -X POST http://localhost:8000/api/users/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

## 🔒 Security Features

### JWT Configuration
- **Access Token Lifetime**: 60 minutes
- **Refresh Token Lifetime**: 7 days
- **Token Rotation**: Enabled (new refresh token on each refresh)
- **Blacklisting**: Old tokens are blacklisted after rotation
- **Algorithm**: HS256

### Password Security
- Minimum 6 characters
- Django's built-in password hashing (PBKDF2)
- Secure password validation

### Permissions
- **IsAuthenticated**: Requires valid JWT token
- **IsAdminUser**: Admin role required
- **IsStaffOrAdmin**: Staff or admin role required
- **IsOwnerOrAdmin**: Owner or admin access only

## 🧪 Custom Components

### Files Created/Modified
```
backend/apps/users/
├── models.py          - Custom User model
├── serializers.py     - Authentication serializers
├── views.py          - Authentication views
├── urls.py           - Authentication URLs
├── permissions.py    - Custom permissions
├── utils.py          - Authentication utilities
├── backends.py       - Email authentication backend
└── management/
    └── commands/
        └── create_admin.py  - Admin user creation command
```

### Custom Utilities
- **Token Generation**: `generate_tokens_for_user()`
- **User Authentication**: `authenticate_user()`
- **Password Validation**: `validate_password_strength()`
- **Permission Checking**: `check_user_permissions()`

## 🔧 Integration with Other Apps

### Protecting Views
```python
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsAdminUser

class MyProtectedView(APIView):
    permission_classes = [IsAuthenticated]
    # or
    permission_classes = [IsAdminUser]
```

### Using Authentication Mixins
```python
from apps.users.utils import AuthenticationMixin

class MyView(AuthenticationMixin, APIView):
    def get(self, request):
        if self.is_admin():
            # Admin-only logic
            pass
```

### Frontend Integration
Include JWT token in requests:
```javascript
const token = localStorage.getItem('access_token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## ⚠️ Important Notes

1. **Database Mapping**: The User model maps to the existing `users` table without requiring schema changes
2. **Password Field**: Uses `password_hash` field name to match existing schema
3. **Email Authentication**: Users log in with email instead of username
4. **Role System**: Supports 'admin' and 'staff' roles as defined in existing schema
5. **Token Storage**: Store refresh tokens securely on the client side
6. **CORS**: Configured for development (update for production)

## 🐛 Troubleshooting

### Common Issues
1. **"Invalid token"**: Check token format and expiration
2. **"User not found"**: Verify email exists in database
3. **"Permission denied"**: Check user role and permissions
4. **Connection errors**: Ensure Django server is running

### Debug Mode
Enable Django debug mode in settings for detailed error messages during development.

## 🔄 Next Steps

1. **Frontend Integration**: Connect React frontend with authentication endpoints
2. **Password Policies**: Implement stricter password requirements if needed
3. **Email Verification**: Add email verification for new users
4. **Rate Limiting**: Implement rate limiting for authentication endpoints
5. **Audit Logging**: Add authentication event logging