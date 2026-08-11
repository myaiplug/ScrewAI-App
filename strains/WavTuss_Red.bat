@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -filter:a "asetrate=44100*0.90,aresample=44100,atempo=1.0" temp.wav
ffmpeg -i temp.wav -af "bass=g=5" %~n1_screw_tuss.wav
del temp.wav
