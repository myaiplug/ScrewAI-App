@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -filter:a "asetrate=44100*0.88,aresample=44100,atempo=1.0" temp.mp3
"C:\ffmpeg\bin\ffmpeg.exe" -i temp.mp3 -af "tremolo=f=5.0:d=0.7,aecho=0.8:0.88:60:0.4,stereotools=mlev=1.4" %~n1_screw_quali.mp3
del temp.mp3
