import matplotlib

matplotlib.use("Agg")  # no display on the server

import numpy as np
from matplotlib import pyplot as plt
from scipy import signal


def render_report_figure(title, fs, x_filtered, analysis, window_sec=8):
    """Builds the clinician-facing PCG report figure (signal+envelope+S1/S2 on
    top, spectrogram below) from a precomputed `analyze_recording()` result."""
    envelope = analysis["envelope"]
    peaks = analysis["peaks"]
    labels = analysis["labels"]

    window = slice(0, int(window_sec * fs))
    t_local = np.arange(len(x_filtered)) / fs
    s1_peaks = peaks[labels == "S1"]
    s2_peaks = peaks[labels == "S2"]
    s1_in_window = s1_peaks[s1_peaks < window.stop]
    s2_in_window = s2_peaks[s2_peaks < window.stop]

    f, t_spec, Sxx = signal.spectrogram(x_filtered, fs, window="hann", nperseg=512, noverlap=460, scaling="density")
    Sxx_db = 10 * np.log10(Sxx + 1e-12)
    freq_mask = f <= 500

    fig, axes = plt.subplots(2, 1, figsize=(11, 6), sharex=True, gridspec_kw={"height_ratios": [1.1, 1]})

    ax0 = axes[0]
    ax0.plot(t_local[window], x_filtered[window], color="#8c8b86", linewidth=0.6, label="Filtrelenmiş sinyal")
    ax0.plot(
        t_local[window],
        envelope[window] * np.max(np.abs(x_filtered[window])),
        color="#2a78d6",
        linewidth=1.2,
        label="Zarf",
    )
    ax0.scatter(t_local[s1_in_window], x_filtered[s1_in_window], color="#008300", s=45, zorder=5, label="S1")
    ax0.scatter(
        t_local[s2_in_window], x_filtered[s2_in_window], color="#eb6834", s=45, zorder=5, marker="^", label="S2"
    )
    ax0.set_ylabel("Genlik")
    ax0.spines[["top", "right"]].set_visible(False)
    ax0.legend(frameon=False, ncol=4, loc="upper center", bbox_to_anchor=(0.5, 1.28))

    ax1 = axes[1]
    ax1.pcolormesh(t_spec, f[freq_mask], Sxx_db[freq_mask], shading="gouraud", cmap="magma")
    ax1.set_ylim(0, 500)
    ax1.set_xlim(0, window_sec)
    ax1.set_ylabel("Frekans (Hz)")
    ax1.set_xlabel("Zaman (s)")

    fig.suptitle(
        f"PCG Raporu — {title}\n"
        f"Kalp hızı: {analysis['heart_rate_bpm']:.1f} bpm   "
        f"Sistol: {analysis['systole_ms']:.0f} ms   Diyastol: {analysis['diastole_ms']:.0f} ms",
        y=1.06,
        fontsize=11,
    )
    fig.tight_layout()
    return fig
