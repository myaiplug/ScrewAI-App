
@echo off
REM === MyAiPlug — FFmpeg Mastering (Windows .BAT example) ===
REM Usage: ffmpeg_mastering.bat input.wav output_master.wav

if "%~1"=="" (
  echo Usage: %~nx0 input.wav output.wav
  exit /b 1
)

set IN=%~1
set OUT=%~2

REM 1) Normalize to -14 LUFS (Spotify-ish), keep truepeak under -1.0 dB
ffmpeg -y -i "%IN%" -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=-999:measured_LRA=-999:measured_TP=-999:print_format=summary" -c:a pcm_s16le "tmp_lufs.wav"

REM 2) Gentle EQ: low shelf +1.5 dB @ 90Hz, high shelf +1.0 dB @ 9kHz
ffmpeg -y -i "tmp_lufs.wav" -af "equalizer=f=90:t=low:s=0.7:g=1.5, equalizer=f=9000:t=high:s=0.7:g=1.0" -c:a pcm_s16le "tmp_eq.wav"

REM 3) Limiter (simple soft clip via acompressor)
ffmpeg -y -i "tmp_eq.wav" -af "acompressor=threshold=-2dB:ratio=8:attack=5:release=50:makeup=0" -c:a pcm_s16le "%OUT%"

del "tmp_lufs.wav" 2>nul
del "tmp_eq.wav" 2>nul

echo Done: %OUT%
