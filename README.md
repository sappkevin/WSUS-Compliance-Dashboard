# WSUS Patch Compliance Dashboard
[![WSUS Compliance Dashboard Build and Release](https://github.com/sappkevin/WSUS-Compliance-Dashboard/actions/workflows/docker-build.yml/badge.svg)](https://github.com/sappkevin/WSUS-Compliance-Dashboard/actions/workflows/docker-build.yml)
[![Docker Hub](https://img.shields.io/docker/pulls/sappkevin/wsus-dashboard.svg)](https://hub.docker.com/r/sappkevin/wsus-dashboard)****

A web-based dashboard for monitoring and managing Windows Server Update Services (WSUS) patch compliance across your organization. Built with React, Express, and MCP integration.

## Features

- **Real-time Compliance Monitoring**: View patch compliance status across all managed computers
- **Detailed Update Management**: Track and manage Windows updates across your infrastructure
- **LDAP Authentication**: Secure access with domain authentication
- **Interactive Dashboard**: Visual representation of compliance metrics
- **Computer Management**: View and manage individual computer update status
- **MCP Integration**: Expose WSUS data through Model Context Protocol

## Prerequisites

- Windows Server with WSUS role installed
- Active Directory domain for authentication
- Node.js 20.x or later
- PowerShell 5.1 or later with WSUS module installed

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure the required settings:
   ```bash
   cp .env.example .env
   ```
4. Generate Session Secret
   ```bash
   python .\generate_session_secret.py
   ```

## Configuration

### Required Environment Variables

Configure the following variables in your `.env` file:

#### WSUS Server Configuration
- `WSUS_SERVER`: Your WSUS server hostname or IP
- `WSUS_PORT`: WSUS server port (default: 8530)
- `WSUS_USE_SSL`: Use SSL for WSUS connection (true/false)

#### WSUS Service Account
- `WSUS_SERVICE_ACCOUNT`: Domain service account (format: domain\username)
- `WSUS_SERVICE_PASSWORD`: Service account password

#### LDAP Authentication
- `LDAP_URL`: LDAP server URL (e.g., ldap://dc.domain.com)
- `LDAP_BASE_DN`: Base DN for user search
- `LDAP_USERNAME_ATTRIBUTE`: Username attribute (default: sAMAccountName)
- `LDAP_GROUP_BASE_DN`: Base DN for group search
- `LDAP_REQUIRED_GROUP`: Required group for access

#### Security
- `SESSION_SECRET`: Random string for session encryption (minimum 32 characters)

### Service Account Requirements

The WSUS service account needs:
1. Read access to WSUS configuration
2. Member of local WSUS Administrators group
3. Read access to Active Directory for LDAP authentication

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## Features

### Dashboard
- Overall compliance statistics
- Computer status overview
- Recent activity feed
- Compliance rate visualization

### Computers View
- List of all managed computers
- Update status per computer
- Online/offline status
- Last sync time

### Updates View
- Available Windows updates
- Update classification
- Severity levels
- Approval status

## Security

The application implements several security measures:

1. LDAP Authentication with Active Directory
   - Secure service account usage
   - Group-based access control
   - Session management with secure cookies

2. Session Security
   - HTTPOnly cookies
   - Secure session storage
   - Configurable session timeout

3. API Security
   - Protected endpoints
   - CSRF protection
   - Input validation

4. WSUS Integration
   - Secure service account usage
   - Read-only operations
   - Audit logging

## MCP Integration

The application exposes WSUS data through Model Context Protocol (MCP):

### Resources
- `wsus://{computerName}`: Get computer status and updates
- List resources to browse available data

### Tools
- `list_noncompliant`: List non-compliant computers
- `get_update_status`: Get detailed update status

## Troubleshooting

### Common Issues

1. **WSUS Connection Errors**
   - Verify WSUS server is accessible
   - Check service account permissions
   - Ensure PowerShell WSUS module is installed
   - Validate port configuration

2. **LDAP Authentication Issues**
   - Verify LDAP server URL is correct
   - Check service account has read access
   - Confirm user is in required group
   - Check LDAP search base configuration

3. **Session/Database Issues**
   - Ensure .data directory exists and is writable
   - Check SESSION_SECRET is properly set
   - Verify SQLite session store permissions

4. **Startup Problems**
   - Check all environment variables are set
   - Verify service account credentials
   - Check port 5000 is available
   - Review server logs for detailed errors

### Error Messages

Common error messages and their solutions:

- "Missing required environment variables"
  → Check .env file and ensure all required variables are set

- "Failed to get WSUS computers"
  → Verify WSUS server connectivity and service account permissions

- "LDAP authentication failed"
  → Check LDAP configuration and service account access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - See LICENSE file for details
