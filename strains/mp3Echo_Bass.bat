"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -af "asetrate=44100*0.85,aresample=44100,atempo=1.0" temp1.mp3
"C:\ffmpeg\bin\ffmpeg.exe" -i temp1.mp3 -af "aecho=0.8:0.88:60:0.4" temp2.mp3
"C:\ffmpeg\bin\ffmpeg.exe" -i temp2.mp3 -af "bass=g=6" %~n1_screw_full_fx.mp3
del temp1.mp3
del temp2.mp3
