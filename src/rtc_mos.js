/*
 * Stats
 * packetLoss: 0-100%
 * bitrate: bps
 * roundTripTime: ms
 * bufferDelay: ms
 * codec: opus / vp8 / vp9 / h264 (only used for video)
 * fec: boolean (ony used for audio)
 * dtx: boolean (ony used for audio)
 * qp: number (not used yet)
 * keyFrames: number (not used yet)
 * width: number; Resolution of the video received
 * expectedWidth: number; Resolution of the rendering widget
 * height: number; Resolution of the video received
 * expectedHeight: number; Resolution of the rendering widget
 * frameRate: number; FrameRate of the video received
 * expectedFrameRate: number; FrameRate of the video source
 */
function score(stats) {
  const scores = {};
  const { audio, video } = normalize(stats);
  if (audio) {
    // Audio MOS calculation is based on E-Model algorithm
    // Assume 20 packetization delay
    const delay = 20 + audio.bufferDelay + audio.roundTripTime;
    const pl = audio.packetLoss;
    const R0 = 100;
    // Ignore audio bitrate in dtx mode
    const Ie = audio.dtx
      ? 8
      : audio.bitrate
      ? clamp(55 - 4.6 * Math.log(audio.bitrate), 0, 30)
      : 6;
    const Bpl = audio.fec ? 20 : 10;
    const Ipl = Ie + (100 - Ie) * (pl / (pl + Bpl));
    const Id =
      delay * 0.03 + (delay > 150 ? 0.1 * Math.pow(delay - 150, 2) : 0);
    const R = R0 - Ipl - Id;
    const MOS = 1 + 0.035 * R + (R * (R - 60) * (100 - R) * 7) / 1000000;
    scores.audio = clamp(Math.round(MOS * 100) / 100, 1, 5);
  }
  if (video) {
    const pixels = video.expectedWidth * video.expectedHeight;
    const codecFactor = video.codec === 'vp9' ? 1.2 : 1.0;
    const delay = video.bufferDelay + video.roundTripTime;
    // These parameters are generated with a logaritmic regression
    // on some very limited test data for now
    // They are based on the bits per pixel per frame (bPPPF)
    const bPPPF = (codecFactor * video.bitrate) / pixels / video.frameRate;
    const base = clamp(0.56 * Math.log(bPPPF) + 5.36, 1, 5);
    const MOS =
      base -
      1.9 * Math.log(video.expectedFrameRate / video.frameRate) -
      delay * 0.002;
    scores.video = clamp(Math.round(MOS * 100) / 100, 1, 5);
  }
  return scores;
}

function report({ stats, score, audioScore, videoScore }) {
  const url = 'https://still-sea-10081.herokuapp.com/';
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ stats, score, audioScore, videoScore }),
  });
}

function normalize(stats) {
  return {
    audio: stats.audio
      ? {
          packetLoss: 0,
          bufferDelay: 50,
          roundTripTime: 50,
          fec: true,
          ...stats.audio,
        }
      : undefined,
    video: stats.video
      ? {
          packetLoss: 0,
          bufferDelay: 0,
          roundTripTime: 50,
          fec: false,
          expectedHeight: stats.video.height || 640,
          expectedWidth: stats.video.width || 480,
          frameRate: stats.video.expectedFrameRate || 30,
          expectedFrameRate: stats.video.frameRate || 30,
          ...stats.video,
        }
      : undefined,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

module.exports = { score, report };
