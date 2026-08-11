@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -filter:a "asetrate=44100*0.75,aresample=44100,atempo=1.0" temp.wav
"C:\ffmpeg\bin\ffmpeg.exe" -i temp.mp3 -af "vibrato=f=3.5:d=0.6,bass=g=7" %~n1_screw_activis.wav
del temp.wav
