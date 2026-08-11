ffmpeg -i %~1 -filter:a "asetrate=44100*0.85,aresample=44100,atempo=0.92,chorus=0.65:0.85:55:0.4:0.25:1.8,stereotools=mlev=5" -c:a pcm_s24le %~1_screw_tris.wav
