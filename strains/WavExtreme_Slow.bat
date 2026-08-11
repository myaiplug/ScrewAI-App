@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -af "asetrate=44100*0.77,aresample=44100,atempo=1.0,bass=g=5:f=100,acompressor=threshold=-18dB:ratio=3:attack=25:release=300:makeup=3" %~n1_extremescrew.wav
