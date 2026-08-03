from scipy import signal


def bandpass(x, fs, low=20, high=500, order=4):
    sos = signal.butter(order, [low, high], btype="bandpass", fs=fs, output="sos")
    return signal.sosfiltfilt(sos, x)


def notch(x, fs, freq=50, q=30):
    b, a = signal.iirnotch(freq, q, fs)
    return signal.filtfilt(b, a, x)


def bandpass_causal(x, fs, low=20, high=500, order=4):
    sos = signal.butter(order, [low, high], btype="bandpass", fs=fs, output="sos")
    return signal.sosfilt(sos, x)


def notch_causal(x, fs, freq=50, q=30):
    b, a = signal.iirnotch(freq, q, fs)
    return signal.lfilter(b, a, x)


def clean_signal(x, fs):
    """Offline (zero-phase) band-pass + 50/100 Hz notch chain used for batch analysis."""
    filtered = bandpass(x, fs)
    filtered = notch(filtered, fs, 50)
    filtered = notch(filtered, fs, 100)
    return filtered
