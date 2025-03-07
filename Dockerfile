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

# Enable the RSAT feature for WSUS tools - this requires Windows Server
RUN try { \
      Install-WindowsFeature -Name RSAT-WSUS -IncludeManagementTools -IncludeAllSubFeature; \
      Write-Host "WSUS Tools installed successfully."; \
    } catch { \
      Write-Host "WARNING: Failed to install WSUS Tools. Error: $_"; \
    }

# Install required PowerShell modules
RUN try { \
      Install-Module -Name PSWindowsUpdate -Force -AllowClobber -SkipPublisherCheck; \
      Write-Host "PSWindowsUpdate module installed successfully."; \
    } catch { \
      Write-Host "WARNING: Failed to install PSWindowsUpdate module. Error: $_"; \
    }

RUN try { \
      Install-Module -Name UpdateServices -Force -AllowClobber -SkipPublisherCheck; \
      Write-Host "UpdateServices module installed successfully."; \
    } catch { \
      Write-Host "WARNING: Failed to install UpdateServices module. Error: $_"; \
    }

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

# Create a startup script with direct echo commands
RUN echo "# Container startup script for WSUS Dashboard" > /app/startup.ps1
RUN echo "Write-Host \"Starting WSUS Dashboard Container...\" -ForegroundColor Green" >> /app/startup.ps1
RUN echo "" >> /app/startup.ps1
RUN echo "# Check if .env file exists" >> /app/startup.ps1
RUN echo "if (-not (Test-Path .env)) {" >> /app/startup.ps1
RUN echo "    Write-Host \"No .env file found. Creating from template...\" -ForegroundColor Yellow" >> /app/startup.ps1
RUN echo "    " >> /app/startup.ps1
RUN echo "    if (Test-Path .env.example) {" >> /app/startup.ps1
RUN echo "        Copy-Item .env.example .env" >> /app/startup.ps1
RUN echo "        Write-Host \"IMPORTANT: Default .env file created from template.\" -ForegroundColor Yellow" >> /app/startup.ps1
RUN echo "        Write-Host \"You need to edit this file with your actual WSUS server settings.\" -ForegroundColor Yellow" >> /app/startup.ps1
RUN echo "        Write-Host \"Use nano .env to edit the file.\" -ForegroundColor Yellow" >> /app/startup.ps1
RUN echo "        Write-Host \"After editing, restart the container for changes to take effect.\" -ForegroundColor Yellow" >> /app/startup.ps1
RUN echo "    } else {" >> /app/startup.ps1
RUN echo "        Write-Host \"ERROR: .env.example file not found!\" -ForegroundColor Red" >> /app/startup.ps1
RUN echo "        exit 1" >> /app/startup.ps1
RUN echo "    }" >> /app/startup.ps1
RUN echo "}" >> /app/startup.ps1
RUN echo "" >> /app/startup.ps1
RUN echo "# Check if WSUS tools are available" >> /app/startup.ps1
RUN echo "try {" >> /app/startup.ps1
RUN echo "    \$module = Get-Module -ListAvailable -Name UpdateServices" >> /app/startup.ps1
RUN echo "    if (\$null -eq \$module) {" >> /app/startup.ps1
RUN echo "        Write-Host \"WARNING: UpdateServices module not found. Some WSUS functionality may not work.\" -ForegroundColor Yellow" >> /app/startup.ps1
RUN echo "    } else {" >> /app/startup.ps1
RUN echo "        Write-Host \"WSUS tools are available.\" -ForegroundColor Green" >> /app/startup.ps1
RUN echo "    }" >> /app/startup.ps1
RUN echo "} catch {" >> /app/startup.ps1
RUN echo "    Write-Host \"WARNING: Error checking WSUS tools: \$_\" -ForegroundColor Yellow" >> /app/startup.ps1
RUN echo "}" >> /app/startup.ps1
RUN echo "" >> /app/startup.ps1
RUN echo "# Display some help information" >> /app/startup.ps1
RUN echo "Write-Host \"WSUS Dashboard Container\" -ForegroundColor Cyan" >> /app/startup.ps1
RUN echo "Write-Host \"===================================================================\" -ForegroundColor Cyan" >> /app/startup.ps1
RUN echo "Write-Host \"The WSUS Dashboard is now starting. To access the dashboard:\" -ForegroundColor Cyan" >> /app/startup.ps1
RUN echo "Write-Host \"- Open a web browser and navigate to http://localhost:5000\" -ForegroundColor Cyan" >> /app/startup.ps1
RUN echo "Write-Host \"\" -ForegroundColor Cyan" >> /app/startup.ps1
RUN echo "Write-Host \"For help and configuration:\" -ForegroundColor Cyan" >> /app/startup.ps1
RUN echo "Write-Host \"- Edit the .env file: nano .env\" -ForegroundColor Cyan" >> /app/startup.ps1
RUN echo "Write-Host \"===================================================================\" -ForegroundColor Cyan" >> /app/startup.ps1
RUN echo "" >> /app/startup.ps1
RUN echo "# Start the application" >> /app/startup.ps1
RUN echo "Write-Host \"Starting WSUS Dashboard application...\" -ForegroundColor Green" >> /app/startup.ps1
RUN echo "npm start" >> /app/startup.ps1

# Set the entry point
ENTRYPOINT ["powershell", "-File", "/app/startup.ps1"]
