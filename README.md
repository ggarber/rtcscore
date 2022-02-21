# RTC MOS

Library to calculate a Mean Opinion Score (MOS) from 1 to 5 for audio and video real time communications.

v0 (Current): The algorithm is based on a modified E-Model approach for audio and logarithmic regression for video based on some limited collected data.

v1 (Next): The algorithm is trained with the data collected during the previous phase.


The library includes 2 APIs (score and report).   The former one is used to get a score for specific audio and video parameters of the communication and the later allows the applications to report the score assigned manually by users so that the data can be anonymously collected and used for training in next interations.