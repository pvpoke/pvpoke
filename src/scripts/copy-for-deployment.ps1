[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Commit = "HEAD"
)

$ErrorActionPreference = "Stop"

$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$sourcePath = Join-Path $sourceRoot "src"
$deployPath = Join-Path $sourceRoot "src-deploy"

# Paths are relative to src/. Directory entries also exclude everything below
# that directory. Leading slashes are intentionally omitted for consistency
# with the paths returned by Git.
$ignoredPaths = @(
    "scripts"
    ".vscode"
    "modules/config.php"
    "modules/ads"
    "rss/feedEditor.php"
    "data/compile.php"
    "data/overrideEditor.php"
    "data/parse.php"
    "data/parseElite.php"
    "data/parseEvolution.php"
    "data/parseMoveCost.php"
    "data/parseMoves.php"
    "data/write.php"
    "data/overrides"
    "data/gamemaster/cups"
    "data/gamemaster/base.json"
    "data/gamemaster/moves.json"
    "data/gamemaster/pokemon.json"
    "data/gamemaster/formats.json"
    "ranker.php"
    "rankersandbox.php"
)

function Test-IgnoredPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )

    $normalizedPath = $RelativePath.TrimStart("/")
    foreach ($ignoredPath in $ignoredPaths) {
        if ($normalizedPath -eq $ignoredPath -or $normalizedPath.StartsWith("$ignoredPath/")) {
            return $true
        }
    }

    return $false
}

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $result = & git -C $sourceRoot @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $($Arguments -join ' ')"
    }

    return $result
}

# Resolve and validate the requested comparison point before querying the diff.
$resolvedCommit = (Invoke-Git @("rev-parse", "--verify", "$Commit^{commit}")).Trim()

# Rebuild the deployment package from scratch on every run.
if (Test-Path -LiteralPath $deployPath -PathType Container) {
    Get-ChildItem -LiteralPath $deployPath -Force | Remove-Item -Recurse -Force
}
else {
    New-Item -ItemType Directory -Path $deployPath -Force | Out-Null
}

# Git returns paths relative to the repository root. Include tracked changes and
# untracked files so newly created files are available for deployment as well.
$changedPaths = @(
    Invoke-Git @("diff", "--name-only", "--diff-filter=ACMRTUXB", $resolvedCommit, "--", "src")
    Invoke-Git @("ls-files", "--others", "--exclude-standard", "--", "src")
)

$deletedPaths = @(
    Invoke-Git @("diff", "--name-only", "--diff-filter=D", $resolvedCommit, "--", "src")
)

$copiedCount = 0
foreach ($relativePath in ($changedPaths | Sort-Object -Unique)) {
    if ([string]::IsNullOrWhiteSpace($relativePath)) {
        continue
    }

    $deploymentRelativePath = $relativePath.Substring(4)
    if (Test-IgnoredPath $deploymentRelativePath) {
        Write-Host "Skipped ignored path $relativePath"
        continue
    }

    $sourceFile = Join-Path $sourceRoot $relativePath
    if (-not (Test-Path -LiteralPath $sourceFile -PathType Leaf)) {
        continue
    }

    $destinationFile = Join-Path $deployPath $deploymentRelativePath
    $destinationDirectory = Split-Path -Parent $destinationFile
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $sourceFile -Destination $destinationFile -Force
    $copiedCount++
    Write-Host "Copied $relativePath"
}

foreach ($relativePath in $deletedPaths) {
    if ([string]::IsNullOrWhiteSpace($relativePath)) {
        continue
    }

    $deploymentRelativePath = $relativePath.Substring(4)
    if (Test-IgnoredPath $deploymentRelativePath) {
        continue
    }

    $destinationFile = Join-Path $deployPath $deploymentRelativePath
    if (Test-Path -LiteralPath $destinationFile -PathType Leaf) {
        Remove-Item -LiteralPath $destinationFile -Force
        Write-Host "Removed deleted file $relativePath"
    }
}

Write-Host "Prepared $copiedCount changed file(s) in $deployPath compared with $resolvedCommit."
