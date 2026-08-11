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
set "OUT=%DIR%%NAME%_Codeine_Sway.mp3"

echo ===============================
echo INPUT:  "%IN%"
echo TEMP:   "%TMP%"
echo OUTPUT: "%OUT%"
echo ===============================
echo.

:: -------------------------------
:: Stage 1 ? Screw + Wow/Flutter (24-bit)
:: -------------------------------
ffmpeg -hide_banner -y -i "%IN%" -vn ^
-af "asetrate=44100*0.93,aresample=44100*0.92,equalizer=f=75:t=q:w=1.1:g=3.2,equalizer=f=140:t=q:w=1.2:g=2.3,equalizer=f=600:t=q:w=1.0:g=-1.5,equalizer=f=2800:t=q:w=1.0:g=-1.6,equalizer=f=9800:t=q:w=1.1:g=2.4,rubberband=pitchq=4,vibrato=f=0.35:d=0.06,aphaser=type=t:speed=0.2:decay=0.3,alowpass=f=8500,stereotools=mlev=1.1" ^
-ar 44100 -ac 2 -c:a pcm_s24le "%TMP%"

if errorlevel 1 (
  echo Stage 1 FAILED
  pause
  del "%TMP%" >nul 2>&1
  exit /b 1
)

:: -------------------------------
:: Stage 2 ? Dynamics + Loudness
:: -------------------------------
ffmpeg -hide_banner -y -i "%TMP%" -vn ^
-af "acompressor=threshold=-18dB:ratio=2.2:attack=30:release=350:makeup=2,highpass=f=28,lowpass=f=18500,alimiter=limit=0.985,loudnorm=I=-14:TP=-1.0:LRA=9" ^
-ar 44100 -ac 2 -c:a pcm_s24le "%TMP%_stage2.wav"

if errorlevel 1 (
  echo Stage 2 FAILED
  pause
  del "%TMP%" >nul 2>&1
  exit /b 1
)

:: -------------------------------
:: Stage 3 ? Final Polish
:: -------------------------------
ffmpeg -hide_banner -y -i "%TMP%_stage2.wav" -vn ^
-af "highpass=f=28,lowpass=f=18500,stereotools=phase=0.02:mlev=1.0:slev=1.0" ^
-ar 44100 -ac 2 -c:a libmp3lame -q:a 2 "%OUT%"

if errorlevel 1 (
  echo Stage 3 FAILED
  pause
  exit /b 1
)

del "%TMP%" >nul 2>&1
del "%TMP%_stage2.wav" >nul 2>&1

echo DONE
pause
