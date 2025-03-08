# Start with a Windows Server Core image that has PowerShell
FROM mcr.microsoft.com/windows/servercore:ltsc2022

# Set shell to PowerShell for Windows commands
SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

# Install Chocolatey package manager
RUN Set-ExecutionPolicy Bypass -Scope Process -Force; \
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; \
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install Git, Node.js, and Nano
RUN choco install git -y --no-progress
RUN choco install nodejs-lts -y --no-progress
RUN choco install nano -y --no-progress

# WSUS Tools Installation
RUN Add-WindowsCapability -Online -Name 'Rsat.WSUS.Tools~~~~0.0.1.0'

RUN try { \
      Import-Module -Name UpdateServices \
      Write-Output "UpdateServices module import test was successfully."; \
    } catch { \
      Write-Output "WARNING: Failed to import UpdateServices module. Error: $_"; \
    }

# PWSH Core install
RUN choco install powershell-core -y --no-progress

# Create app directory
WORKDIR /app

# Clone the specific GitHub repository
RUN Write-Output "Cloning WSUS Compliance Dashboard repository..."; \
    git clone --depth 1 https://github.com/sappkevin/WSUS-Compliance-Dashboard.git .; \
    if ($LASTEXITCODE -ne 0) { \
      Write-Output "ERROR: Failed to clone repository."; \
      exit 1; \
    } else { \
      Write-Output "Repository cloned successfully."; \
    }

# Install dependencies
RUN Write-Output "Installing Node.js dependencies..."; \
    npm install; \
    if ($LASTEXITCODE -ne 0) { \
      Write-Output "ERROR: Failed to install dependencies."; \
      exit 1; \
    } else { \
      Write-Output "Dependencies installed successfully."; \
    }

# Build the application if a build script exists
RUN if (Test-Path package.json) { \
      $packageJson = Get-Content package.json | ConvertFrom-Json; \
      if ($packageJson.scripts.build) { \
        Write-Output "Building application..."; \
        npm run build; \
        if ($LASTEXITCODE -ne 0) { \
          Write-Output "WARNING: Build command failed, but continuing..."; \
        } else { \
          Write-Output "Application built successfully."; \
        } \
      } else { \
        Write-Output "No build script found in package.json, skipping build step."; \
      } \
    }

# Expose the port the app runs on
EXPOSE 5000

# Copy startup script
COPY startup.ps1 /app/startup.ps1

# Set the entry point
ENTRYPOINT ["powershell", "-File", "/app/startup.ps1"]
