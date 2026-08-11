"C:\ffmpeg\bin\ffmpeg.exe" -i %~1 -af "asetrate=44100*0.85,aresample=44100,atempo=1.0" temp1.wav
"C:\ffmpeg\bin\ffmpeg.exe" -i temp1.wav -af "aecho=0.8:0.88:60:0.4" temp2.wav
"C:\ffmpeg\bin\ffmpeg.exe" -i temp2.wav -af "bass=g=6" %~n1_screw_full_fx.wav
del temp1.wav
del temp2.wav
