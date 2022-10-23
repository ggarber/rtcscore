const { score } = require('../src/rtc_score');

test('score of audio only stats gives audio only score', () => {
  const scores = score({ audio: {} });
  expect(scores.audio).toBeDefined();
  expect(scores.video).toBeUndefined();
});

test('score of video only stats gives video only score', () => {
  const scores = score({ video: {} });
  expect(scores.audio).toBeUndefined();
  expect(scores.video).toBeDefined();
});

test('score of audio+video stats gives audio+video scores', () => {
  const scores = score({ audio: {}, video: {} });
  expect(scores.audio).toBeDefined();
  expect(scores.video).toBeDefined();
});

test('score of audio is close to 4.5 in perfect conditions', () => {
  const scores = score({ audio: { roundTripTime: 0, bufferDelay: 0 } });
  expect(scores.audio).toBeGreaterThan(4.4);
  expect(scores.audio).toBeLessThanOrEqual(4.5);
});

test('score of audio is 1 in worst conditions', () => {
  const scores = score({
    audio: {
      packetLoss: 100,
    },
  });
  expect(scores.audio).toBeGreaterThanOrEqual(1);
  expect(scores.audio).toBeLessThan(1.1);
});

test('score of audio is 1 with huge delay', () => {
  const scores = score({
    audio: {
      packetLoss: 100,
      roundTripTime: 1000000000,
    },
  });
  expect(scores.audio).toBeGreaterThanOrEqual(1);
  expect(scores.audio).toBeLessThan(1.1);
});

test('score of audio depends on packet loss', () => {
  const scores1 = score({
    audio: {
      packetLoss: 10,
    },
  });
  const scores2 = score({
    audio: {
      packetLoss: 20,
    },
  });
  expect(scores1.audio).toBeGreaterThan(scores2.audio);
});

test('score of audio depends on bitrate', () => {
  const scores1 = score({
    audio: {
      bitrate: 100000,
    },
  });
  const scores2 = score({
    audio: {
      packetLoss: 50000,
    },
  });
  expect(scores1.audio).toBeGreaterThan(scores2.audio);
});

test('score of audio depends on fec', () => {
  const scores1 = score({
    audio: {
      packetLoss: 10,
      fec: true,
    },
  });
  const scores2 = score({
    audio: {
      packetLoss: 10,
      fec: false,
    },
  });
  expect(scores1.audio).toBeGreaterThan(scores2.audio);
});

test('score of audio depends on buffer delay', () => {
  const scores1 = score({
    audio: {
      bufferDelay: 10,
    },
  });
  const scores2 = score({
    audio: {
      bufferDelay: 100,
    },
  });
  expect(scores1.audio).toBeGreaterThan(scores2.audio);
});

test('score of audio is average on control conditions one', () => {
  const scores = score({
    audio: {
      packetLoss: 15,
    },
  });
  expect(scores.audio).toBeGreaterThanOrEqual(2.5);
  expect(scores.audio).toBeLessThan(3);
});

test('score of audio is average on control conditions two', () => {
  const scores = score({
    audio: {
      packetLoss: 30,
    },
  });
  expect(scores.audio).toBeGreaterThanOrEqual(1.5);
  expect(scores.audio).toBeLessThan(2);
});

test('score of audio is average on control conditions three', () => {
  const scores = score({
    audio: {
      packetLoss: 50,
    },
  });
  expect(scores.audio).toBeGreaterThanOrEqual(1);
  expect(scores.audio).toBeLessThan(1.5);
});

test('score of video is 4.5 in perfect conditions', () => {
  const scores = score({
    video: { roundTripTime: 0, bufferTime: 0, bitrate: 10000000 },
  });
  expect(scores.video).toBeGreaterThan(4.9);
  expect(scores.video).toBeLessThanOrEqual(5);
});

test('score of video is 1 in worst bitrate conditions', () => {
  const scores = score({
    video: {
      bitrate: 1000,
    },
  });
  expect(scores.video).toBeGreaterThanOrEqual(1);
  expect(scores.video).toBeLessThan(1.1);
});

