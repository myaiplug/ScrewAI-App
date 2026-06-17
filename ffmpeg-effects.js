// FFmpeg Chained Effects for High-Quality Output Remixes

const ffmpegEffects = {
  mp3: [
    {
      name: "Bass Boost (MP3)",
      command: "-af 'volume=1.5, bass=g=10'"
    },
    {
      name: "Treble Boost + Delay (MP3)",
      command: "-af 'treble=g=5, aecho=0.8:0.88:60:0.4'"
    },
    {
      name: "Chorus Effect (MP3)",
      command: "-af 'chorus=0.5:0.9:50:0.4:0.25:2'"
    },
    {
      name: "Flanger Effect (MP3)",
      command: "-af 'flanger'"
    },
    {
      name: "Tempo Change (MP3)",
      command: "-af 'atempo=1.25, asetrate=44100*1.25'"
    },
    {
      name: "Highpass and Lowpass Filter (MP3)",
      command: "-af 'highpass=f=200, lowpass=f=3000'"
    },
    {
      name: "Silence Removal (MP3)",
      command: "-af 'silenceremove=start_periods=1:start_duration=1:start_threshold=-50dB'"
    },
    {
      name: "Compressor (MP3)",
      command: "-af 'compand=attacks=0.3:decays=0.8:points=-80/-90|-20/-20|0/-10'"
    },
    {
      name: "Stereo Tools (MP3)",
      command: "-af 'stereotools=mode=lr2ms'"
    },
    {
      name: "Dynamic Audio Normalization (MP3)",
      command: "-af 'dynaudnorm'"
    },
    {
      name: "Crystalizer (MP3)",
      command: "-af 'crystalizer=20'"
    },
    {
      name: "Vibrato Effect (MP3)",
      command: "-af 'vibrato=f=5'"
    }
  ],
  wav: [
    {
      name: "Volume Boost + Bass Boost (WAV)",
      command: "-af 'volume=2.0, bass=g=15'"
    },
    {
      name: "Treble Boost + Delay (WAV)",
      command: "-af 'treble=g=8, aecho=0.9:0.9:100:0.3'"
    },
    {
      name: "Chorus Effect (WAV)",
      command: "-af 'chorus=0.7:0.8:60:0.3:0.2:1.5'"
    },
    {
      name: "Flanger Effect (WAV)",
      command: "-af 'flanger=delay=10'"
    },
    {
      name: "Tempo Change (WAV)",
      command: "-af 'atempo=0.8, asetrate=44100*0.8'"
    },
    {
      name: "Highpass and Lowpass Filter (WAV)",
      command: "-af 'highpass=f=300, lowpass=f=2500'"
    },
    {
      name: "Silence Removal (WAV)",
      command: "-af 'silenceremove=start_periods=1:start_duration=0.5:start_threshold=-40dB'"
    },
    {
      name: "Compressor (WAV)",
      command: "-af 'compand=attacks=0.2:decays=0.7:points=-80/-85|-15/-15|0/-5'"
    },
    {
      name: "Stereo Tools (WAV)",
      command: "-af 'stereotools=mode=ms2lr'"
    },
    {
      name: "Dynamic Audio Normalization (WAV)",
      command: "-af 'dynaudnorm=f=200'"
    },
    {
      name: "Crystalizer (WAV)",
      command: "-af 'crystalizer=25'"
    },
    {
      name: "Vibrato Effect (WAV)",
      command: "-af 'vibrato=f=7'"
    }
  ]
};

module.exports = ffmpegEffects;