# Start with a Windows Server Core image that has PowerShell
FROM mcr.microsoft.com/windows/servercore:ltsc2022

# Set shell to PowerShell for Windows commands
SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

# Install Chocolatey package manager
RUN Set-ExecutionPolicy Bypass -Scope Process -Force; \
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; \
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install Git, Node.js, and Nano
RUN choco install git -y
RUN choco install nodejs-lts -y
RUN choco install nano -y
RUN choco install powershell-core -y

# WSUS Tools Installation Note
RUN Write-Host "NOTE: WSUS Tools (RSAT-WSUS) cannot be installed directly in a container" -ForegroundColor Yellow
RUN Write-Host "This container should be run on a Windows Server host with WSUS tools installed" -ForegroundColor Yellow
RUN Write-Host "Or use the container for UI purposes only and connect to a remote WSUS server" -ForegroundColor Yellow

# Create app directory
WORKDIR /app

# Clone the specific GitHub repository
RUN Write-Host "Cloning WSUS Compliance Dashboard repository..."; \
    git clone --depth 1 https://github.com/sappkevin/WSUS-Compliance-Dashboard.git .; \
    if ($LASTEXITCODE -ne 0) { \
      Write-Host "ERROR: Failed to clone repository."; \
      exit 1; \
    } else { \
      Write-Host "Repository cloned successfully."; \
    }

# Install dependencies
RUN Write-Host "Installing Node.js dependencies..."; \
    npm install; \
    if ($LASTEXITCODE -ne 0) { \
      Write-Host "ERROR: Failed to install dependencies."; \
      exit 1; \
    } else { \
      Write-Host "Dependencies installed successfully."; \
    }

# Build the application if a build script exists
RUN if (Test-Path package.json) { \
      $packageJson = Get-Content package.json | ConvertFrom-Json; \
      if ($packageJson.scripts.build) { \
        Write-Host "Building application..."; \
        npm run build; \
        if ($LASTEXITCODE -ne 0) { \
          Write-Host "WARNING: Build command failed, but continuing..."; \
        } else { \
          Write-Host "Application built successfully."; \
        } \
      } else { \
        Write-Host "No build script found in package.json, skipping build step."; \
      } \
    }

# Expose the port the app runs on
EXPOSE 5000

# Create the startup script
RUN New-Item -Path /app/startup.ps1 -ItemType File -Force
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '# Container startup script for WSUS Dashboard'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value 'Write-Host \"Starting WSUS Dashboard Container...\" -ForegroundColor Green'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value ''"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '# Check if .env file exists'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value 'if (-not (Test-Path .env)) {'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '    Write-Host \"No .env file found. Creating from template...\" -ForegroundColor Yellow'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value ''"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '    if (Test-Path .env.example) {'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '        Copy-Item .env.example .env'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '        Write-Host \"IMPORTANT: Default .env file created from template.\" -ForegroundColor Yellow'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '        Write-Host \"You need to edit this file with your actual WSUS server settings.\" -ForegroundColor Yellow'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '        Write-Host \"Use nano .env to edit the file.\" -ForegroundColor Yellow'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '        Write-Host \"After editing, restart the container for changes to take effect.\" -ForegroundColor Yellow'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '    } else {'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '        Write-Host \"ERROR: .env.example file not found!\" -ForegroundColor Red'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '        exit 1'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '    }'"
RUN powershell -Command "Add-Content -Path /app/startup.ps1 -Value '}'"
RUN Add-Content -Path /app/startup.ps1 -Value ""
RUN Add-Content -Path /app/startup.ps1 -Value "# Check if WSUS tools are available"
RUN Add-Content -Path /app/startup.ps1 -Value "try {"
RUN Add-Content -Path /app/startup.ps1 -Value "    `$module = Get-Module -ListAvailable -Name UpdateServices"
RUN Add-Content -Path /app/startup.ps1 -Value "    if (`$null -eq `$module) {"
RUN Add-Content -Path /app/startup.ps1 -Value "        Write-Host `"NOTICE: WSUS tools are not available in this container.`" -ForegroundColor Yellow"
RUN Add-Content -Path /app/startup.ps1 -Value "        Write-Host `"This is normal when running in a containerized environment.`" -ForegroundColor Yellow"
RUN Add-Content -Path /app/startup.ps1 -Value "        Write-Host `"The dashboard will run in UI-only mode and connect to a remote WSUS server.`" -ForegroundColor Yellow"
RUN Add-Content -Path /app/startup.ps1 -Value "    } else {"
RUN Add-Content -Path /app/startup.ps1 -Value "        Write-Host `"WSUS tools are available.`" -ForegroundColor Green"
RUN Add-Content -Path /app/startup.ps1 -Value "    }"
RUN Add-Content -Path /app/startup.ps1 -Value "} catch {"
RUN Add-Content -Path /app/startup.ps1 -Value "    Write-Host `"WARNING: Error checking WSUS tools: `$_`" -ForegroundColor Yellow"
RUN Add-Content -Path /app/startup.ps1 -Value "}"
RUN Add-Content -Path /app/startup.ps1 -Value ""
RUN Add-Content -Path /app/startup.ps1 -Value "# Display some help information"
RUN Add-Content -Path /app/startup.ps1 -Value "Write-Host `"WSUS Dashboard Container`" -ForegroundColor Cyan"
RUN Add-Content -Path /app/startup.ps1 -Value "Write-Host `"==================================================================`" -ForegroundColor Cyan"
RUN Add-Content -Path /app/startup.ps1 -Value "Write-Host `"The WSUS Dashboard is now starting. To access the dashboard:`" -ForegroundColor Cyan"
RUN Add-Content -Path /app/startup.ps1 -Value "Write-Host `"- Open a web browser and navigate to http://localhost:5000`" -ForegroundColor Cyan"
RUN Add-Content -Path /app/startup.ps1 -Value "Write-Host `"`" -ForegroundColor Cyan"
RUN Add-Content -Path /app/startup.ps1 -Value "Write-Host `"For help and configuration:`" -ForegroundColor Cyan"
RUN Add-Content -Path /app/startup.ps1 -Value "Write-Host `"- Edit the .env file: nano .env`" -ForegroundColor Cyan"
RUN Add-Content -Path /app/startup.ps1 -Value "Write-Host `"==================================================================`" -ForegroundColor Cyan"
RUN Add-Content -Path /app/startup.ps1 -Value ""
RUN Add-Content -Path /app/startup.ps1 -Value "# Start the application"
RUN Add-Content -Path /app/startup.ps1 -Value "Write-Host `"Starting WSUS Dashboard application...`" -ForegroundColor Green"
RUN Add-Content -Path /app/startup.ps1 -Value "npm start"

# Set the entry point
ENTRYPOINT ["powershell", "-File", "/app/startup.ps1"]
