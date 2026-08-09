# .\cupwizard.cmd scroll 1500,2500,10000
# Creates empty JSON files for group, override, and ranking files

$cupName = $args[0]
$leagues = $args[1] -split ','

$dataPath = Join-Path $PSScriptRoot "../data"

$rankingTypes = @(
    "attackers",
    "chargers",
    "closers",
    "consistency",
    "leads",
    "overall",
    "switches"
)

# Groups
$groupsPath = Join-Path $dataPath "groups"
New-Item -ItemType Directory -Path $groupsPath -Force | Out-Null

$groupsFile = Join-Path $groupsPath "$cupName.json"
Set-Content -Path $groupsFile -Value "[]" -Encoding UTF8
Write-Host "File created: $([System.IO.Path]::GetFullPath($groupsFile))"

# Overrides
$overridesPath = Join-Path $dataPath "overrides/$cupName"
New-Item -ItemType Directory -Path $overridesPath -Force | Out-Null

# Rankings
$rankingsPath = Join-Path $dataPath "rankings/rankings-$cupName"
New-Item -ItemType Directory -Path $rankingsPath -Force | Out-Null

foreach ($league in $leagues) {

    # Override
    $overrideFile = Join-Path $overridesPath "$league.json"
    Set-Content -Path $overrideFile -Value "[]" -Encoding UTF8
    Write-Host "File created: $([System.IO.Path]::GetFullPath($overrideFile))"

    # Rankings
    foreach ($rankingType in $rankingTypes) {

        $rankingTypePath = Join-Path $rankingsPath $rankingType
        New-Item -ItemType Directory -Path $rankingTypePath -Force | Out-Null

        $rankingFile = Join-Path $rankingTypePath "$league.json"
        Set-Content -Path $rankingFile -Value "[]" -Encoding UTF8

        Write-Host "File created: $([System.IO.Path]::GetFullPath($rankingFile))"
    }
}

Write-Host ""
Write-Host "Finished creating files for cup '$cupName'."