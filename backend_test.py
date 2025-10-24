#!/usr/bin/env python3
"""
Backend API Testing for WorkHoops Next.js Application
Tests the Next.js API routes and database connectivity
"""

import requests
import json
import sys
import os
from datetime import datetime
import uuid

# Configuration
BASE_URL = "http://localhost:3000"  # Next.js frontend URL (running locally)
API_BASE = f"{BASE_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}=== {test_name} ==={Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ {message}{Colors.ENDC}")

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'warnings': 0,
            'errors': []
        }
        
    def log_error(self, test_name, error):
        self.test_results['errors'].append({
            'test': test_name,
            'error': str(error)
        })
        
    def test_api_health(self):
        """Test if the Next.js application is running"""
        print_test_header("API Health Check")
        
        try:
            # Test main page
            response = self.session.get(BASE_URL, timeout=10)
            if response.status_code == 200:
                print_success(f"Next.js application is running on {BASE_URL}")
                self.test_results['passed'] += 1
            else:
                print_error(f"Next.js application returned status {response.status_code}")
                self.test_results['failed'] += 1
                self.log_error("API Health", f"Status code: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print_error(f"Cannot connect to Next.js application at {BASE_URL}")
            self.test_results['failed'] += 1
            self.log_error("API Health", "Connection refused")
            return False
        except Exception as e:
            print_error(f"Health check failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("API Health", str(e))
            return False
            
        return True

    def test_opportunities_api(self):
        """Test opportunities API endpoints"""
        print_test_header("Opportunities API")
        
        try:
            # Test GET /api/opportunities
            response = self.session.get(f"{API_BASE}/opportunities", timeout=10)
            
            if response.status_code == 200:
                print_success("GET /api/opportunities - Success")
                
                try:
                    data = response.json()
                    if 'opportunities' in data and isinstance(data['opportunities'], list):
                        print_success(f"Response format is correct - found {len(data['opportunities'])} opportunities")
                        
                        if 'pagination' in data:
                            print_success("Pagination data present")
                            pagination = data['pagination']
                            if all(key in pagination for key in ['page', 'limit', 'total', 'pages']):
                                print_success("Pagination structure is complete")
                            else:
                                print_warning("Pagination structure incomplete")
                                self.test_results['warnings'] += 1
                        else:
                            print_warning("Pagination data missing")
                            self.test_results['warnings'] += 1
                            
                        # Test opportunity structure
                        if data['opportunities']:
                            opp = data['opportunities'][0]
                            required_fields = ['id', 'title', 'slug', 'description', 'type', 'level', 'status']
                            missing_fields = [field for field in required_fields if field not in opp]
                            if missing_fields:
                                print_warning(f"Opportunity missing fields: {missing_fields}")
                                self.test_results['warnings'] += 1
                            else:
                                print_success("Opportunity structure is complete")
                            
                    else:
                        print_error("Response format is incorrect - missing 'opportunities' array")
                        self.test_results['failed'] += 1
                        self.log_error("Opportunities API", "Invalid response format")
                        
                except json.JSONDecodeError:
                    print_error("Response is not valid JSON")
                    self.test_results['failed'] += 1
                    self.log_error("Opportunities API", "Invalid JSON response")
                    
                self.test_results['passed'] += 1
                
            else:
                print_error(f"GET /api/opportunities failed with status {response.status_code}")
                print_error(f"Response: {response.text[:200]}")
                self.test_results['failed'] += 1
                self.log_error("Opportunities API", f"Status: {response.status_code}, Response: {response.text[:200]}")
                
        except Exception as e:
            print_error(f"Opportunities API test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Opportunities API", str(e))

    def test_organizations_api(self):
        """Test organizations API endpoints"""
        print_test_header("Organizations API")
        
        try:
            # Test GET /api/organizations
            response = self.session.get(f"{API_BASE}/organizations", timeout=10)
            
            if response.status_code == 200:
                print_success("GET /api/organizations - Success")
                
                try:
                    data = response.json()
                    if 'data' in data and isinstance(data['data'], list):
                        print_success(f"Response format is correct - found {len(data['data'])} organizations")
                        
                        if 'pagination' in data:
                            print_success("Pagination data present")
                            pagination = data['pagination']
                            if all(key in pagination for key in ['page', 'limit', 'total', 'pages']):
                                print_success("Pagination structure is complete")
                            else:
                                print_warning("Pagination structure incomplete")
                                self.test_results['warnings'] += 1
                        else:
                            print_warning("Pagination data missing")
                            self.test_results['warnings'] += 1
                            
                        # Test organization structure
                        if data['data']:
                            org = data['data'][0]
                            required_fields = ['id', 'name', 'slug', 'verified']
                            missing_fields = [field for field in required_fields if field not in org]
                            if missing_fields:
                                print_warning(f"Organization missing fields: {missing_fields}")
                                self.test_results['warnings'] += 1
                            else:
                                print_success("Organization structure is complete")
                                
                    else:
                        print_error("Response format is incorrect - missing 'data' array")
                        self.test_results['failed'] += 1
                        self.log_error("Organizations API", "Invalid response format")
                        
                except json.JSONDecodeError:
                    print_error("Response is not valid JSON")
                    self.test_results['failed'] += 1
                    self.log_error("Organizations API", "Invalid JSON response")
                    
                self.test_results['passed'] += 1
                
            else:
                print_error(f"GET /api/organizations failed with status {response.status_code}")
                print_error(f"Response: {response.text[:200]}")
                self.test_results['failed'] += 1
                self.log_error("Organizations API", f"Status: {response.status_code}, Response: {response.text[:200]}")
                
        except Exception as e:
            print_error(f"Organizations API test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Organizations API", str(e))

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print_test_header("Authentication Endpoints")
        
        try:
            # Test NextAuth configuration endpoint
            response = self.session.get(f"{API_BASE}/auth/providers", timeout=10)
            
            if response.status_code == 200:
                print_success("GET /api/auth/providers - Success")
                
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        print_success(f"Auth providers configured: {list(data.keys())}")
                    else:
                        print_warning("Auth providers response format unexpected")
                        self.test_results['warnings'] += 1
                        
                except json.JSONDecodeError:
                    print_error("Auth providers response is not valid JSON")
                    self.test_results['failed'] += 1
                    self.log_error("Auth Endpoints", "Invalid JSON response")
                    
                self.test_results['passed'] += 1
                
            else:
                print_error(f"GET /api/auth/providers failed with status {response.status_code}")
                self.test_results['failed'] += 1
                self.log_error("Auth Endpoints", f"Status: {response.status_code}")
                
        except Exception as e:
            print_error(f"Auth endpoints test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Auth Endpoints", str(e))

    def test_seed_endpoint(self):
        """Test database seeding endpoint"""
        print_test_header("Database Seeding")
        
        try:
            # Test POST /api/seed
            response = self.session.post(f"{API_BASE}/seed", timeout=30)
            
            if response.status_code == 200:
                print_success("POST /api/seed - Success")
                
                try:
                    data = response.json()
                    if 'message' in data and 'data' in data:
                        print_success(f"Seed response: {data['message']}")
                        
                        seed_data = data['data']
                        if all(key in seed_data for key in ['users', 'organizations', 'opportunities']):
                            print_success(f"Seeded: {seed_data['users']} users, {seed_data['organizations']} organizations, {seed_data['opportunities']} opportunities")
                            
                            if 'testAccounts' in seed_data:
                                print_info(f"Test accounts created: {len(seed_data['testAccounts'])}")
                                for account in seed_data['testAccounts']:
                                    print_info(f"  - {account}")
                        else:
                            print_warning("Seed data structure incomplete")
                            self.test_results['warnings'] += 1
                            
                    else:
                        print_error("Seed response format is incorrect")
                        self.test_results['failed'] += 1
                        self.log_error("Database Seeding", "Invalid response format")
                        
                except json.JSONDecodeError:
                    print_error("Seed response is not valid JSON")
                    self.test_results['failed'] += 1
                    self.log_error("Database Seeding", "Invalid JSON response")
                    
                self.test_results['passed'] += 1
                
            elif response.status_code == 500:
                # Check if it's a unique constraint error (data already exists)
                try:
                    data = response.json()
                    if 'error' in data and 'Unique constraint failed' in data['error']:
                        print_info("Database already seeded (unique constraint error)")
                        print_success("Seed endpoint is working - data already exists")
                        self.test_results['passed'] += 1
                    else:
                        print_error(f"POST /api/seed failed with server error: {data.get('error', 'Unknown error')}")
                        self.test_results['failed'] += 1
                        self.log_error("Database Seeding", f"Server error: {data.get('error', 'Unknown error')}")
                except:
                    print_error(f"POST /api/seed failed with status 500")
                    print_error(f"Response: {response.text[:300]}")
                    self.test_results['failed'] += 1
                    self.log_error("Database Seeding", f"Status: 500, Response: {response.text[:300]}")
            else:
                print_error(f"POST /api/seed failed with status {response.status_code}")
                print_error(f"Response: {response.text[:300]}")
                self.test_results['failed'] += 1
                self.log_error("Database Seeding", f"Status: {response.status_code}, Response: {response.text[:300]}")
                
        except Exception as e:
            print_error(f"Database seeding test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Database Seeding", str(e))

    def test_applications_api(self):
        """Test applications API endpoints"""
        print_test_header("Applications API")
        
        try:
            # Test GET /api/applications (requires authentication)
            response = self.session.get(f"{API_BASE}/applications", timeout=10)
            
            if response.status_code == 401:
                print_success("GET /api/applications - Correctly requires authentication")
                
                try:
                    data = response.json()
                    if 'error' in data and 'Authentication required' in data['error']:
                        print_success("Authentication error message is correct")
                    else:
                        print_warning("Authentication error message format unexpected")
                        self.test_results['warnings'] += 1
                        
                except json.JSONDecodeError:
                    print_warning("Authentication error response is not valid JSON")
                    self.test_results['warnings'] += 1
                    
                self.test_results['passed'] += 1
                
            elif response.status_code == 200:
                print_info("GET /api/applications - Returned data (possibly with session)")
                
                try:
                    data = response.json()
                    if 'data' in data and isinstance(data['data'], list):
                        print_success(f"Applications API working - found {len(data['data'])} applications")
                        
                        if 'pagination' in data:
                            print_success("Pagination data present")
                        else:
                            print_warning("Pagination data missing")
                            self.test_results['warnings'] += 1
                            
                    else:
                        print_error("Applications response format is incorrect")
                        self.test_results['failed'] += 1
                        self.log_error("Applications API", "Invalid response format")
                        
                except json.JSONDecodeError:
                    print_error("Applications response is not valid JSON")
                    self.test_results['failed'] += 1
                    self.log_error("Applications API", "Invalid JSON response")
                    
                self.test_results['passed'] += 1
                
            else:
                print_error(f"GET /api/applications failed with status {response.status_code}")
                print_error(f"Response: {response.text[:200]}")
                self.test_results['failed'] += 1
                self.log_error("Applications API", f"Status: {response.status_code}, Response: {response.text[:200]}")
                
        except Exception as e:
            print_error(f"Applications API test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Applications API", str(e))

    def test_user_registration(self):
        """Test user registration endpoint"""
        print_test_header("User Registration")
        
        try:
            # Test POST /api/auth/register
            test_user = {
                "name": "Test Player",
                "email": f"testplayer{uuid.uuid4().hex[:8]}@example.com",
                "password": "testpassword123",
                "role": "jugador",
                "planType": "free_amateur"
            }
            
            response = self.session.post(
                f"{API_BASE}/auth/register", 
                json=test_user,
                timeout=10
            )
            
            if response.status_code == 200:
                print_success("POST /api/auth/register - Success")
                
                try:
                    data = response.json()
                    if 'message' in data and 'user' in data:
                        print_success(f"Registration response: {data['message']}")
                        
                        user = data['user']
                        if all(key in user for key in ['id', 'name', 'email', 'role']):
                            print_success(f"User created: {user['name']} ({user['email']}) - Role: {user['role']}")
                        else:
                            print_warning("User data structure incomplete")
                            self.test_results['warnings'] += 1
                            
                    else:
                        print_error("Registration response format is incorrect")
                        self.test_results['failed'] += 1
                        self.log_error("User Registration", "Invalid response format")
                        
                except json.JSONDecodeError:
                    print_error("Registration response is not valid JSON")
                    self.test_results['failed'] += 1
                    self.log_error("User Registration", "Invalid JSON response")
                    
                self.test_results['passed'] += 1
                
            elif response.status_code == 400:
                # Check if it's a validation error or duplicate user
                try:
                    data = response.json()
                    if 'message' in data:
                        print_warning(f"Registration validation: {data['message']}")
                        self.test_results['warnings'] += 1
                    else:
                        print_error("Registration failed with bad request")
                        self.test_results['failed'] += 1
                        self.log_error("User Registration", f"Status: 400, Response: {response.text[:200]}")
                except:
                    print_error("Registration failed with bad request")
                    self.test_results['failed'] += 1
                    self.log_error("User Registration", f"Status: 400, Response: {response.text[:200]}")
                    
            else:
                print_error(f"POST /api/auth/register failed with status {response.status_code}")
                print_error(f"Response: {response.text[:200]}")
                self.test_results['failed'] += 1
                self.log_error("User Registration", f"Status: {response.status_code}, Response: {response.text[:200]}")
                
        except Exception as e:
            print_error(f"User registration test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("User Registration", str(e))

    def test_database_connectivity(self):
        """Test database connectivity through API calls"""
        print_test_header("Database Connectivity")
        
        # Test database connectivity by making API calls that require DB access
        db_tests = [
            ("Opportunities", f"{API_BASE}/opportunities"),
            ("Organizations", f"{API_BASE}/organizations"),
        ]
        
        db_working = True
        
        for test_name, endpoint in db_tests:
            try:
                response = self.session.get(endpoint, timeout=10)
                
                if response.status_code == 200:
                    print_success(f"{test_name} database query successful")
                elif response.status_code == 500:
                    print_error(f"{test_name} database query failed - Internal Server Error")
                    print_error(f"Response: {response.text[:200]}")
                    db_working = False
                    self.test_results['failed'] += 1
                    self.log_error("Database Connectivity", f"{test_name} - Status: 500, Response: {response.text[:200]}")
                else:
                    print_warning(f"{test_name} returned status {response.status_code}")
                    self.test_results['warnings'] += 1
                    
            except Exception as e:
                print_error(f"{test_name} database test failed: {str(e)}")
                db_working = False
                self.test_results['failed'] += 1
                self.log_error("Database Connectivity", f"{test_name} - {str(e)}")
        
        if db_working:
            print_success("Database connectivity appears to be working")
            self.test_results['passed'] += 1
        else:
            print_error("Database connectivity issues detected")

    def test_page_routes(self):
        """Test main page routes"""
        print_test_header("Page Routes")
        
        routes = [
            ("/", "Landing Page"),
            ("/planes", "Pricing Page"),
            ("/auth/login", "Login Page"),
            ("/auth/register", "Register Page"),
            ("/dashboard", "Dashboard Page"),
        ]
        
        for route, name in routes:
            try:
                response = self.session.get(f"{BASE_URL}{route}", timeout=10)
                
                if response.status_code == 200:
                    print_success(f"{name} ({route}) - Success")
                    self.test_results['passed'] += 1
                elif response.status_code == 302 or response.status_code == 307:
                    print_info(f"{name} ({route}) - Redirect (expected for protected routes)")
                    self.test_results['passed'] += 1
                else:
                    print_error(f"{name} ({route}) - Status {response.status_code}")
                    self.test_results['failed'] += 1
                    self.log_error("Page Routes", f"{name} - Status: {response.status_code}")
                    
            except Exception as e:
                print_error(f"{name} ({route}) test failed: {str(e)}")
                self.test_results['failed'] += 1
                self.log_error("Page Routes", f"{name} - {str(e)}")

    def test_admin_dashboard_access(self):
        """Test admin dashboard access control"""
        print_test_header("Admin Dashboard Access Control")
        
        # Test admin page access without authentication
        try:
            response = self.session.get(f"{BASE_URL}/admin", timeout=10)
            
            if response.status_code == 302 or response.status_code == 307:
                print_success("GET /admin - Correctly redirects non-authenticated users")
                
                # Check if redirect is to login page
                if 'location' in response.headers:
                    location = response.headers['location']
                    if '/auth/login' in location:
                        print_success("  └─ Redirects to login page as expected")
                    else:
                        print_warning(f"  └─ Redirects to: {location}")
                        self.test_results['warnings'] += 1
                else:
                    print_warning("  └─ No location header in redirect")
                    self.test_results['warnings'] += 1
                    
                self.test_results['passed'] += 1
                
            elif response.status_code == 200:
                print_error("GET /admin - Should redirect non-authenticated users but returned 200")
                self.test_results['failed'] += 1
                self.log_error("Admin Dashboard Access", "No authentication protection")
                
            else:
                print_error(f"GET /admin - Unexpected status {response.status_code}")
                self.test_results['failed'] += 1
                self.log_error("Admin Dashboard Access", f"Status: {response.status_code}")
                
        except Exception as e:
            print_error(f"Admin dashboard access test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Admin Dashboard Access", str(e))

    def test_admin_opportunities_management(self):
        """Test admin opportunities management endpoints"""
        print_test_header("Admin Opportunities Management")
        
        # Test admin opportunities page access
        try:
            response = self.session.get(f"{BASE_URL}/admin/opportunities", timeout=10)
            
            if response.status_code == 302 or response.status_code == 307:
                print_success("GET /admin/opportunities - Correctly redirects non-authenticated users")
                self.test_results['passed'] += 1
            elif response.status_code == 200:
                print_error("GET /admin/opportunities - Should redirect non-authenticated users")
                self.test_results['failed'] += 1
                self.log_error("Admin Opportunities Management", "No authentication protection")
            else:
                print_error(f"GET /admin/opportunities - Status {response.status_code}")
                self.test_results['failed'] += 1
                self.log_error("Admin Opportunities Management", f"Status: {response.status_code}")
                
        except Exception as e:
            print_error(f"Admin opportunities page test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Admin Opportunities Management", str(e))
        
        # Test admin API endpoint without authentication
        try:
            test_opportunity_id = "test-opportunity-id"
            response = self.session.patch(
                f"{API_BASE}/admin/opportunities/{test_opportunity_id}",
                json={"status": "publicada"},
                timeout=10
            )
            
            if response.status_code == 401:
                print_success("PATCH /api/admin/opportunities/[id] - Correctly requires authentication")
                
                try:
                    data = response.json()
                    if 'error' in data and 'Authentication required' in data['error']:
                        print_success("  └─ Authentication error message is correct")
                    else:
                        print_warning("  └─ Authentication error message format unexpected")
                        self.test_results['warnings'] += 1
                        
                except json.JSONDecodeError:
                    print_warning("  └─ Authentication error response is not valid JSON")
                    self.test_results['warnings'] += 1
                    
                self.test_results['passed'] += 1
                
            elif response.status_code == 403:
                print_success("PATCH /api/admin/opportunities/[id] - Correctly requires admin role")
                self.test_results['passed'] += 1
                
            elif response.status_code == 404:
                print_info("PATCH /api/admin/opportunities/[id] - Opportunity not found (expected for test ID)")
                self.test_results['passed'] += 1
                
            else:
                print_error(f"PATCH /api/admin/opportunities/[id] - Unexpected status {response.status_code}")
                print_error(f"Response: {response.text[:200]}")
                self.test_results['failed'] += 1
                self.log_error("Admin Opportunities Management", f"API Status: {response.status_code}")
                
        except Exception as e:
            print_error(f"Admin opportunities API test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Admin Opportunities Management", str(e))

    def test_admin_users_management(self):
        """Test admin users management page"""
        print_test_header("Admin Users Management")
        
        try:
            response = self.session.get(f"{BASE_URL}/admin/users", timeout=10)
            
            if response.status_code == 302 or response.status_code == 307:
                print_success("GET /admin/users - Correctly redirects non-authenticated users")
                self.test_results['passed'] += 1
                
            elif response.status_code == 200:
                print_error("GET /admin/users - Should redirect non-authenticated users")
                self.test_results['failed'] += 1
                self.log_error("Admin Users Management", "No authentication protection")
                
            else:
                print_error(f"GET /admin/users - Status {response.status_code}")
                self.test_results['failed'] += 1
                self.log_error("Admin Users Management", f"Status: {response.status_code}")
                
        except Exception as e:
            print_error(f"Admin users management test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Admin Users Management", str(e))

    def test_opportunity_editing_endpoints(self):
        """Test opportunity editing endpoints"""
        print_test_header("Opportunity Editing Endpoints")
        
        # Test GET opportunity by slug
        test_slug = "test-opportunity-slug"
        
        try:
            response = self.session.get(f"{API_BASE}/opportunities/{test_slug}", timeout=10)
            
            if response.status_code == 404:
                print_success("GET /api/opportunities/[slug] - Correctly returns 404 for non-existent opportunity")
                self.test_results['passed'] += 1
                
            elif response.status_code == 200:
                print_info("GET /api/opportunities/[slug] - Found existing opportunity")
                
                try:
                    data = response.json()
                    required_fields = ['id', 'title', 'slug', 'description', 'status']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        print_warning(f"  └─ Opportunity missing fields: {missing_fields}")
                        self.test_results['warnings'] += 1
                    else:
                        print_success("  └─ Opportunity structure is complete")
                        
                except json.JSONDecodeError:
                    print_error("  └─ Response is not valid JSON")
                    self.test_results['failed'] += 1
                    self.log_error("Opportunity Editing", "Invalid JSON response")
                    
                self.test_results['passed'] += 1
                
            else:
                print_error(f"GET /api/opportunities/[slug] - Status {response.status_code}")
                self.test_results['failed'] += 1
                self.log_error("Opportunity Editing", f"GET Status: {response.status_code}")
                
        except Exception as e:
            print_error(f"GET opportunity test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Opportunity Editing", f"GET - {str(e)}")
        
        # Test PUT opportunity without authentication
        try:
            response = self.session.put(
                f"{API_BASE}/opportunities/{test_slug}",
                json={"title": "Updated Test Opportunity"},
                timeout=10
            )
            
            if response.status_code == 401:
                print_success("PUT /api/opportunities/[slug] - Correctly requires authentication")
                self.test_results['passed'] += 1
                
            elif response.status_code == 403:
                print_success("PUT /api/opportunities/[slug] - Correctly requires proper authorization")
                self.test_results['passed'] += 1
                
            elif response.status_code == 404:
                print_info("PUT /api/opportunities/[slug] - Opportunity not found (expected for test slug)")
                self.test_results['passed'] += 1
                
            else:
                print_error(f"PUT /api/opportunities/[slug] - Unexpected status {response.status_code}")
                self.test_results['failed'] += 1
                self.log_error("Opportunity Editing", f"PUT Status: {response.status_code}")
                
        except Exception as e:
            print_error(f"PUT opportunity test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Opportunity Editing", f"PUT - {str(e)}")
        
        # Test PATCH opportunity without authentication
        try:
            response = self.session.patch(
                f"{API_BASE}/opportunities/{test_slug}",
                json={"title": "Patched Test Opportunity"},
                timeout=10
            )
            
            if response.status_code == 401:
                print_success("PATCH /api/opportunities/[slug] - Correctly requires authentication")
                self.test_results['passed'] += 1
                
            elif response.status_code == 403:
                print_success("PATCH /api/opportunities/[slug] - Correctly requires proper authorization")
                self.test_results['passed'] += 1
                
            elif response.status_code == 404:
                print_info("PATCH /api/opportunities/[slug] - Opportunity not found (expected for test slug)")
                self.test_results['passed'] += 1
                
            else:
                print_error(f"PATCH /api/opportunities/[slug] - Unexpected status {response.status_code}")
                self.test_results['failed'] += 1
                self.log_error("Opportunity Editing", f"PATCH Status: {response.status_code}")
                
        except Exception as e:
            print_error(f"PATCH opportunity test failed: {str(e)}")
            self.test_results['failed'] += 1
            self.log_error("Opportunity Editing", f"PATCH - {str(e)}")

    def test_new_routes_404_fix(self):
        """Test the new routes created to fix 404 errors"""
        print_test_header("New Routes - 404 Fix Testing")
        
        # Routes to test as specified in the review request
        routes_to_test = [
            ("/dashboard/applications", "Dashboard Applications Page"),
            ("/dashboard/favorites", "Dashboard Favorites Page"),
            ("/oportunidades/jugador-base-cb-estudiantes", "Opportunity Details (slug)"),
            ("/recursos/1", "Resource Article Details (id)"),
            ("/legal/cookies", "Cookies Policy Page"),
        ]
        
        for route, name in routes_to_test:
            try:
                response = self.session.get(f"{BASE_URL}{route}", timeout=15)
                
                if response.status_code == 200:
                    print_success(f"{name} ({route}) - Status 200 ✓")
                    
                    # Check if the response contains HTML content
                    content = response.text
                    if '<html' in content.lower() and '</html>' in content.lower():
                        print_success(f"  └─ Contains valid HTML content")
                        
                        # Check for specific content indicators
                        if route == "/dashboard/applications":
                            if 'aplicaciones' in content.lower() or 'applications' in content.lower():
                                print_success(f"  └─ Contains applications-related content")
                            else:
                                print_warning(f"  └─ May not contain expected applications content")
                                self.test_results['warnings'] += 1
                                
                        elif route == "/dashboard/favorites":
                            if 'favoritos' in content.lower() or 'favorites' in content.lower():
                                print_success(f"  └─ Contains favorites-related content")
                            else:
                                print_warning(f"  └─ May not contain expected favorites content")
                                self.test_results['warnings'] += 1
                                
                        elif route.startswith("/oportunidades/"):
                            if 'oportunidad' in content.lower() or 'opportunity' in content.lower():
                                print_success(f"  └─ Contains opportunity-related content")
                            else:
                                print_warning(f"  └─ May not contain expected opportunity content")
                                self.test_results['warnings'] += 1
                                
                        elif route.startswith("/recursos/"):
                            if 'recurso' in content.lower() or 'resource' in content.lower() or 'artículo' in content.lower():
                                print_success(f"  └─ Contains resource/article-related content")
                            else:
                                print_warning(f"  └─ May not contain expected resource content")
                                self.test_results['warnings'] += 1
                                
                        elif route == "/legal/cookies":
                            if 'cookies' in content.lower() or 'política' in content.lower():
                                print_success(f"  └─ Contains cookies policy content")
                            else:
                                print_warning(f"  └─ May not contain expected cookies policy content")
                                self.test_results['warnings'] += 1
                    else:
                        print_warning(f"  └─ Response may not be valid HTML")
                        self.test_results['warnings'] += 1
                    
                    self.test_results['passed'] += 1
                    
                elif response.status_code == 404:
                    print_error(f"{name} ({route}) - Still returns 404! ❌")
                    print_error(f"  └─ The route was not properly implemented or is not accessible")
                    self.test_results['failed'] += 1
                    self.log_error("New Routes 404 Fix", f"{name} - Still 404")
                    
                elif response.status_code == 302 or response.status_code == 307:
                    print_info(f"{name} ({route}) - Redirect (Status {response.status_code})")
                    print_info(f"  └─ This may be expected for protected routes")
                    self.test_results['passed'] += 1
                    
                elif response.status_code == 500:
                    print_error(f"{name} ({route}) - Internal Server Error (500) ❌")
                    print_error(f"  └─ Route exists but has runtime errors")
                    self.test_results['failed'] += 1
                    self.log_error("New Routes 404 Fix", f"{name} - Server Error 500")
                    
                else:
                    print_error(f"{name} ({route}) - Unexpected Status {response.status_code} ❌")
                    self.test_results['failed'] += 1
                    self.log_error("New Routes 404 Fix", f"{name} - Status: {response.status_code}")
                    
            except Exception as e:
                print_error(f"{name} ({route}) test failed: {str(e)}")
                self.test_results['failed'] += 1
                self.log_error("New Routes 404 Fix", f"{name} - {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"{Colors.BOLD}WorkHoops Backend API Testing{Colors.ENDC}")
        print(f"Testing Next.js application at: {BASE_URL}")
        print("=" * 60)
        
        # Check if the application is running first
        if not self.test_api_health():
            print_error("Application is not running. Stopping tests.")
            return False
            
        # Run all tests
        self.test_database_connectivity()
        self.test_seed_endpoint()
        self.test_opportunities_api()
        self.test_organizations_api()
        self.test_applications_api()
        self.test_user_registration()
        self.test_auth_endpoints()
        self.test_page_routes()
        self.test_new_routes_404_fix()
        
        # NEW ADMIN FEATURES TESTING
        self.test_admin_dashboard_access()
        self.test_admin_opportunities_management()
        self.test_admin_users_management()
        self.test_opportunity_editing_endpoints()
        
        # Print summary
        self.print_summary()
        
        return self.test_results['failed'] == 0

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print(f"{Colors.BOLD}TEST SUMMARY{Colors.ENDC}")
        print("=" * 60)
        
        total_tests = self.test_results['passed'] + self.test_results['failed']
        
        print(f"Total Tests: {total_tests}")
        print(f"{Colors.GREEN}Passed: {self.test_results['passed']}{Colors.ENDC}")
        print(f"{Colors.RED}Failed: {self.test_results['failed']}{Colors.ENDC}")
        print(f"{Colors.YELLOW}Warnings: {self.test_results['warnings']}{Colors.ENDC}")
        
        if self.test_results['errors']:
            print(f"\n{Colors.RED}{Colors.BOLD}ERRORS DETAILS:{Colors.ENDC}")
            for error in self.test_results['errors']:
                print(f"{Colors.RED}• {error['test']}: {error['error']}{Colors.ENDC}")
        
        if self.test_results['failed'] == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED!{Colors.ENDC}")
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}❌ {self.test_results['failed']} TEST(S) FAILED{Colors.ENDC}")

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)