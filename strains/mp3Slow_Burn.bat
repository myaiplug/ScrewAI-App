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
set "OUT=%DIR%%NAME%_Slow_Burn.mp3"

echo ===============================
echo INPUT:  "%IN%"
echo TEMP:   "%TMP%"
echo OUTPUT: "%OUT%"
echo ===============================
echo.

ffmpeg -hide_banner -y -i "%IN%" -vn ^
-af "asetrate=44100*0.92,aresample=44100*0.91,equalizer=f=70:t=q:w=1.1:g=3.2,equalizer=f=1800:t=q:w=1.0:g=-1.6,rubberband=pitchq=4,vibrato=f=0.18:d=0.03" ^
-ar 44100 -ac 2 -c:a pcm_s24le "%TMP%"

if errorlevel 1 (
  echo Stage 1 FAILED
  pause
  del "%TMP%" >nul 2>&1
  exit /b 1
)

ffmpeg -hide_banner -y -i "%TMP%" -vn ^
-af "acompressor=threshold=-18dB:ratio=2.2:attack=30:release=350:makeup=2,highpass=f=28,lowpass=f=18500,alimiter=limit=0.985,loudnorm=I=-14:TP=-1.0:LRA=9" ^
-ar 44100 -ac 2 -c:a pcm_s24le "%TMP%_stage2.wav"

if errorlevel 1 (
  echo Stage 2 FAILED
  pause
  del "%TMP%" >nul 2>&1
  exit /b 1
)

ffmpeg -hide_banner -y -i "%TMP%_stage2.wav" -vn ^
-af "highpass=f=28,lowpass=f=18500,stereotools=phase=0.02:mlev=1.0:slev=1.0" ^
-ar 44100 -ac 2 -c:a libmp3lame -q:a 2 "%OUT%"

del "%TMP%" >nul 2>&1
del "%TMP%_stage2.wav" >nul 2>&1

echo DONE
pause

