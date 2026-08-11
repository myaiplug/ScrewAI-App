set "INPUT_FILE=%~1"
set "INPUT_BASENAME=%~n1"
set "BATCH_NAME=%~n0"
set "OUTPUT_FILE=%INPUT_BASENAME%_ScrewAI_%BATCH_NAME%.mp3"

ffmpeg -i %INPUT_FILE% "-filter:a acompressor=threshold=0.5:ratio=5,aecho=0.9:0.9:100:0.3,stereotools=mlev=1.8 %INPUT_FILE%_%BATCH_NAME%.mp3"
