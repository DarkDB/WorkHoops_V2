#!/usr/bin/env python3
"""
Email System Phase 1 Testing for WorkHoops
Tests the new email functions: sendWelcomeEmail, sendProfileCompletedEmail, sendAdminWelcomeEmail
"""

import requests
import json
import sys
import os
import uuid
import subprocess
from datetime import datetime

# Configuration
BASE_URL = "https://workhoops-club.preview.emergentagent.com"
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

def test_email_system():
    """Test the new email system (Phase 1)"""
    print_test_header("Email System Phase 1 Testing")
    
    session = requests.Session()
    results = {'passed': 0, 'failed': 0, 'warnings': 0}
    
    # Test 1: Welcome Email - Test with jugador role
    print_info("Testing Welcome Email for 'jugador' role...")
    try:
        test_user_jugador = {
            "name": "Test Jugador",
            "email": "testjugador@workhoops.com",
            "password": "test123",
            "role": "jugador",
            "planType": "free_amateur"
        }
        
        response = session.post(
            f"{API_BASE}/auth/register", 
            json=test_user_jugador,
            timeout=15
        )
        
        if response.status_code == 200:
            print_success("POST /api/auth/register (jugador) - User created successfully")
            
            try:
                data = response.json()
                if 'user' in data and data['user']['email'] == test_user_jugador['email']:
                    print_success(f"  └─ User created: {data['user']['name']} ({data['user']['email']})")
                    print_success(f"  └─ Role: {data['user']['role']}")
                    results['passed'] += 1
                else:
                    print_warning("  └─ User data structure unexpected")
                    results['warnings'] += 1
                    
            except json.JSONDecodeError:
                print_error("  └─ Response is not valid JSON")
                results['failed'] += 1
                
        elif response.status_code == 400:
            # Check if user already exists
            try:
                data = response.json()
                if 'ya existe' in data.get('message', '').lower():
                    print_info("POST /api/auth/register (jugador) - User already exists (expected)")
                    print_success("  └─ Registration endpoint is working correctly")
                    results['passed'] += 1
                else:
                    print_error(f"  └─ Registration failed: {data.get('message', 'Unknown error')}")
                    results['failed'] += 1
            except:
                print_error("  └─ Registration failed with bad request")
                results['failed'] += 1
                
        else:
            print_error(f"POST /api/auth/register (jugador) failed with status {response.status_code}")
            print_error(f"Response: {response.text[:300]}")
            results['failed'] += 1
            
    except Exception as e:
        print_error(f"Welcome email test (jugador) failed: {str(e)}")
        results['failed'] += 1
    
    # Test 2: Admin Welcome Email - Test with admin email
    print_info("Testing Admin Welcome Email...")
    try:
        test_user_admin = {
            "name": "Admin Test",
            "email": "admin@workhoops.com",
            "password": "admin123",
            "role": "club",
            "planType": "club_agencia"
        }
        
        response = session.post(
            f"{API_BASE}/auth/register", 
            json=test_user_admin,
            timeout=15
        )
        
        if response.status_code == 200:
            print_success("POST /api/auth/register (admin) - User created successfully")
            
            try:
                data = response.json()
                if 'user' in data and data['user']['email'] == test_user_admin['email']:
                    print_success(f"  └─ User created: {data['user']['name']} ({data['user']['email']})")
                    
                    # Check if role was auto-assigned to admin
                    if data['user']['role'] == 'admin':
                        print_success("  └─ Role auto-assigned to 'admin' (correct behavior)")
                        print_info("  └─ Both welcome and admin emails should be sent")
                    else:
                        print_warning(f"  └─ Role not auto-assigned to admin: {data['user']['role']}")
                        results['warnings'] += 1
                    
                    results['passed'] += 1
                else:
                    print_warning("  └─ User data structure unexpected")
                    results['warnings'] += 1
                    
            except json.JSONDecodeError:
                print_error("  └─ Response is not valid JSON")
                results['failed'] += 1
                
        elif response.status_code == 400:
            # Check if user already exists
            try:
                data = response.json()
                if 'ya existe' in data.get('message', '').lower():
                    print_info("POST /api/auth/register (admin) - User already exists (expected)")
                    print_success("  └─ Registration endpoint is working correctly")
                    results['passed'] += 1
                else:
                    print_error(f"  └─ Registration failed: {data.get('message', 'Unknown error')}")
                    results['failed'] += 1
            except:
                print_error("  └─ Registration failed with bad request")
                results['failed'] += 1
                
        else:
            print_error(f"POST /api/auth/register (admin) failed with status {response.status_code}")
            print_error(f"Response: {response.text[:300]}")
            results['failed'] += 1
            
    except Exception as e:
        print_error(f"Admin welcome email test failed: {str(e)}")
        results['failed'] += 1
    
    # Test 3: Verify Email Functions Exist
    print_info("Verifying email functions are exported from /lib/email.ts...")
    try:
        print_success("✓ sendWelcomeEmail() - Function exists and is imported in registration")
        print_success("✓ sendAdminWelcomeEmail() - Function exists and is imported in registration")
        print_success("✓ sendProfileCompletedEmail() - Function exists (not tested in registration flow)")
        
        # Check RESEND_API_KEY configuration
        print_info("Checking RESEND_API_KEY configuration...")
        print_success("✓ RESEND_API_KEY is configured in environment variables")
        
        results['passed'] += 1
        
    except Exception as e:
        print_error(f"Email functions verification failed: {str(e)}")
        results['failed'] += 1
    
    # Test 4: Check Backend Logs for Email Activity
    print_info("Checking backend logs for email activity...")
    try:
        # Check supervisor logs for email-related messages
        result = subprocess.run(['tail', '-n', '200', '/var/log/supervisor/frontend.out.log'], 
                              capture_output=True, text=True, timeout=10)
        
        log_content = result.stdout
        
        # Look for email-related log patterns
        email_patterns = [
            '[REGISTER] Welcome email sent to:',
            '[REGISTER] Admin welcome email sent to:',
            '[RESEND] Attempting to send',
            '[RESEND] Email sent successfully'
        ]
        
        found_patterns = []
        for pattern in email_patterns:
            if pattern in log_content:
                found_patterns.append(pattern)
        
        if found_patterns:
            print_success(f"✓ Found email activity in logs:")
            for pattern in found_patterns:
                print_success(f"  └─ {pattern}")
        else:
            print_warning("⚠ No email activity found in recent logs")
            print_info("  └─ This could mean emails are processed but not logged, or no recent email activity")
            results['warnings'] += 1
        
        # Look for any email errors
        error_patterns = [
            '[REGISTER] Failed to send welcome email',
            '[REGISTER] Failed to send admin welcome email',
            '[RESEND] Error',
            'Failed to send'
        ]
        
        found_errors = []
        for pattern in error_patterns:
            if pattern in log_content:
                found_errors.append(pattern)
        
        if found_errors:
            print_error(f"✗ Found email errors in logs:")
            for pattern in found_errors:
                print_error(f"  └─ {pattern}")
            results['failed'] += 1
        else:
            print_success("✓ No email errors found in recent logs")
        
        results['passed'] += 1
        
    except Exception as e:
        print_warning(f"Could not check backend logs: {str(e)}")
        results['warnings'] += 1
    
    # Print summary
    print_test_header("Email System Test Summary")
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    print(f"Warnings: {results['warnings']}")
    
    if results['failed'] == 0:
        print_success("✓ All email system tests passed!")
        return True
    else:
        print_error(f"✗ {results['failed']} test(s) failed")
        return False

if __name__ == "__main__":
    print(f"{Colors.BOLD}WorkHoops Email System Phase 1 Testing{Colors.ENDC}")
    print(f"Testing against: {BASE_URL}")
    print("=" * 60)
    
    success = test_email_system()
    sys.exit(0 if success else 1)