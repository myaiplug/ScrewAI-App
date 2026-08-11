ffmpeg -i %~1 -vf "tmix=frames=4:weights='1 1 1 1'" -c:v libx264 -preset slow -crf 18 %~2_motion_trail.mp4
