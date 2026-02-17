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
