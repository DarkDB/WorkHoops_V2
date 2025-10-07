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
BASE_URL = "http://localhost:3001"  # Next.js frontend URL
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
                    if 'data' in data and isinstance(data['data'], list):
                        print_success(f"Response format is correct - found {len(data['data'])} opportunities")
                        
                        if 'pagination' in data:
                            print_success("Pagination data present")
                        else:
                            print_warning("Pagination data missing")
                            self.test_results['warnings'] += 1
                            
                    else:
                        print_error("Response format is incorrect - missing 'data' array")
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
                    if isinstance(data, list):
                        print_success(f"Response format is correct - found {len(data)} organizations")
                    else:
                        print_error("Response format is incorrect - expected array")
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
        self.test_opportunities_api()
        self.test_organizations_api()
        self.test_auth_endpoints()
        self.test_database_connectivity()
        self.test_page_routes()
        
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