@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -filter:a "asetrate=44100*0.85,aresample=44100,atempo=1.0" temp.mp3
"C:\ffmpeg\bin\ffmpeg.exe" -i temp.mp3 -af "aecho=0.8:0.88:60:0.4" %~n1_screw_echo.mp3
del temp.mp3
