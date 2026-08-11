ffmpeg -i %~1 -filter:a "asetrate=44100*0.70,aresample=44100,atempo=0.99,firequalizer=gain_entry='entry(0,0);entry(60,10);entry(250,4)'" -c:a pcm_s24le %~1_slowr.wav
