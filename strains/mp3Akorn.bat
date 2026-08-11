@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -filter:a "asetrate=44100*0.84,aresample=44100,atempo=1.0,stereotools=mlev=1.3" %~n1_screw_akorn.mp3
pause