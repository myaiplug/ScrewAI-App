const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const ffmpegDir = path.join(projectRoot, 'build-resources', 'ffmpeg');

const ffmpegCandidates = [
  process.env.SCREWAI_FFMPEG_PATH,
  process.env.FFMPEG_PATH,
  'C:\\ffmpeg\\bin\\ffmpeg.exe'
].filter(Boolean);

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyIfExists(sourcePath) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return false;
  }

  const targetPath = path.join(ffmpegDir, path.basename(sourcePath));
  fs.copyFileSync(sourcePath, targetPath);
  return true;
}

ensureDir(ffmpegDir);

const ffmpegSource = ffmpegCandidates.find(candidate => fs.existsSync(candidate));

if (!ffmpegSource) {
  console.error('FFmpeg binary not found. Expected one of:');
  for (const candidate of ffmpegCandidates) {
    console.error(`  - ${candidate}`);
  }
  process.exit(1);
}

copyIfExists(ffmpegSource);

const siblingTools = ['ffprobe.exe', 'ffplay.exe'];
for (const tool of siblingTools) {
  copyIfExists(path.join(path.dirname(ffmpegSource), tool));
}

console.log(`Bundled FFmpeg from ${ffmpegSource}`);