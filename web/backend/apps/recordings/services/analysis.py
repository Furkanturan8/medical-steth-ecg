from io import BytesIO

import numpy as np
from django.core.files.base import ContentFile
from django.utils import timezone
from matplotlib import pyplot as plt
from scipy.io import wavfile as wavfile_out

from apps.recordings.models import AnalysisResult
from signal_processing.src.pipeline import analyze_wav_file
from signal_processing.src.report import render_report_figure


def run_analysis(recording):
    analysis, _ = AnalysisResult.objects.get_or_create(recording=recording)
    try:
        result = analyze_wav_file(recording.audio_file.path)

        recording.sample_rate_hz = result["fs"]
        recording.duration_sec = len(result["x_filtered"]) / result["fs"]
        recording.save(update_fields=["sample_rate_hz", "duration_sec"])

        analysis.heart_rate_bpm = result["heart_rate_bpm"]
        analysis.mean_systole_ms = result["systole_ms"]
        analysis.mean_diastole_ms = result["diastole_ms"]
        analysis.s1_timestamps_sec = result["s1_timestamps_sec"]
        analysis.s2_timestamps_sec = result["s2_timestamps_sec"]

        fig = render_report_figure(
            recording.original_filename or recording.audio_file.name,
            result["fs"],
            result["x_filtered"],
            result,
        )
        image_buf = BytesIO()
        fig.savefig(image_buf, format="png", dpi=130, bbox_inches="tight")
        plt.close(fig)
        analysis.report_image.save(f"recording_{recording.id}.png", ContentFile(image_buf.getvalue()), save=False)

        x_clipped = np.clip(result["x_filtered"], -1.0, 1.0)
        x_int16 = (x_clipped * 32767).astype(np.int16)
        audio_buf = BytesIO()
        wavfile_out.write(audio_buf, result["fs"], x_int16)
        analysis.filtered_audio_file.save(
            f"recording_{recording.id}_filtered.wav", ContentFile(audio_buf.getvalue()), save=False
        )

        analysis.status = AnalysisResult.Status.DONE
        analysis.error_message = ""
        analysis.computed_at = timezone.now()
    except Exception as exc:
        analysis.status = AnalysisResult.Status.FAILED
        analysis.error_message = str(exc)

    analysis.save()
    return analysis
