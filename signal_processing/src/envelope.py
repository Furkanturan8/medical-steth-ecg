import numpy as np
from scipy import signal


def compute_envelope(x, fs, lowpass_hz=20, order=4):
    analytic = signal.hilbert(x)
    amplitude_envelope = np.abs(analytic)
    sos = signal.butter(order, lowpass_hz, btype="low", fs=fs, output="sos")
    smooth = signal.sosfiltfilt(sos, amplitude_envelope)
    smooth = np.clip(smooth, 0, None)
    return smooth / smooth.max()


def compute_envelope_lightweight(x, fs, window_ms=30):
    window = max(1, int(fs * window_ms / 1000))
    kernel = np.ones(window) / window
    smooth = np.convolve(np.abs(x), kernel, mode="same")
    return smooth / smooth.max()


def detect_peaks(envelope, fs, min_distance_ms=250, height_ratio=0.15):
    min_distance = int(fs * min_distance_ms / 1000)
    peaks, _ = signal.find_peaks(envelope, distance=min_distance, height=height_ratio)
    return peaks
