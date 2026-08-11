ffmpeg -i %~1 -af "asetrate=44100*0.8,aresample=44100,atempo=1.0" temp.mp3
ffmpeg -i temp.mp3 -af "aecho=0.9:0.9:100:0.3,stereotools=mlev=1.8" -c:a pcm_s24le %~1_screw_tris.wav
del temp.mp3
