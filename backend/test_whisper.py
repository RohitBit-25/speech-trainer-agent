
import time
import numpy as np
from faster_whisper import WhisperModel

def test_whisper():
    print("Loading model...")
    start = time.time()
    # Use 'tiny' for speed test. 'base' is better balance.
    model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
    print(f"Model loaded in {time.time() - start:.2f}s")
    
    # Generate 3 seconds of dummy audio (simulated silence/noise)
    # 16kHz sample rate
    audio = np.random.uniform(-0.1, 0.1, 16000 * 3).astype(np.float32)
    
    print("Transcribing 3s of noise...")
    start = time.time()
    segments, info = model.transcribe(audio, beam_size=1)
    
    for segment in segments:
        print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))
        
    print(f"Transcription took {time.time() - start:.2f}s")

if __name__ == "__main__":
    test_whisper()
