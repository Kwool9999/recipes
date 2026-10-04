# 유튜브 영상의 제목, 설명란, 자막, 화면 캡처 모음을 받아 온다.
# 실행: powershell -File tools\fetch-video.ps1 -Id <영상ID> -Out <저장 폴더> [-Frames]
param([Parameter(Mandatory = $true)][string]$Id, [Parameter(Mandatory = $true)][string]$Out, [switch]$Frames, [int]$Every = 7)

$pk = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages"
$yt = (Get-ChildItem $pk -Recurse -Filter yt-dlp.exe | Select-Object -First 1).FullName
$deno = "$pk\DenoLand.Deno_Microsoft.Winget.Source_8wekyb3d8bbwe"
$ff = (Get-ChildItem $pk -Recurse -Filter ffmpeg.exe | Select-Object -First 1).DirectoryName
$env:Path = "$ff;$deno;" + $env:Path
[Console]::OutputEncoding = [Text.Encoding]::UTF8

$dir = Join-Path $Out $Id
New-Item -ItemType Directory -Force $dir | Out-Null
$url = "https://www.youtube.com/watch?v=$Id"

& $yt -q --no-warnings --no-playlist --skip-download --ignore-errors --write-subs --write-auto-subs --sub-langs "ko-orig,ko" --sub-format json3 --sleep-subtitles 5 --write-description -o "$dir\video.%(ext)s" --print-to-file "%(title)s`n%(channel)s`n%(duration)s" "$dir\meta.txt" $url

$sub = Get-ChildItem $dir -Filter "*.json3" | Select-Object -First 1
if ($sub) { & "$deno\deno.exe" run --allow-read --allow-write "$PSScriptRoot\subs-to-text.js" $sub.FullName "$dir\transcript.txt" } else { "자막 없음" }

if ($Frames) {
  & $yt -q --no-warnings --no-playlist -f "bv*[height<=480][ext=mp4]/bv*[height<=480]" -o "$dir\clip.%(ext)s" $url
  $clip = Get-ChildItem $dir -Filter "clip.*" | Select-Object -First 1
  if ($clip) {
    New-Item -ItemType Directory -Force "$dir\frames" | Out-Null
    & "$ff\ffmpeg.exe" -v fatal -y -i $clip.FullName -vf "fps=1/$Every,scale=640:-1,drawtext=text='%{pts\:hms}':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=2x3" "$dir\frames\sheet%02d.jpg" 2>$null
    Remove-Item $clip.FullName -Confirm:$false
  }
}

Get-ChildItem $dir -Recurse -File | ForEach-Object { "{0}  {1}" -f $_.FullName.Substring($dir.Length + 1), $_.Length }
