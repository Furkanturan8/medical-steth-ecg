import numpy as np

from .envelope import compute_envelope, detect_peaks


def label_s1_s2(peaks, fs):
    # Her aralık, önceki tepelerden bağımsız olarak kendi başına medyana göre
    # sınıflandırılır — tek bir kaçan/fazladan tepe tüm kaydın etiketlerini
    # kaydırmasın diye (bkz. docs/notes/teorik_notlar.md).
    intervals = np.diff(peaks) / fs
    if len(intervals) < 1:
        return ["S1"] * len(peaks)
    median = np.median(intervals)
    labels = ["S1" if interval < median else "S2" for interval in intervals]
    labels.append("S2" if intervals[-1] < median else "S1")
    return labels


def analyze_recording(x_filtered, fs):
    """Runs envelope + S1/S2 segmentation and returns heart-rate metrics.

    Returns a dict with: envelope, peaks, labels, heart_rate_bpm,
    systole_ms, diastole_ms, s1_timestamps_sec, s2_timestamps_sec.
    """
    envelope = compute_envelope(x_filtered, fs)
    peaks = detect_peaks(envelope, fs)
    labels = np.array(label_s1_s2(peaks, fs))

    intervals = np.diff(peaks) / fs
    median_interval = np.median(intervals)
    systole_mean = intervals[intervals < median_interval].mean()
    diastole_mean = intervals[intervals >= median_interval].mean()
    heart_rate_bpm = 60 / (systole_mean + diastole_mean)

    s1_peaks = peaks[labels == "S1"]
    s2_peaks = peaks[labels == "S2"]

    return {
        "envelope": envelope,
        "peaks": peaks,
        "labels": labels,
        "heart_rate_bpm": heart_rate_bpm,
        "systole_ms": systole_mean * 1000,
        "diastole_ms": diastole_mean * 1000,
        "s1_timestamps_sec": (s1_peaks / fs).tolist(),
        "s2_timestamps_sec": (s2_peaks / fs).tolist(),
    }
