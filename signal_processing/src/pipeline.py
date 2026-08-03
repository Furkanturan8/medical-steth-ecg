import numpy as np
from scipy.io import wavfile

from .filters import clean_signal
from .segmentation import analyze_recording


def analyze_wav_file(path):
    """Loads a WAV file and runs the validated filter + S1/S2 pipeline.

    Returns the `analyze_recording()` dict plus `fs` and `x_filtered`, ready
    to persist (AnalysisResult fields) or hand to `report.render_report_figure`.
    """
    fs, raw = wavfile.read(path)
    x = raw.astype(np.float64)
    x /= np.max(np.abs(x))

    x_filtered = clean_signal(x, fs)
    result = analyze_recording(x_filtered, fs)
    result["fs"] = fs
    result["x_filtered"] = x_filtered
    return result
