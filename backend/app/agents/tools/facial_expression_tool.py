import cv2
import numpy as np
import mediapipe as mp
from agno.tools import tool
import json

# Try to import DeepFace for richer emotion detection, but fall back gracefully
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False

def log_before_call(fc):
    """Pre-hook function that runs before the tool execution"""
    print(f"About to call function with arguments: {fc.arguments}")

def log_after_call(fc):
    """Post-hook function that runs after the tool execution"""
    print(f"Function call completed with result: {fc.result}")

def _analyze_facial_expressions_impl(video_path: str) -> dict:
    """
    Internal implementation of facial expressions analysis.
    """
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1)
    cap = cv2.VideoCapture(video_path)

    emotion_timeline = []
    eye_contact_count = 0
    smile_count = 0
    frame_count = 0
    processed_frames_with_faces = 0
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    # Process every nth frame for performance optimization
    frame_interval = 2  # Reduced from 5 to capture more frames

    # Store baseline eye opening from first detected face (for normalized comparison)
    baseline_eye_opening = None
    eye_opening_values = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % frame_interval != 0:
            continue

        # Resize frame for faster processing
        frame = cv2.resize(frame, (640, 480))
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)

        if results.multi_face_landmarks:
            processed_frames_with_faces += 1
            for face_landmarks in results.multi_face_landmarks:
                # Extract landmarks
                landmarks = face_landmarks.landmark

                # Convert landmarks to pixel coordinates
                h, w, _ = frame.shape
                landmark_coords = [(int(lm.x * w), int(lm.y * h)) for lm in landmarks]

                # Emotion Detection using DeepFace & Smile Detection
                try:
                    if DEEPFACE_AVAILABLE:
                        analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                        emotion = analysis[0]['dominant_emotion']
                    else:
                        # Heuristic fallback: estimate smile from mouth openness
                        # Mouth landmarks: 13 (upper lip), 14 (lower lip)
                        upper_lip = landmark_coords[13]
                        lower_lip = landmark_coords[14]
                        mouth_open = np.linalg.norm(np.array(upper_lip) - np.array(lower_lip))
                        emotion = "happy" if mouth_open > 8 else "neutral"

                    if emotion == "happy":
                        smile_count += 1

                    timestamp = frame_count / fps
                    # convert timestamp into seconds
                    timestamp = round(timestamp, 2)
                    emotion_timeline.append({"timestamp": timestamp, "emotion": emotion})
                except Exception as e:
                    print(f"Error analyzing frame: {e}")
                    continue

                # Engagement Metric: Eye contact estimation
                # Using eye landmarks: 159 (left eye upper lid), 145 (left eye lower lid), 386 (right eye upper lid), 374 (right eye lower lid)
                left_eye_upper_lid = landmark_coords[159]
                left_eye_lower_lid = landmark_coords[145]
                right_eye_upper_lid = landmark_coords[386]
                right_eye_lower_lid = landmark_coords[374]

                left_eye_opening = np.linalg.norm(np.array(left_eye_upper_lid) - np.array(left_eye_lower_lid))
                right_eye_opening = np.linalg.norm(np.array(right_eye_upper_lid) - np.array(right_eye_lower_lid))

                eye_opening_avg = (left_eye_opening + right_eye_opening) / 2
                eye_opening_values.append(eye_opening_avg)

    cap.release()
    face_mesh.close()

    # Calculate baseline and detect eye contact with normalized approach
    if eye_opening_values:
        baseline_eye_opening = np.mean(eye_opening_values)
        std_eye_opening = np.std(eye_opening_values)
        eye_contact_threshold = baseline_eye_opening - 0.5 * std_eye_opening
        print(f"DEBUG: Baseline eye opening: {baseline_eye_opening:.2f}, Threshold: {eye_contact_threshold:.2f}")
    else:
        eye_contact_threshold = 10  # Fallback threshold if no data

    # Re-process to count eye contact with proper threshold
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    face_mesh_second = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1)
    
    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            if frame_count % frame_interval != 0:
                continue
            
            frame = cv2.resize(frame, (640, 480))
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh_second.process(rgb_frame)
            
            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    landmarks = face_landmarks.landmark
                    h, w, _ = frame.shape
                    landmark_coords = [(int(lm.x * w), int(lm.y * h)) for lm in landmarks]
                    
                    left_eye_upper_lid = landmark_coords[159]
                    left_eye_lower_lid = landmark_coords[145]
                    right_eye_upper_lid = landmark_coords[386]
                    right_eye_lower_lid = landmark_coords[374]
                    
                    left_eye_opening = np.linalg.norm(np.array(left_eye_upper_lid) - np.array(left_eye_lower_lid))
                    right_eye_opening = np.linalg.norm(np.array(right_eye_upper_lid) - np.array(right_eye_lower_lid))
                    eye_opening_avg = (left_eye_opening + right_eye_opening) / 2
                    
                    if eye_opening_avg >= eye_contact_threshold:
                        eye_contact_count += 1
    finally:
        cap.release()
        face_mesh_second.close()

    # Normalize frequencies to 0-100 percentage
    if processed_frames_with_faces == 0:
        processed_frames_with_faces = 1  # Avoid division by zero

    eye_contact_percentage = (eye_contact_count / processed_frames_with_faces) * 100
    smile_percentage = (smile_count / processed_frames_with_faces) * 100

    return {
        "emotion_timeline": emotion_timeline,
        "engagement_metrics": {
            "eye_contact_frequency": round(eye_contact_percentage, 2),
            "smile_frequency": round(smile_percentage, 2)
        }
    }

@tool(
    name="analyze_facial_expressions",
    description="Analyzes facial expressions to detect emotions and engagement.",
    show_result=True,
    stop_after_tool_call=True,
    pre_hook=log_before_call,
    post_hook=log_after_call,
    cache_results=False,
    cache_dir="/tmp/agno_cache",
    cache_ttl=3600
)
def analyze_facial_expressions(video_path: str) -> dict:
    """
    Analyzes facial expressions in a video to detect emotions and engagement.

    Args:
        video_path: The path to the video file.

    Returns:
        A dictionary containing the emotion timeline and engagement metrics.
    """
    return _analyze_facial_expressions_impl(video_path)
