"""
Challenge Progress Tracking Utility

This module provides functions to track and update user progress on challenges
during practice sessions.
"""

from datetime import datetime
from typing import Dict, Any, Optional
from app.db.mongodb import user_challenges_collection, challenges_collection


async def update_challenge_progress(
    user_id: str,
    session_metrics: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Update user's progress on active challenges based on session metrics.
    
    Args:
        user_id: User's unique identifier
        session_metrics: Dictionary containing session performance data
            - average_score: Overall session score
            - duration: Session duration in seconds
            - filler_count: Number of filler words detected
            - facial_score: Facial expression score
            - voice_score: Voice quality score
            - combo: Maximum combo achieved
            
    Returns:
        Dictionary with updated challenges and newly completed challenges
    """
    
    # Get all active challenges
    active_challenges = await challenges_collection.find({"active": True}).to_list(100)
    
    # Get user's challenge progress
    user_progress = {}
    user_challenges = await user_challenges_collection.find(
        {"user_id": user_id}
    ).to_list(100)
    
    for uc in user_challenges:
        user_progress[uc["challenge_id"]] = uc
    
    updated_challenges = []
    newly_completed = []
    
    for challenge in active_challenges:
        challenge_id = challenge["challenge_id"]
        requirements = challenge["requirements"]
        
        # Get or create user challenge record
        if challenge_id not in user_progress:
            user_challenge = {
                "user_id": user_id,
                "challenge_id": challenge_id,
                "progress": 0,
                "current_value": 0,
                "target_value": 0,
                "completed": False,
                "claimed": False,
                "started_at": datetime.utcnow()
            }
        else:
            user_challenge = user_progress[challenge_id]
        
        # Skip if already completed
        if user_challenge.get("completed", False):
            continue
        
        # Update progress based on challenge type
        progress_updated = False
        
        # Score-based challenges
        if "min_score" in requirements:
            if session_metrics.get("average_score", 0) >= requirements["min_score"]:
                user_challenge["current_value"] = session_metrics["average_score"]
                user_challenge["target_value"] = requirements["min_score"]
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
        
        # Duration-based challenges
        if "min_duration" in requirements:
            current_duration = user_challenge.get("current_value", 0)
            current_duration += session_metrics.get("duration", 0)
            user_challenge["current_value"] = current_duration
            user_challenge["target_value"] = requirements["min_duration"]
            user_challenge["progress"] = min(100, (current_duration / requirements["min_duration"]) * 100)
            
            if current_duration >= requirements["min_duration"]:
                user_challenge["completed"] = True
            progress_updated = True
        
        # Count-based challenges (e.g., complete N sessions)
        if "count" in requirements:
            current_count = user_challenge.get("current_value", 0) + 1
            user_challenge["current_value"] = current_count
            user_challenge["target_value"] = requirements["count"]
            user_challenge["progress"] = min(100, (current_count / requirements["count"]) * 100)
            
            if current_count >= requirements["count"]:
                user_challenge["completed"] = True
            progress_updated = True
        
        # Filler word challenges
        if "max_filler_words" in requirements:
            if session_metrics.get("filler_count", 999) <= requirements["max_filler_words"]:
                user_challenge["current_value"] = session_metrics["filler_count"]
                user_challenge["target_value"] = requirements["max_filler_words"]
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
        
        # Combo challenges
        if "min_combo" in requirements:
            if session_metrics.get("combo", 0) >= requirements["min_combo"]:
                user_challenge["current_value"] = session_metrics["combo"]
                user_challenge["target_value"] = requirements["min_combo"]
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
        
        # Category score challenges
        if "min_facial_score" in requirements:
            if session_metrics.get("facial_score", 0) >= requirements["min_facial_score"]:
                user_challenge["current_value"] = session_metrics["facial_score"]
                user_challenge["target_value"] = requirements["min_facial_score"]
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
        
        # ==================== MICRO-CHALLENGE EVALUATION ====================
        
        # Eye contact challenges
        if "min_eye_contact_percent" in requirements:
            eye_contact = session_metrics.get("eye_contact_avg", session_metrics.get("eye_contact_score", 0))
            target = requirements["min_eye_contact_percent"]
            if eye_contact >= target:
                user_challenge["current_value"] = eye_contact
                user_challenge["target_value"] = target
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
            else:
                # Partial progress
                user_challenge["current_value"] = eye_contact
                user_challenge["target_value"] = target
                user_challenge["progress"] = min(100, (eye_contact / target) * 100)
                progress_updated = True
        
        # Pacing/WPM challenges - must be within range
        if "target_wpm_min" in requirements and "target_wpm_max" in requirements:
            wpm = session_metrics.get("speech_rate_wpm", 0)
            wpm_min = requirements["target_wpm_min"]
            wpm_max = requirements["target_wpm_max"]
            target_mid = (wpm_min + wpm_max) / 2
            
            if wpm_min <= wpm <= wpm_max:
                # In range - complete
                user_challenge["current_value"] = wpm
                user_challenge["target_value"] = f"{wpm_min}-{wpm_max}"
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
            else:
                # Calculate distance from range
                distance = min(abs(wpm - wpm_min), abs(wpm - wpm_max))
                max_distance = 50  # WPM tolerance for partial credit
                progress = max(0, 100 - (distance / max_distance * 100))
                user_challenge["current_value"] = wpm
                user_challenge["target_value"] = f"{wpm_min}-{wpm_max}"
                user_challenge["progress"] = progress
                progress_updated = True
        
        # Facial confidence challenges
        if "min_facial_confidence" in requirements:
            confidence = session_metrics.get("facial_confidence", session_metrics.get("facial_score", 0))
            target = requirements["min_facial_confidence"]
            if confidence >= target:
                user_challenge["current_value"] = confidence
                user_challenge["target_value"] = target
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
            else:
                user_challenge["current_value"] = confidence
                user_challenge["target_value"] = target
                user_challenge["progress"] = min(100, (confidence / target) * 100)
                progress_updated = True
        
        # Content clarity challenges
        if "min_content_clarity" in requirements:
            clarity = session_metrics.get("content_clarity", session_metrics.get("content_score", 0))
            target = requirements["min_content_clarity"]
            if clarity >= target:
                user_challenge["current_value"] = clarity
                user_challenge["target_value"] = target
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
            else:
                user_challenge["current_value"] = clarity
                user_challenge["target_value"] = target
                user_challenge["progress"] = min(100, (clarity / target) * 100)
                progress_updated = True
        
        # Volume consistency challenges
        if "volume_min_db" in requirements and "volume_max_db" in requirements:
            volume = session_metrics.get("volume_db", session_metrics.get("volume_avg", 0))
            vol_min = requirements["volume_min_db"]
            vol_max = requirements["volume_max_db"]
            
            if vol_min <= volume <= vol_max:
                user_challenge["current_value"] = volume
                user_challenge["target_value"] = f"{vol_min}-{vol_max}"
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
            else:
                distance = min(abs(volume - vol_min), abs(volume - vol_max))
                max_distance = 20  # dB tolerance
                progress = max(0, 100 - (distance / max_distance * 100))
                user_challenge["current_value"] = volume
                user_challenge["target_value"] = f"{vol_min}-{vol_max}"
                user_challenge["progress"] = progress
                progress_updated = True
        
        # Engagement score challenges
        if "min_engagement_score" in requirements:
            engagement = session_metrics.get("engagement_score", 0)
            target = requirements["min_engagement_score"]
            if engagement >= target:
                user_challenge["current_value"] = engagement
                user_challenge["target_value"] = target
                user_challenge["progress"] = 100
                user_challenge["completed"] = True
                progress_updated = True
            else:
                user_challenge["current_value"] = engagement
                user_challenge["target_value"] = target
                user_challenge["progress"] = min(100, (engagement / target) * 100)
                progress_updated = True
        
        # Session count challenges (cumulative)
        if "target_session_count" in requirements:
            current_count = user_challenge.get("current_value", 0) + 1
            target = requirements["target_session_count"]
            user_challenge["current_value"] = current_count
            user_challenge["target_value"] = target
            user_challenge["progress"] = min(100, (current_count / target) * 100)
            if current_count >= target:
                user_challenge["completed"] = True
            progress_updated = True
        
        # Update or insert user challenge
        if progress_updated:
            user_challenge["updated_at"] = datetime.utcnow()
            
            await user_challenges_collection.update_one(
                {
                    "user_id": user_id,
                    "challenge_id": challenge_id
                },
                {"$set": user_challenge},
                upsert=True
            )
            
            updated_challenges.append({
                "challenge_id": challenge_id,
                "title": challenge["title"],
                "progress": user_challenge["progress"],
                "completed": user_challenge["completed"]
            })
            
            if user_challenge["completed"] and not user_challenge.get("claimed", False):
                newly_completed.append({
                    "challenge_id": challenge_id,
                    "title": challenge["title"],
                    "rewards": challenge["rewards"]
                })
    
    return {
        "updated_challenges": updated_challenges,
        "newly_completed": newly_completed,
        "total_updated": len(updated_challenges)
    }


async def get_user_challenge_summary(user_id: str) -> Dict[str, Any]:
    """
    Get a summary of user's challenge progress.
    
    Args:
        user_id: User's unique identifier
        
    Returns:
        Dictionary with challenge statistics
    """
    user_challenges = await user_challenges_collection.find(
        {"user_id": user_id}
    ).to_list(1000)
    
    total = len(user_challenges)
    completed = sum(1 for uc in user_challenges if uc.get("completed", False))
    claimed = sum(1 for uc in user_challenges if uc.get("claimed", False))
    in_progress = total - completed
    
    return {
        "total_challenges": total,
        "completed": completed,
        "claimed": claimed,
        "in_progress": in_progress,
        "completion_rate": (completed / total * 100) if total > 0 else 0
    }
