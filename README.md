# RTC SCORE

Library to calculate a Mean Opinion Score (MOS) from 1 to 5 for audio and video real time communications.

The current version of the algorithm is based on a modified E-Model approach for audio and logarithmic regression for video based on some limited collected data.  The E-Model is a well known standard and the adaptations for wideband and opus codecs have been taken into account.

## How to use it

### Install

The library can be installed as an npm package dependency in your project:

```
npm install rtcscore
```

Given the simplicity of the code in some cases it can be more convenient to copy the code from `src/score.js` even if that prevents the ability to use npm to get upgrades for new versions of the library.

### How to calculate an audio/video score for a stream

The library expose a single API `score()` to generate audio and video scores given some input parameters of the communication.

For example a very basic example could be to generate the score for a give audio packet loss and video bitrate:

```
score({
    audio: {
        packetLoss: 2,     // 2%
    },
    video: {
        bitrate: 200000,   // 200kpbs
    }
})
```

For audio the relevant input parameters are these ones:
* packetLoss (0-100%): The percentage of audio packets lost.
* bitrate (0-200000 bps): The bitrate used for the audio transmission.  Higher bitrates provides better quality. 
* roundTripTime (milliseconds): The roundTripTime defines the degradation of the experience based on the network delay.
* bufferDelay (milliseconds): The bufferDelay defines the degradation of the experience based on the delay introudced in reception that in most of the cases will be based on the jitter of the network.
* fec (boolean): Defines if opus forward error correction was enabled or not to estimate the impact of packet loss in the quality of the experience.
* dtx (boolean): Defines if opus discontinuous transmission was enabled or not to ignore the bitrate in that case and also include an small additional degradation in the calculations in this case.

The audio input parameter with more impact in the algorithm is the packetLoss and should be included in most of the cases while the others are less critical to estimate the user experience.  The recommendation is to pass at least packetLoss and roundTripTime if possible.

For video the relevant input parameters are these ones:
* packetLoss (0-100%): The percentage of video packets lost.
* bitrate (0-200000 bps): The bitrate used for the video transmission.  Higher bitrates provides better quality. 
* roundTripTime (milliseconds): The roundTripTime defines the degradation of the experience based on the network delay.
* bufferDelay (milliseconds): The bufferDelay defines the degradation of the experience based on the delay introudced in reception that in most of the cases will be based on the jitter of the network.
* codec (VP8 / VP9 / H264): The more modern codecs can provide better quality for the same amount of bitrate.  The current version of the algorithm considers VP8 and H264 the same and assumes a ~20% improvement of encoding efficiency in case of VP9.
* width / height (pixels): Resolution of the video being received
* expectedWidth / expectedHeight (pixels): Resolution of the rendering window that is the ideal resolution that we would like to receive to not have to scale the video.  If this parameter is not known the algorithm assumes that the width and height of the received frames matches the expected resolution of the rendering window.
* frameRate (frames per second): Frames received per second.  They are used to estimate the quality of the video.   A video at 5 fps requires less bitrate than a video at 30 fps for the same quality.
* expectedFrameRate (frames per second): Frames per second that are expected to be receive.  This should usually be the frameRate of the source video (typically 30 fps).  If this parameter is not known the algorithm assumes that the frameRate received matches the expected framerate.

The updated list of audio and video parameters can be checked in [the source code header] (https://github.com/ggarber/rtcscore/blob/develop/src/rtc_mos.js).

### How to aggregate the scores of multiple streams or multiple periods of time

In a typical scenario the quality scores are calculated every X seconds (f.e. every 30 seconds) and aggregated at the end of the call to provide a single score per user.  Having that unique final score requires a temporal aggregation of the scores as well as an aggregation of the scores of multiple streams in multipary use cases.

This library doesn't provide any support to do those aggregations but doesn't impose any limitation either.   The most basic aggregation is the naive approach of averaging the scores but any other strategy like taking the worse 10% percentile can be implemented and provide reasonable results.
