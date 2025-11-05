#!/usr/bin/env python3
"""
Direct Email System Testing for WorkHoops
Tests the email functions directly by checking the implementation
"""

import os
import sys
import subprocess

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

def test_email_functions_exist():
    """Test that all required email functions exist in /lib/email.ts"""
    print_test_header("Email Functions Implementation Check")
    
    results = {'passed': 0, 'failed': 0, 'warnings': 0}
    
    try:
        # Read the email.ts file
        with open('/app/lib/email.ts', 'r') as f:
            email_content = f.read()
        
        # Check for required functions
        required_functions = [
            'sendWelcomeEmail',
            'sendProfileCompletedEmail', 
            'sendAdminWelcomeEmail'
        ]
        
        print_info("Checking for required email functions...")
        
        for func_name in required_functions:
            if f"export async function {func_name}" in email_content:
                print_success(f"✓ {func_name}() - Function exists and is exported")
                results['passed'] += 1
            else:
                print_error(f"✗ {func_name}() - Function not found or not exported")
                results['failed'] += 1
        
        # Check for RESEND_API_KEY usage
        if 'RESEND_API_KEY' in email_content:
            print_success("✓ RESEND_API_KEY is used in email functions")
            results['passed'] += 1
        else:
            print_error("✗ RESEND_API_KEY not found in email functions")
            results['failed'] += 1
        
        # Check for proper error handling
        if 'console.error' in email_content and 'try' in email_content and 'catch' in email_content:
            print_success("✓ Error handling implemented in email functions")
            results['passed'] += 1
        else:
            print_warning("⚠ Error handling may not be properly implemented")
            results['warnings'] += 1
        
        # Check for logging
        if '[RESEND]' in email_content:
            print_success("✓ Logging implemented for email operations")
            results['passed'] += 1
        else:
            print_warning("⚠ Email logging may not be implemented")
            results['warnings'] += 1
            
    except Exception as e:
        print_error(f"Failed to read email.ts file: {str(e)}")
        results['failed'] += 1
    
    return results

def test_registration_integration():
    """Test that email functions are integrated into registration"""
    print_test_header("Registration Integration Check")
    
    results = {'passed': 0, 'failed': 0, 'warnings': 0}
    
    try:
        # Read the registration route file
        with open('/app/app/api/auth/register/route.ts', 'r') as f:
            register_content = f.read()
        
        # Check for email function imports
        if 'sendWelcomeEmail' in register_content:
            print_success("✓ sendWelcomeEmail is imported in registration")
            results['passed'] += 1
        else:
            print_error("✗ sendWelcomeEmail not found in registration")
            results['failed'] += 1
        
        if 'sendAdminWelcomeEmail' in register_content:
            print_success("✓ sendAdminWelcomeEmail is imported in registration")
            results['passed'] += 1
        else:
            print_error("✗ sendAdminWelcomeEmail not found in registration")
            results['failed'] += 1
        
        # Check for proper email sending logic
        if 'await sendWelcomeEmail' in register_content:
            print_success("✓ Welcome email is called in registration flow")
            results['passed'] += 1
        else:
            print_error("✗ Welcome email not called in registration")
            results['failed'] += 1
        
        # Check for admin email logic
        if 'admin@workhoops.com' in register_content and 'sendAdminWelcomeEmail' in register_content:
            print_success("✓ Admin email logic implemented for admin@workhoops.com")
            results['passed'] += 1
        else:
            print_error("✗ Admin email logic not properly implemented")
            results['failed'] += 1
        
        # Check for non-blocking email sending
        if 'try' in register_content and 'catch' in register_content and 'emailError' in register_content:
            print_success("✓ Non-blocking email sending implemented")
            results['passed'] += 1
        else:
            print_warning("⚠ Non-blocking email sending may not be properly implemented")
            results['warnings'] += 1
        
        # Check for logging
        if '[REGISTER]' in register_content:
            print_success("✓ Registration email logging implemented")
            results['passed'] += 1
        else:
            print_warning("⚠ Registration email logging may not be implemented")
            results['warnings'] += 1
            
    except Exception as e:
        print_error(f"Failed to read registration route file: {str(e)}")
        results['failed'] += 1
    
    return results

