# Container startup script for WSUS Dashboard
Write-Output "Starting WSUS Dashboard Container..."

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Output "No .env file found. Creating from template..."
    
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Output "==================================================================="
        Write-Output "IMPORTANT: Default .env file created from template."
        Write-Output "You need to edit this file with your actual WSUS server settings."
        Write-Output ""
        Write-Output "Use one of the following commands to edit the file:"
        Write-Output "  - nano .env"
        Write-Output ""
        Write-Output "After editing, restart the container for changes to take effect."
        Write-Output "==================================================================="
    } else {
        Write-Output "ERROR: .env.example file not found!"
        exit 1
    }
}

# Check if WSUS tools are available
try {
    $module = Get-Module -ListAvailable -Name UpdateServices
    if ($null -eq $module) {
        Write-Output "WARNING: UpdateServices module not found. Some WSUS functionality may not work."
    } else {
        Write-Output "WSUS tools are available."
    }
} catch {
    Write-Output "WARNING: Error checking WSUS tools: $_"
}

# Display some help information
Write-Output ""
Write-Output "==================================================================="
Write-Output "WSUS Dashboard Container"
Write-Output "==================================================================="
Write-Output "The WSUS Dashboard is now starting. To access the dashboard:"
Write-Output "- Open a web browser and navigate to http://localhost:5000"
Write-Output ""
Write-Output "For help and configuration:"
Write-Output "- Edit the .env file: nano .env"
Write-Output "==================================================================="

# Start the application
Write-Output "Starting WSUS Dashboard application..."
npm start
