# WSUS Dashboard Docker Image

This repository provides a Docker image for the WSUS Compliance Dashboard application, which allows you to monitor and manage Windows Server Update Services (WSUS) compliance.

## Source Code Integration

This Docker image pulls the WSUS Compliance Dashboard code directly from:
https://github.com/sappkevin/WSUS-Compliance-Dashboard

The image is built with the latest code from the main branch of this repository.

## Features

- Pre-installed WSUS management tools (RSAT-WSUS)
- PowerShell modules for WSUS management
- Node.js environment for the dashboard application
- Text editors (Nano and VS Code) for configuration
- Automatic GitHub Actions workflow for building and publishing the image

## Usage

### Pull the Image

```bash
docker pull yourusername/wsus-dashboard:latest
```

### Run the Container

```bash
docker run -d -p 5000:5000 --name wsus-dashboard yourusername/wsus-dashboard:latest
```

### Configure WSUS Connection

The first time you run the container, it will create a default `.env` file from the example template. You'll need to edit this file with your actual WSUS server details:

1. Connect to the running container:
   ```bash
   docker exec -it wsus-dashboard powershell
   ```

2. Edit the `.env` file using either Nano or VS Code:
   ```bash
   # Using Nano
   nano .env

   # OR using VS Code (if you have X11 forwarding set up)
   code .env
   ```

3. Update the following settings:
   ```
   # WSUS Server Configuration
   WSUS_SERVER=your-wsus-server
   WSUS_PORT=8530
   WSUS_USE_SSL=false

   # WSUS Service Account
   WSUS_SERVICE_ACCOUNT=domain\service-account
   WSUS_SERVICE_PASSWORD=your-service-password

   # LDAP Configuration
   LDAP_URL=ldap://your-domain-controller
   LDAP_BASE_DN=DC=your,DC=domain,DC=com
   LDAP_USERNAME_ATTRIBUTE=sAMAccountName
   LDAP_GROUP_BASE_DN=OU=Groups,DC=your,DC=domain,DC=com
   LDAP_REQUIRED_GROUP=CN=WSUS_Admins,OU=Groups,DC=your,DC=domain,DC=com

   # Session Configuration
   SESSION_SECRET=your-random-secret-key
   ```

4. Restart the container:
   ```bash
   docker restart wsus-dashboard
   ```

## GitHub Actions Workflow

This repository includes a GitHub Actions workflow that automatically builds and publishes the Docker image to Docker Hub whenever changes are pushed to the main branch or when a new tag is created.

### Workflow Configuration

The workflow is defined in `.github/workflows/docker-build.yml` and includes the following steps:

1. Checkout the repository
2. Log in to Docker Hub
3. Extract metadata for Docker image (tags, labels)
4. Set up Docker Buildx
5. Build and push the Docker image

### Required Secrets

To use this workflow, you need to add the following secrets to your GitHub repository:

1. `DOCKER_HUB_USERNAME`: Your Docker Hub username
2. `DOCKER_HUB_TOKEN`: Your Docker Hub access token (not your password)

To set up these secrets:

1. Go to your repository settings
2. Click on "Secrets and variables" → "Actions" in the sidebar
3. Click on "New repository secret"
4. Add the secrets mentioned above
5. Save your changes

You can create a Docker Hub access token in your Docker Hub account settings under "Security" → "Access Tokens".

## Building Locally

If you prefer to build the image locally:

```bash
docker build -t wsus-dashboard .
```

## Security Considerations

- The Docker image includes credentials to your WSUS server and domain controller, so ensure the container and its configuration are properly secured.
- Consider using Docker secrets or environment variables instead of storing credentials in the `.env` file for production deployments.
- Regularly update the image to include the latest security patches.

## Troubleshooting

### Common Issues

1. **PowerShell errors when accessing WSUS**:
   - Verify that your WSUS server is accessible from the container
   - Check that the service account has the necessary permissions

2. **Container starts but application fails**:
   - Check the application logs using `docker logs wsus-dashboard`
   - Verify your `.env` configuration

3. **RSAT-WSUS feature installation fails**:
   - This image requires the Windows Server base image, not Windows desktop
   - Some WSUS commands may not be available depending on the Windows version

### Getting Help

If you encounter issues or need assistance, please create an issue in the GitHub repository.
