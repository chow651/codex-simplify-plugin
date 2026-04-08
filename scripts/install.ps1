param(
  [string]$InstallHome = $HOME,
  [string]$RepoUrl = "https://github.com/chow651/codex-simplify-plugin.git",
  [string]$RepoSource = "",
  [switch]$WithGate
)

$ErrorActionPreference = "Stop"

function Ensure-Directory {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function ConvertTo-HashtableRecursive {
  param([Parameter(ValueFromPipeline = $true)] $InputObject)

  if ($null -eq $InputObject) {
    return $null
  }

  if ($InputObject -is [System.Collections.IDictionary]) {
    $result = [ordered]@{}
    foreach ($key in $InputObject.Keys) {
      $result[$key] = ConvertTo-HashtableRecursive $InputObject[$key]
    }
    return $result
  }

  if ($InputObject -is [System.Collections.IEnumerable] -and -not ($InputObject -is [string])) {
    $items = @()
    foreach ($item in $InputObject) {
      $items += ,(ConvertTo-HashtableRecursive $item)
    }
    return $items
  }

  if ($InputObject -is [psobject]) {
    $properties = $InputObject.PSObject.Properties
    if ($properties.Count -gt 0) {
      $result = [ordered]@{}
      foreach ($property in $properties) {
        $result[$property.Name] = ConvertTo-HashtableRecursive $property.Value
      }
      return $result
    }
  }

  return $InputObject
}

function Sync-LocalRepo {
  param(
    [string]$Source,
    [string]$Destination
  )

  Ensure-Directory -Path $Destination

  Get-ChildItem -LiteralPath $Destination -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne '.git' } |
    Remove-Item -Recurse -Force

  Get-ChildItem -LiteralPath $Source -Force |
    Where-Object { $_.Name -ne '.git' } |
    ForEach-Object {
      Copy-Item -LiteralPath $_.FullName -Destination $Destination -Recurse -Force
    }
}

function Sync-RemoteRepo {
  param(
    [string]$Remote,
    [string]$Destination
  )

  if (Test-Path -LiteralPath (Join-Path $Destination '.git')) {
    git -C $Destination pull --ff-only | Out-Null
    return
  }

  if (Test-Path -LiteralPath $Destination) {
    Remove-Item -LiteralPath $Destination -Recurse -Force
  }

  git clone $Remote $Destination | Out-Null
}

function Update-Marketplace {
  param(
    [string]$MarketplacePath
  )

  $entry = [ordered]@{
    name = "simplify"
    source = [ordered]@{
      source = "local"
      path = "./plugins/simplify"
    }
    policy = [ordered]@{
      installation = "INSTALLED_BY_DEFAULT"
      authentication = "ON_INSTALL"
    }
    category = "Coding"
  }

  if (-not (Test-Path -LiteralPath $MarketplacePath)) {
    Ensure-Directory -Path (Split-Path -Parent $MarketplacePath)
    $initial = [ordered]@{
      name = "neo-local"
      interface = [ordered]@{
        displayName = "Neo Local"
      }
      plugins = @($entry)
    }
    $initial | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $MarketplacePath -Encoding UTF8
    return
  }

  $marketplace = Get-Content -LiteralPath $MarketplacePath -Raw | ConvertFrom-Json | ConvertTo-HashtableRecursive
  if (-not $marketplace.Contains('plugins')) {
    $marketplace.plugins = @()
  }

  $existing = @($marketplace.plugins | Where-Object { $_.name -eq 'simplify' })
  if ($existing.Count -gt 0) {
    $marketplace.plugins = @($marketplace.plugins | Where-Object { $_.name -ne 'simplify' })
  }

  $marketplace.plugins += $entry
  $marketplace | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $MarketplacePath -Encoding UTF8
}

function Install-SkillMirror {
  param(
    [string]$PluginRoot,
    [string]$SkillRelativePath,
    [string]$SkillMirrorPath
  )

  Ensure-Directory -Path (Split-Path -Parent $SkillMirrorPath)
  Copy-Item -LiteralPath (Join-Path $PluginRoot $SkillRelativePath) -Destination $SkillMirrorPath -Force
}

