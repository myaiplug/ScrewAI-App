ffmpeg -i %~1 -af "asetrate=44100*0.8,aresample=44100,atempo=1.0" temp.wav
ffmpeg -i temp.wav -af "aecho=0.9:0.9:100:0.3,stereotools=mlev=1.8" %~n1_ screw_loud.wav
del temp.wav