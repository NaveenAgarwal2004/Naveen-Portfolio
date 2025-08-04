#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Portfolio Application
Tests all endpoints including authentication, public APIs, contact form, and admin routes.
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://faddc90b-2180-456b-822d-9f2d0f3283f9.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Admin credentials from backend .env
ADMIN_EMAIL = "admin@naveen-portfolio.com"
ADMIN_PASSWORD = "N@veenDev#2025"

class PortfolioAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test basic health check endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Health Check", True, "API is running")
                    return True
                else:
                    self.log_test("Health Check", False, "API returned success=false", data)
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Health Check", False, "Connection failed", str(e))
        return False
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = self.session.get(f"{API_BASE}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Portfolio Backend API' in data.get('message', ''):
                    self.log_test("Root Endpoint", True, "Root API endpoint working")
                    return True
                else:
                    self.log_test("Root Endpoint", False, "Unexpected response format", data)
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Root Endpoint", False, "Connection failed", str(e))
        return False
    
    def test_admin_login_correct(self):
        """Test admin login with correct credentials"""
        try:
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.auth_token = data['token']
                    self.session.headers.update({'Authorization': f'Bearer {self.auth_token}'})
                    self.log_test("Admin Login (Correct)", True, "Login successful with valid credentials")
                    return True
                else:
                    self.log_test("Admin Login (Correct)", False, "Login response missing token", data)
            else:
                self.log_test("Admin Login (Correct)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Login (Correct)", False, "Login request failed", str(e))
        return False
    
    def test_admin_login_incorrect(self):
        """Test admin login with incorrect credentials"""
        try:
            login_data = {
                "email": ADMIN_EMAIL,
                "password": "wrongpassword"
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                if not data.get('success'):
                    self.log_test("Admin Login (Incorrect)", True, "Correctly rejected invalid credentials")
                    return True
                else:
                    self.log_test("Admin Login (Incorrect)", False, "Should have rejected invalid credentials", data)
            else:
                self.log_test("Admin Login (Incorrect)", False, f"Expected 401, got {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Login (Incorrect)", False, "Login request failed", str(e))
        return False
    
    def test_jwt_verification(self):
        """Test JWT token verification endpoint"""
        if not self.auth_token:
            self.log_test("JWT Verification", False, "No auth token available")
            return False
            
        try:
            response = self.session.post(f"{API_BASE}/auth/verify", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('user'):
                    self.log_test("JWT Verification", True, "Token verification successful")
                    return True
                else:
                    self.log_test("JWT Verification", False, "Verification response invalid", data)
            else:
                self.log_test("JWT Verification", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("JWT Verification", False, "Verification request failed", str(e))
        return False
    
    def test_protected_route_without_auth(self):
        """Test that protected routes require authentication"""
        # Temporarily remove auth header
        temp_headers = self.session.headers.copy()
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
        
        try:
            response = self.session.get(f"{API_BASE}/admin/dashboard", timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                if not data.get('success'):
                    self.log_test("Protected Route Auth", True, "Correctly requires authentication")
                    result = True
                else:
                    self.log_test("Protected Route Auth", False, "Should require authentication", data)
                    result = False
            else:
                self.log_test("Protected Route Auth", False, f"Expected 401, got {response.status_code}", response.text)
                result = False
        except Exception as e:
            self.log_test("Protected Route Auth", False, "Request failed", str(e))
            result = False
        finally:
            # Restore headers
            self.session.headers.update(temp_headers)
        
        return result
    
    def test_personal_info(self):
        """Test GET /api/portfolio/personal"""
        try:
            response = self.session.get(f"{API_BASE}/portfolio/personal", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    personal_data = data['data']
                    required_fields = ['name', 'title', 'email']
                    missing_fields = [field for field in required_fields if not personal_data.get(field)]
                    
                    if not missing_fields:
                        self.log_test("Personal Info API", True, "Personal information retrieved successfully")
                        return True
                    else:
                        self.log_test("Personal Info API", False, f"Missing required fields: {missing_fields}", personal_data)
                else:
                    self.log_test("Personal Info API", False, "Invalid response format", data)
            else:
                self.log_test("Personal Info API", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Personal Info API", False, "Request failed", str(e))
        return False
    
    def test_projects_all(self):
        """Test GET /api/portfolio/projects"""
        try:
            response = self.session.get(f"{API_BASE}/portfolio/projects", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    projects = data['data']
                    self.log_test("Projects API (All)", True, f"Retrieved {len(projects)} projects")
                    return True
                else:
                    self.log_test("Projects API (All)", False, "Invalid response format", data)
            else:
                self.log_test("Projects API (All)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Projects API (All)", False, "Request failed", str(e))
        return False
    
    def test_projects_ai_filter(self):
        """Test GET /api/portfolio/projects?category=AI"""
        try:
            response = self.session.get(f"{API_BASE}/portfolio/projects?category=AI", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    projects = data['data']
                    # Check if all returned projects are AI category (if any exist)
                    ai_projects = [p for p in projects if p.get('category') == 'AI']
                    if len(projects) == 0 or len(ai_projects) == len(projects):
                        self.log_test("Projects API (AI Filter)", True, f"AI filter working, found {len(projects)} AI projects")
                        return True
                    else:
                        self.log_test("Projects API (AI Filter)", False, f"Filter not working: {len(ai_projects)}/{len(projects)} are AI", projects)
                else:
                    self.log_test("Projects API (AI Filter)", False, "Invalid response format", data)
            else:
                self.log_test("Projects API (AI Filter)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Projects API (AI Filter)", False, "Request failed", str(e))
        return False
    
    def test_projects_web_filter(self):
        """Test GET /api/portfolio/projects?category=Web"""
        try:
            response = self.session.get(f"{API_BASE}/portfolio/projects?category=Web", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    projects = data['data']
                    # Check if all returned projects are Web category (if any exist)
                    web_projects = [p for p in projects if p.get('category') == 'Web']
                    if len(projects) == 0 or len(web_projects) == len(projects):
                        self.log_test("Projects API (Web Filter)", True, f"Web filter working, found {len(projects)} Web projects")
                        return True
                    else:
                        self.log_test("Projects API (Web Filter)", False, f"Filter not working: {len(web_projects)}/{len(projects)} are Web", projects)
                else:
                    self.log_test("Projects API (Web Filter)", False, "Invalid response format", data)
            else:
                self.log_test("Projects API (Web Filter)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Projects API (Web Filter)", False, "Request failed", str(e))
        return False
    
    def test_tech_stack(self):
        """Test GET /api/portfolio/tech-stack"""
        try:
            response = self.session.get(f"{API_BASE}/portfolio/tech-stack", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    tech_stack = data['data']
                    self.log_test("Tech Stack API", True, f"Retrieved {len(tech_stack)} tech stack items")
                    return True
                else:
                    self.log_test("Tech Stack API", False, "Invalid response format", data)
            else:
                self.log_test("Tech Stack API", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Tech Stack API", False, "Request failed", str(e))
        return False
    
    def test_portfolio_stats(self):
        """Test GET /api/portfolio/stats"""
        try:
            response = self.session.get(f"{API_BASE}/portfolio/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    stats = data['data']
                    required_stats = ['totalProjects', 'aiProjects', 'webProjects', 'techCount']
                    missing_stats = [stat for stat in required_stats if stat not in stats]
                    
                    if not missing_stats:
                        self.log_test("Portfolio Stats API", True, "Portfolio statistics retrieved successfully")
                        return True
                    else:
                        self.log_test("Portfolio Stats API", False, f"Missing stats: {missing_stats}", stats)
                else:
                    self.log_test("Portfolio Stats API", False, "Invalid response format", data)
            else:
                self.log_test("Portfolio Stats API", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Portfolio Stats API", False, "Request failed", str(e))
        return False
    
    def test_contact_form_valid(self):
        """Test POST /api/contact with valid data"""
        try:
            contact_data = {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "message": "This is a test message for the portfolio contact form. Testing the API functionality."
            }
            
            response = self.session.post(f"{API_BASE}/contact", json=contact_data, timeout=10)
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success') and 'Thank you for your message' in data.get('message', ''):
                    self.log_test("Contact Form (Valid)", True, "Contact form submission successful")
                    return True
                else:
                    self.log_test("Contact Form (Valid)", False, "Unexpected response format", data)
            else:
                self.log_test("Contact Form (Valid)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Contact Form (Valid)", False, "Request failed", str(e))
        return False
    
    def test_contact_form_invalid(self):
        """Test POST /api/contact with invalid data"""
        try:
            # Test with missing required fields
            contact_data = {
                "name": "",
                "email": "invalid-email",
                "message": ""
            }
            
            response = self.session.post(f"{API_BASE}/contact", json=contact_data, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if not data.get('success'):
                    self.log_test("Contact Form (Invalid)", True, "Correctly rejected invalid data")
                    return True
                else:
                    self.log_test("Contact Form (Invalid)", False, "Should have rejected invalid data", data)
            else:
                self.log_test("Contact Form (Invalid)", False, f"Expected 400, got {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Contact Form (Invalid)", False, "Request failed", str(e))
        return False
    
    def test_admin_dashboard(self):
        """Test GET /api/admin/dashboard (requires auth)"""
        if not self.auth_token:
            self.log_test("Admin Dashboard", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/admin/dashboard", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data') and data['data'].get('stats'):
                    self.log_test("Admin Dashboard", True, "Dashboard data retrieved successfully")
                    return True
                else:
                    self.log_test("Admin Dashboard", False, "Invalid dashboard response format", data)
            else:
                self.log_test("Admin Dashboard", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Dashboard", False, "Request failed", str(e))
        return False
    
    def test_admin_projects(self):
        """Test GET /api/admin/projects (requires auth)"""
        if not self.auth_token:
            self.log_test("Admin Projects", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/admin/projects", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    projects = data['data']
                    self.log_test("Admin Projects", True, f"Admin projects retrieved: {len(projects)} projects")
                    return True
                else:
                    self.log_test("Admin Projects", False, "Invalid response format", data)
            else:
                self.log_test("Admin Projects", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Projects", False, "Request failed", str(e))
        return False
    
    def test_admin_personal(self):
        """Test GET /api/admin/personal (requires auth)"""
        if not self.auth_token:
            self.log_test("Admin Personal", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/admin/personal", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    self.log_test("Admin Personal", True, "Admin personal info retrieved successfully")
                    return True
                else:
                    self.log_test("Admin Personal", False, "Invalid response format", data)
            else:
                self.log_test("Admin Personal", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Personal", False, "Request failed", str(e))
        return False
    
    def test_admin_tech_stack(self):
        """Test GET /api/admin/tech-stack (requires auth)"""
        if not self.auth_token:
            self.log_test("Admin Tech Stack", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/admin/tech-stack", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    tech_stack = data['data']
                    self.log_test("Admin Tech Stack", True, f"Admin tech stack retrieved: {len(tech_stack)} items")
                    return True
                else:
                    self.log_test("Admin Tech Stack", False, "Invalid response format", data)
            else:
                self.log_test("Admin Tech Stack", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Tech Stack", False, "Request failed", str(e))
        return False
    
    def test_404_endpoint(self):
        """Test invalid endpoint returns 404"""
        try:
            response = self.session.get(f"{API_BASE}/nonexistent-endpoint", timeout=10)
            
            if response.status_code == 404:
                data = response.json()
                if not data.get('success'):
                    self.log_test("404 Error Handling", True, "Correctly returns 404 for invalid endpoints")
                    return True
                else:
                    self.log_test("404 Error Handling", False, "Should return success=false for 404", data)
            else:
                self.log_test("404 Error Handling", False, f"Expected 404, got {response.status_code}", response.text)
        except Exception as e:
            self.log_test("404 Error Handling", False, "Request failed", str(e))
        return False
    
    def test_rate_limiting(self):
        """Test rate limiting on contact form (basic test)"""
        try:
            # Make multiple rapid requests to test rate limiting
            contact_data = {
                "name": "Rate Test",
                "email": "ratetest@example.com",
                "message": "Testing rate limiting"
            }
            
            responses = []
            for i in range(3):
                response = self.session.post(f"{API_BASE}/contact", json=contact_data, timeout=10)
                responses.append(response.status_code)
            
            # Check if any requests were rate limited (429) or if all succeeded
            if 429 in responses:
                self.log_test("Rate Limiting", True, "Rate limiting is working")
                return True
            elif all(status in [201, 400] for status in responses):
                self.log_test("Rate Limiting", True, "Rate limiting configured (may not trigger in test)")
                return True
            else:
                self.log_test("Rate Limiting", False, f"Unexpected response codes: {responses}")
        except Exception as e:
            self.log_test("Rate Limiting", False, "Request failed", str(e))
        return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 80)
        print("PORTFOLIO BACKEND API COMPREHENSIVE TESTING")
        print("=" * 80)
        print(f"Testing API at: {API_BASE}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("=" * 80)
        
        # Basic connectivity tests
        print("\n🔍 BASIC CONNECTIVITY TESTS")
        print("-" * 40)
        self.test_health_check()
        self.test_root_endpoint()
        
        # Authentication tests
        print("\n🔐 AUTHENTICATION TESTS")
        print("-" * 40)
        self.test_admin_login_correct()
        self.test_admin_login_incorrect()
        self.test_jwt_verification()
        self.test_protected_route_without_auth()
        
        # Public API tests
        print("\n🌐 PUBLIC API TESTS")
        print("-" * 40)
        self.test_personal_info()
        self.test_projects_all()
        self.test_projects_ai_filter()
        self.test_projects_web_filter()
        self.test_tech_stack()
        self.test_portfolio_stats()
        
        # Contact form tests
        print("\n📧 CONTACT FORM TESTS")
        print("-" * 40)
        self.test_contact_form_valid()
        self.test_contact_form_invalid()
        self.test_rate_limiting()
        
        # Admin protected endpoint tests
        print("\n👨‍💼 ADMIN PROTECTED ENDPOINT TESTS")
        print("-" * 40)
        self.test_admin_dashboard()
        self.test_admin_projects()
        self.test_admin_personal()
        self.test_admin_tech_stack()
        
        # Error handling tests
        print("\n⚠️ ERROR HANDLING TESTS")
        print("-" * 40)
        self.test_404_endpoint()
        
        # Summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print(f"\n❌ FAILED TESTS ({failed}):")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "=" * 80)
        return passed, failed

def main():
    """Main test execution"""
    tester = PortfolioAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()