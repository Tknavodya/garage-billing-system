"""
Test script for JWT authentication
Run this after setting up the database and creating an admin user
"""

import requests
import json

# Configuration
BASE_URL = 'http://localhost:8000'  # Adjust if using different port
TEST_EMAIL = 'admin@garage.com'
TEST_PASSWORD = 'admin123'

def test_authentication():
    print("🔐 Testing JWT Authentication System")
    print("=" * 50)
    
    # Test 1: Login
    print("\n1️⃣ Testing Login...")
    login_url = f"{BASE_URL}/api/users/auth/login/"
    login_data = {
        'email': TEST_EMAIL,
        'password': TEST_PASSWORD
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"   User: {data['user']['name']} ({data['user']['email']})")
            print(f"   Role: {data['user']['role']}")
            
            # Store tokens for further testing
            access_token = data['access']
            refresh_token = data['refresh']
            
            # Test 2: Access protected endpoint
            print("\n2️⃣ Testing Protected Endpoint...")
            headers = {'Authorization': f'Bearer {access_token}'}
            profile_url = f"{BASE_URL}/api/users/users/me/"
            
            profile_response = requests.get(profile_url, headers=headers)
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                print("✅ Protected endpoint access successful!")
                print(f"   Profile: {profile_data['name']} - {profile_data['role']}")
            else:
                print("❌ Protected endpoint access failed!")
                print(f"   Status: {profile_response.status_code}")
                print(f"   Response: {profile_response.text}")
            
            # Test 3: Token refresh
            print("\n3️⃣ Testing Token Refresh...")
            refresh_url = f"{BASE_URL}/api/users/auth/refresh/"
            refresh_data = {'refresh': refresh_token}
            
            refresh_response = requests.post(refresh_url, json=refresh_data)
            if refresh_response.status_code == 200:
                refresh_result = refresh_response.json()
                print("✅ Token refresh successful!")
                print(f"   New access token generated")
            else:
                print("❌ Token refresh failed!")
                print(f"   Status: {refresh_response.status_code}")
                print(f"   Response: {refresh_response.text}")
            
            # Test 4: Logout
            print("\n4️⃣ Testing Logout...")
            logout_url = f"{BASE_URL}/api/users/logout/"
            logout_data = {'refresh': refresh_token}
            
            logout_response = requests.post(logout_url, json=logout_data, headers=headers)
            if logout_response.status_code == 200:
                print("✅ Logout successful!")
            else:
                print("❌ Logout failed!")
                print(f"   Status: {logout_response.status_code}")
                print(f"   Response: {logout_response.text}")
                
        else:
            print("❌ Login failed!")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed!")
        print("   Make sure the Django server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_authentication()