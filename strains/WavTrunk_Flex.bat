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
set "OUT=%DIR%%NAME%_Trunk_Flex.wav"

echo ===============================
echo INPUT:  "%IN%"
echo TEMP:   "%TMP%"
echo OUTPUT: "%OUT%"
echo ===============================
echo.

:: -------------------------------
:: Stage 1 ? Screw / Tone (24-bit)
:: -------------------------------
ffmpeg -hide_banner -y -i "%IN%" -vn ^
-af "asetrate=44100*0.90,aresample=44100*0.89,equalizer=f=50:t=q:w=1.2:g=5.0,equalizer=f=120:t=q:w=1.2:g=3.5,equalizer=f=700:t=q:w=1.0:g=-2.0,equalizer=f=3000:t=q:w=1.0:g=-2.5,equalizer=f=8500:t=q:w=1.1:g=1.8,rubberband=pitchq=5,tremolo=f=0.9:d=0.55,stereotools=mlev=1.25" ^
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
-ar 44100 -ac 2 -c:a pcm_s24le "%OUT%"

if errorlevel 1 (
  echo Stage 3 FAILED
  pause
  exit /b 1
)

del "%TMP%" >nul 2>&1
del "%TMP%_stage2.wav" >nul 2>&1

echo DONE
pause

