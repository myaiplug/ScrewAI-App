
@echo off
REM === MyAiPlug — FFmpeg Mastering (Windows .BAT example) ===
REM Usage: ffmpeg_mastering.bat input.mp3 output_master.mp3

if "%~1"=="" (
  echo Usage: %~nx0 input.mp3 output.mp3
  exit /b 1
)

set IN=%~1
set OUT=%~2

REM 1) Normalize to -14 LUFS (Spotify-ish), keep truepeak under -1.0 dB
ffmpeg -y -i "%IN%" -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=-999:measured_LRA=-999:measured_TP=-999:print_format=summary" tmp_lufs.mp3

REM 2) Gentle EQ: low shelf +1.5 dB @ 90Hz, high shelf +1.0 dB @ 9kHz
ffmpeg -y -i tmp_lufs.mp3 -af "equalizer=f=90:t=low:s=0.7:g=1.5, equalizer=f=9000:t=high:s=0.7:g=1.0" tmp_eq.mp3

REM 3) Limiter (simple soft clip via acompressor)
ffmpeg -y -i "tmp_eq.mp3 -af "acompressor=threshold=-2dB:ratio=8:attack=5:release=50:makeup=0" "%OUT%"

del "tmp_lufs.mp3" 2>nul
del "tmp_eq.mp3" 2>nul

echo Done: %OUT%