test('score of video is 1 in worst framerate conditions', () => {
  const scores = score({
    video: {
      bitrate: 10000000,
      frameRate: 1,
      expectedFrameRate: 30,
    },
  });
  expect(scores.video).toBe(1);
});

test('score of video is 1 if no framerate is received', () => {
  const scores = score({
    video: {
      bitrate: 100000,
      frameRate: 0,
    },
  });
  expect(scores.video).toBe(1);
});

test('score is average on average bitrate conditions', () => {
  const scores = score({
    video: {
      bitrate: 600000,
    },
  });

  expect(scores.video).toBeGreaterThan(3);
  expect(scores.video).toBeLessThan(4);
});

test('score is not good on low bitrate conditions', () => {
  const scores = score({
    video: {
      bitrate: 200000,
      frameRate: 25,
    },
  });

  expect(scores.video).toBeGreaterThan(2.5);
  expect(scores.video).toBeLessThan(3.5);
});

test('score is not good on average bitrate conditions but low framerate', () => {
  const scores = score({
    video: {
      bitrate: 500000,
      frameRate: 8,
      expectedFrameRate: 25,
    },
  });

  expect(scores.video).toBeGreaterThan(2);
  expect(scores.video).toBeLessThan(3);
});

test('score is average on average framerate conditions', () => {
  const scores = score({
    video: {
      bitrate: 600000,
      frameRate: 25,
      expectedFrameRate: 30,
    },
  });

  expect(scores.video).toBeGreaterThan(3);
  expect(scores.video).toBeLessThan(4);
});

test('score is average on control conditions one', () => {
  const scores = score({
    video: {
      bitrate: 450000,
      frameRate: 20,
      width: 640,
      height: 480,
    },
  });

  expect(scores.video).toBeGreaterThan(3.5);
  expect(scores.video).toBeLessThan(4.5);
});

test('score is average on control conditions two', () => {
  const scores = score({
    video: {
      bitrate: 600000,
      frameRate: 20,
      width: 640,
      height: 480,
    },
  });

  expect(scores.video).toBeGreaterThan(3.5);
  expect(scores.video).toBeLessThan(4.5);
});

test('score of video depends on bitrate', () => {
  const scores1 = score({
    video: {
      bitrate: 200000,
    },
  });
  const scores2 = score({
    video: {
      bitrate: 100000,
    },
  });
  expect(scores1.video).toBeGreaterThan(scores2.video);
});

test('score of video depends on codec', () => {
  const scores1 = score({
    video: {
      bitrate: 200000,
      codec: 'vp9',
    },
  });
  const scores2 = score({
    video: {
      bitrate: 200000,
      vodec: 'vp8',
    },
  });
  expect(scores1.video).toBeGreaterThan(scores2.video);
});

test('score of video depends on framerate', () => {
  const scores1 = score({
    video: {
      bitrate: 200000,
      frameRate: 15,
      expectedFrameRate: 15,
    },
  });
  const scores2 = score({
    video: {
      bitrate: 200000,
      frameRate: 15,
      expectedFrameRate: 30,
    },
  });
  expect(scores1.video).toBeGreaterThan(scores2.video);
});

test('score of video depends on resolution', () => {
  const scores1 = score({
    video: {
      bitrate: 200000,
      width: 100,
      height: 100,
    },
  });
  const scores2 = score({
    video: {
      bitrate: 200000,
      width: 640,
      height: 480,
    },
  });
  expect(scores1.video).toBeGreaterThan(scores2.video);
});

test('score of video is 1 for 0 framerate', () => {
  const scores = score({
    video: {
      bitrate: 200000,
      expectedFrameRate: 0,
      frameRate: 0,
    },
  });

  expect(scores.video).toBeGreaterThanOrEqual(1);
  expect(scores.video).toBeLessThan(1.1);
});
