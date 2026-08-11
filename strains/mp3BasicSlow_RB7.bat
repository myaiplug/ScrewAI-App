ffmpeg -i %~1 -af "rubberband=tempo=0.7" -c:a pcm_s24le %~1_RB-07.mp3
