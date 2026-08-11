ffmpeg -i %~1 -af "alimiter=limit=0.95:attack=5:release=50" %~2_alimiter.wav
