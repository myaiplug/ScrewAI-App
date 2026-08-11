@echo off
setlocal EnableExtensions

if "%~1"=="" (
  echo Drag and drop ONE audio file onto this .bat
  pause
  exit /b 1
)

set "IN=%~1"

for %%F in ("%IN%") do (
  set "NAME=%%~nF"
  set "DIR=%%~dpF"
)

set "TMP=%TEMP%\%NAME%__tonepass_%RANDOM%%RANDOM%.wav"
set "OUT=%DIR%%NAME%_SlowDown_Mild.mp3"

echo ===============================
echo INPUT:  "%IN%"
echo TEMP:   "%TMP%"
echo OUTPUT: "%OUT%"
echo ===============================
echo.

:: -------------------------------
:: Stage 1 ? Pitch + Tone (TEMP)
:: -------------------------------
ffmpeg -hide_banner -y -i "%IN%" -vn ^
-af "asetrate=44100*0.93,aresample=44100*0.92,equalizer=f=80:t=q:w=1.1:g=3.5,equalizer=f=100:t=q:w=1.2:g=2.0,equalizer=f=600:t=q:w=1.0:g=-1.5,equalizer=f=3500:t=q:w=1.0:g=-2.0,equalizer=f=9000:t=q:w=1.1:g=2.0,rubberband=pitchq=5,stereotools=mlev=1.2" ^
-ar 44100 -ac 2 -c:a pcm_s16le "%TMP%"

if errorlevel 1 (
  echo.
  echo Stage 1 FAILED. Scroll up to see the FFmpeg error.
  pause
  del "%TMP%" >nul 2>&1
  exit /b 1
)

:: -------------------------------
:: Stage 2 ? Compression + LUFS
:: -------------------------------
ffmpeg -hide_banner -y -i "%TMP%" -vn ^
-af "acompressor=threshold=-12dB:ratio=3:attack=20:release=250:makeup=2,alimiter=limit=0.98,loudnorm=I=-12:TP=-1.0:LRA=9" ^
-ar 44100 -ac 2 -c:a libmp3lame -q:a 2 "%OUT%"

if errorlevel 1 (
  echo.
  echo Stage 2 FAILED. Scroll up to see the FFmpeg error.
  pause
  del "%TMP%" >nul 2>&1
  exit /b 1
)

del "%TMP%" >nul 2>&1

echo.
echo DONE: "%OUT%"
pause
