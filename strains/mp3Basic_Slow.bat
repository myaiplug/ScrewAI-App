@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -af "vibrato=f=3.5:d=0.6,bass=g=7,treble=g=3" %~n1_basic_screw.wav


