@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -af "aecho=0.8:0.88:60:0.4,stereotools=mlev=1.5" %~n1_screw_hyrdo_syrp.wav
