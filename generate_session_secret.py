#!/usr/bin/env python3
import secrets
import base64
import os

# Method 1: Using secrets module (Recommended for Python 3.6+)
def generate_session_secret(length=64):
    """Generate a secure random string suitable for a session secret."""
    return secrets.token_hex(length)

# Method 2: Using os.urandom (Alternative approach)
def generate_session_secret_urandom(length=64):
    """Generate a secure random string using os.urandom."""
    return base64.b64encode(os.urandom(length)).decode('utf-8')

# Generate and print secrets
print("Your SESSION_SECRET options:")
print("\nMethod 1 (Hex string using secrets):")
print(generate_session_secret())

print("\nMethod 2 (Base64 string using os.urandom):")
print(generate_session_secret_urandom())

# Quick one-liner if you just need a simple command
print("\nOne-liner option:")
print(secrets.token_hex(64))