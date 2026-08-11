@echo off
setlocal enabledelayedexpansion

rem --- 1) Make sure we got a file ---
if "%~1"=="" (
  echo Drag an audio file onto this .bat
  pause
  exit /b
)

set "INPUT=%~1"
set "DIR=%~dp1"
set "NAME=%~n1"

rem --- 2) Find ffmpeg: prefer ffmpeg.exe next to this bat, else PATH ---
set "FFMPEG=%~dp0ffmpeg.exe"
if not exist "%FFMPEG%" (
  set "FFMPEG=ffmpeg"
)

rem Quick check so you don't get a silent fail
"%FFMPEG%" -version >nul 2>&1
if errorlevel 1 (
  echo.
  echo ERROR: ffmpeg not found.
  echo - Either put ffmpeg.exe next to this .bat
  echo - Or install ffmpeg and add it to PATH
  pause
  exit /b
)

set "TEMP_SCREW=%DIR%%NAME%_temp_screw.wav"
set "TEMP_BASS=%DIR%%NAME%_temp_bass.wav"
set "OUT=%DIR%%NAME%_syrup_experiment.mp3"

echo [1/3] Screw stage...
"%FFMPEG%" -y -i "%INPUT%" -af "asetrate=44100*0.82,aresample=44100*0.94" "%TEMP_SCREW%"
if errorlevel 1 (
  echo.
  echo ERROR during screw stage.
  pause
  exit /b
)

echo [2/3] Bass boost...
"%FFMPEG%" -y -i "%TEMP_SCREW%" -af "equalizer=f=60:t=h:width=100:g=8,equalizer=f=200:t=h:width=200:g=4" "%TEMP_BASS%"
if errorlevel 1 (
  echo.
  echo ERROR during bass boost stage.
  pause
  exit /b
)

echo [3/3] Loudness / Spotify-ish LUFS...
"%FFMPEG%" -y -i "%TEMP_BASS%" -af "loudnorm=I=-14:TP=-1.0:LRA=11" -c:a libmp3lame -b:a 320k "%OUT%"
if errorlevel 1 (
  echo.
  echo ERROR during loudness stage.
  pause
  exit /b
)

del "%TEMP_SCREW%" 2>nul
del "%TEMP_BASS%" 2>nul

echo.
echo Done.
echo Output: "%OUT%"
pause