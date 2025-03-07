import { PowerShell } from "node-powershell";

const validateConfig = () => {
  const required = [
    'WSUS_SERVER',
    'WSUS_SERVICE_ACCOUNT',
    'WSUS_SERVICE_PASSWORD'
  ];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const createPowerShellWithCredentials = async () => {
  try {
    return new PowerShell({
      debug: true,
      inputEncoding: 'utf8',
      outputEncoding: 'utf8',
      executionPolicy: 'Bypass'
    });
  } catch (error) {
    console.error('Failed to create PowerShell instance:', error);
    throw new Error('PowerShell is not available. Please ensure PowerShell is installed.');
  }
};

const TIMEOUT = 15000; // 15 seconds timeout

export async function getWsusComputers() {
  validateConfig();
  let ps: PowerShell | undefined;
  let timeoutId: NodeJS.Timeout;

  try {
    ps = await createPowerShellWithCredentials();

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Connection to WSUS server timed out after 15 seconds'));
      }, TIMEOUT);
    });

    const scriptPromise = ps.invoke(`
      $ErrorActionPreference = 'Stop'
      try {
        Write-Host "Connecting to WSUS server ${process.env.WSUS_SERVER}..."

        $securePassword = ConvertTo-SecureString "${process.env.WSUS_SERVICE_PASSWORD}" -AsPlainText -Force
        $credentials = New-Object System.Management.Automation.PSCredential("${process.env.WSUS_SERVICE_ACCOUNT}", $securePassword)

        $wsus = Get-WsusServer -Name $env:WSUS_SERVER -Port ${process.env.WSUS_PORT || 8530} -UseSsl:$${process.env.WSUS_USE_SSL || 'false'} -Credential $credentials
        if (-not $wsus) {
          throw "Failed to connect to WSUS server"
        }

        Write-Host "Getting computer list..."
        $computers = Get-WsusComputer -UpdateServer $wsus | Select-Object FullDomainName,IPAddress,OSVersion,LastSyncTime,LastReportedStatusTime
        if (-not $computers) {
          Write-Host "No computers found in WSUS"
          return "[]"
        }

        $computers | ConvertTo-Json
      } catch {
        Write-Error "Failed to get WSUS computers: $_"
        throw
      }
    `);

    const result = await Promise.race([scriptPromise, timeoutPromise]);
    clearTimeout(timeoutId!);

    const output = result.raw?.trim() || "[]";
    try {
      return JSON.parse(output);
    } catch (e) {
      console.error('Failed to parse PowerShell output:', output);
      throw new Error('Invalid response from WSUS server');
    }
  } catch (error: any) {
    console.error('Failed to get WSUS computers:', error);
    if (error.message?.includes('timed out')) {
      throw error;
    }
    if (error.message?.includes('Get-WsusServer')) {
      throw new Error('Could not connect to WSUS server. Please verify the server address and credentials.');
    }
    throw new Error(error.message || 'Failed to get WSUS computers');
  } finally {
    if (ps) {
      await ps.dispose();
    }
  }
}

export async function getWsusUpdates() {
  validateConfig();
  let ps: PowerShell | undefined;
  let timeoutId: NodeJS.Timeout;

  try {
    ps = await createPowerShellWithCredentials();

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Connection to WSUS server timed out after 15 seconds'));
      }, TIMEOUT);
    });

    const scriptPromise = ps.invoke(`
      $ErrorActionPreference = 'Stop'
      try {
        $securePassword = ConvertTo-SecureString "${process.env.WSUS_SERVICE_PASSWORD}" -AsPlainText -Force
        $credentials = New-Object System.Management.Automation.PSCredential("${process.env.WSUS_SERVICE_ACCOUNT}", $securePassword)

        $wsus = Get-WsusServer -Name $env:WSUS_SERVER -Port ${process.env.WSUS_PORT || 8530} -UseSsl:$${process.env.WSUS_USE_SSL || 'false'} -Credential $credentials
        $updates = Get-WsusUpdate -UpdateServer $wsus | Select-Object UpdateId,Title,Description,Classification,SeverityRating,IsApproved
        $updates | ConvertTo-Json
      } catch {
        Write-Error "Failed to get WSUS updates: $_"
        throw
      }
    `);

    const result = await Promise.race([scriptPromise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return JSON.parse(result.toString());
  } catch (error) {
    console.error('Failed to get WSUS updates:', error);
    throw new Error('Failed to get WSUS updates. Check if WSUS server is accessible and credentials are correct.');
  } finally {
    if (ps) {
      await ps.dispose();
    }
  }
}

export async function getComputerUpdateStatus(computerName: string) {
  validateConfig();
  let ps: PowerShell | undefined;
  let timeoutId: NodeJS.Timeout;

  try {
    ps = await createPowerShellWithCredentials();

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Connection to WSUS server timed out after 15 seconds'));
      }, TIMEOUT);
    });

    const scriptPromise = ps.invoke(`
      $ErrorActionPreference = 'Stop'
      try {
        $securePassword = ConvertTo-SecureString "${process.env.WSUS_SERVICE_PASSWORD}" -AsPlainText -Force
        $credentials = New-Object System.Management.Automation.PSCredential("${process.env.WSUS_SERVICE_ACCOUNT}", $securePassword)

        $wsus = Get-WsusServer -Name $env:WSUS_SERVER -Port ${process.env.WSUS_PORT || 8530} -UseSsl:$${process.env.WSUS_USE_SSL || 'false'} -Credential $credentials
        $computer = Get-WsusComputer -UpdateServer $wsus -NameIncludes "${computerName}"
        $status = $computer | Get-WsusUpdatePerComputer | Select-Object UpdateId,State
        $status | ConvertTo-Json
      } catch {
        Write-Error "Failed to get computer update status: $_"
        throw
      }
    `);

    const result = await Promise.race([scriptPromise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return JSON.parse(result.toString());
  } catch (error) {
    console.error('Failed to get computer update status:', error);
    throw new Error('Failed to get computer update status. Check if the computer exists and is accessible.');
  } finally {
    if (ps) {
      await ps.dispose();
    }
  }
}