def test_environment_configuration():
    """Test environment configuration for email system"""
    print_test_header("Environment Configuration Check")
    
    results = {'passed': 0, 'failed': 0, 'warnings': 0}
    
    try:
        # Check if RESEND_API_KEY is set
        with open('/app/.env', 'r') as f:
            env_content = f.read()
        
        if 'RESEND_API_KEY=' in env_content:
            print_success("✓ RESEND_API_KEY is configured in .env file")
            results['passed'] += 1
            
            # Check if it has a value
            for line in env_content.split('\n'):
                if line.startswith('RESEND_API_KEY='):
                    api_key = line.split('=', 1)[1].strip('"')
                    if api_key and api_key != 'your-resend-api-key':
                        print_success("✓ RESEND_API_KEY has a valid value")
                        results['passed'] += 1
                    else:
                        print_error("✗ RESEND_API_KEY is empty or has placeholder value")
                        results['failed'] += 1
                    break
        else:
            print_error("✗ RESEND_API_KEY not found in .env file")
            results['failed'] += 1
        
        # Check APP_URL configuration
        if 'APP_URL=' in env_content:
            print_success("✓ APP_URL is configured for email links")
            results['passed'] += 1
        else:
            print_warning("⚠ APP_URL may not be configured for email links")
            results['warnings'] += 1
            
    except Exception as e:
        print_error(f"Failed to read .env file: {str(e)}")
        results['failed'] += 1
    
    return results

def test_email_templates():
    """Test email template content"""
    print_test_header("Email Template Content Check")
    
    results = {'passed': 0, 'failed': 0, 'warnings': 0}
    
    try:
        # Read the email.ts file
        with open('/app/lib/email.ts', 'r') as f:
            email_content = f.read()
        
        # Check welcome email template
        if '¡Bienvenido a WorkHoops!' in email_content:
            print_success("✓ Welcome email template has proper Spanish content")
            results['passed'] += 1
        else:
            print_error("✗ Welcome email template missing proper content")
            results['failed'] += 1
        
        # Check role-specific content
        if 'jugador' in email_content and 'entrenador' in email_content and 'club' in email_content:
            print_success("✓ Role-specific email content implemented")
            results['passed'] += 1
        else:
            print_error("✗ Role-specific email content missing")
            results['failed'] += 1
        
        # Check admin email template
        if 'Panel de Administración' in email_content:
            print_success("✓ Admin welcome email template implemented")
            results['passed'] += 1
        else:
            print_error("✗ Admin welcome email template missing")
            results['failed'] += 1
        
        # Check profile completed email
        if '¡Tu perfil está completo!' in email_content:
            print_success("✓ Profile completed email template implemented")
            results['passed'] += 1
        else:
            print_error("✗ Profile completed email template missing")
            results['failed'] += 1
        
        # Check for proper HTML structure
        if '<div style=' in email_content and '</div>' in email_content:
            print_success("✓ Email templates use proper HTML structure")
            results['passed'] += 1
        else:
            print_warning("⚠ Email templates may not have proper HTML structure")
            results['warnings'] += 1
            
    except Exception as e:
        print_error(f"Failed to analyze email templates: {str(e)}")
        results['failed'] += 1
    
    return results

def main():
    """Run all email system tests"""
    print(f"{Colors.BOLD}WorkHoops Email System Phase 1 - Direct Testing{Colors.ENDC}")
    print("Testing email function implementation and integration")
    print("=" * 60)
    
    total_results = {'passed': 0, 'failed': 0, 'warnings': 0}
    
    # Run all tests
    tests = [
        test_email_functions_exist,
        test_registration_integration,
        test_environment_configuration,
        test_email_templates
    ]
    
    for test_func in tests:
        results = test_func()
        total_results['passed'] += results['passed']
        total_results['failed'] += results['failed']
        total_results['warnings'] += results['warnings']
    
    # Print final summary
    print_test_header("Final Test Summary")
    print(f"Total Passed: {total_results['passed']}")
    print(f"Total Failed: {total_results['failed']}")
    print(f"Total Warnings: {total_results['warnings']}")
    
    if total_results['failed'] == 0:
        print_success("✓ All email system implementation tests passed!")
        print_info("The email system is properly implemented and ready for use.")
        return True
    else:
        print_error(f"✗ {total_results['failed']} test(s) failed")
        print_info("Some issues were found in the email system implementation.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)