function Install-GateSnippet {
  param(
    [string]$PluginRoot,
    [string]$AgentsPath
  )

  $marker = '## Simplify Gate'
  $snippetPath = Join-Path $PluginRoot 'examples\AGENTS.snippet.md'
  $snippet = Get-Content -LiteralPath $snippetPath -Raw

  if (-not (Test-Path -LiteralPath $AgentsPath)) {
    $snippet | Set-Content -LiteralPath $AgentsPath -Encoding UTF8
    return
  }

  $existing = Get-Content -LiteralPath $AgentsPath -Raw
  if ($existing.Contains($marker)) {
    return
  }

  $merged = ($existing.TrimEnd() + "`r`n`r`n" + $snippet.Trim() + "`r`n")
  $merged | Set-Content -LiteralPath $AgentsPath -Encoding UTF8
}

function Install-CodexHook {
  param(
    [string]$CodexHooksPath,
    [string]$PluginRoot
  )

  if ($IsWindows) {
    Write-Output "Skipped Codex hooks install on Windows because Codex hooks are currently disabled on Windows."
    return
  }

  Ensure-Directory -Path (Split-Path -Parent $CodexHooksPath)

  $command = "python3 `"$($PluginRoot.Replace('\','/'))/scripts/simplify_stop_gate.py`""
  $entry = [ordered]@{
    type = "command"
    command = $command
    timeout = 30
    statusMessage = "Checking simplify completion gate"
  }

  if (Test-Path -LiteralPath $CodexHooksPath) {
    $hooks = Get-Content -LiteralPath $CodexHooksPath -Raw | ConvertFrom-Json | ConvertTo-HashtableRecursive
  } else {
    $hooks = [ordered]@{ hooks = [ordered]@{} }
  }

  if (-not $hooks.Contains('hooks')) {
    $hooks.hooks = [ordered]@{}
  }
  if (-not $hooks.hooks.Contains('Stop')) {
    $hooks.hooks.Stop = @()
  }

  $exists = $false
  foreach ($stopEntry in @($hooks.hooks.Stop)) {
    foreach ($existing in @($stopEntry.hooks)) {
      if ($existing.command -eq $command) {
        $exists = $true
        break
      }
    }
    if ($exists) {
      break
    }
  }

  if (-not $exists) {
    $stopEntries = @($hooks.hooks.Stop)
    $stopEntries += ,([ordered]@{ hooks = @($entry) })
    $hooks.hooks.Stop = $stopEntries
  }

  $hooks | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $CodexHooksPath -Encoding UTF8
}

$pluginRoot = Join-Path $InstallHome 'plugins\simplify'
$marketplacePath = Join-Path $InstallHome '.agents\plugins\marketplace.json'
$skillMirrorPath = Join-Path $InstallHome '.codex\skills\simplify\SKILL.md'
$usingSimplifyMirrorPath = Join-Path $InstallHome '.codex\skills\using-simplify\SKILL.md'
$agentsPath = Join-Path $InstallHome '.codex\AGENTS.md'
$codexHooksPath = Join-Path $InstallHome '.codex\hooks.json'

Ensure-Directory -Path (Join-Path $InstallHome 'plugins')

if ($RepoSource) {
  Sync-LocalRepo -Source $RepoSource -Destination $pluginRoot
} else {
  Sync-RemoteRepo -Remote $RepoUrl -Destination $pluginRoot
}

Update-Marketplace -MarketplacePath $marketplacePath
Install-SkillMirror -PluginRoot $pluginRoot -SkillRelativePath 'skills\simplify\SKILL.md' -SkillMirrorPath $skillMirrorPath
Install-SkillMirror -PluginRoot $pluginRoot -SkillRelativePath 'skills\using-simplify\SKILL.md' -SkillMirrorPath $usingSimplifyMirrorPath

if ($WithGate) {
  Install-GateSnippet -PluginRoot $pluginRoot -AgentsPath $agentsPath
  Install-CodexHook -CodexHooksPath $codexHooksPath -PluginRoot $pluginRoot
}

Write-Output "Installed simplify plugin to $pluginRoot"
Write-Output "Updated marketplace: $marketplacePath"
Write-Output "Installed visible skill mirror: $skillMirrorPath"
Write-Output "Installed visible skill mirror: $usingSimplifyMirrorPath"
if ($WithGate) {
  Write-Output "Installed Simplify Gate into $agentsPath"
  Write-Output "Configured Codex Stop hook in $codexHooksPath when supported by the current platform"
}
Write-Output "Restart Codex to load the plugin."
