"""
Difficulty configurations for game mechanics
"""

DIFFICULTY_CONFIGS = {
    "beginner": {
        "level": "beginner",
        "target_scores": {
            "facial": 60,
            "voice": 60,
            "content": 60,
            "overall": 60
        },
        "time_limit": None,  # No time limit
        "filler_word_tolerance": 15,  # Allow up to 15 filler words
        "pace_range": (100, 180),  # 100-180 WPM
        "multiplier_base": 1.0,
        "xp_multiplier": 1.0,
        "unlock_level": 1,
        "description": "Perfect for getting started. No time pressure, forgiving scoring.",
        "color": "#10B981"  # Green
    },
    "intermediate": {
        "level": "intermediate",
        "target_scores": {
            "facial": 75,
            "voice": 75,
            "content": 75,
            "overall": 75
        },
        "time_limit": 300,  # 5 minutes
        "filler_word_tolerance": 8,  # Allow up to 8 filler words
        "pace_range": (120, 160),  # 120-160 WPM
        "multiplier_base": 1.5,
        "xp_multiplier": 1.5,
        "unlock_level": 3,
        "description": "Balanced challenge with time limits. Earn 1.5x XP and score.",
        "color": "#F59E0B"  # Orange
    },
    "expert": {
        "level": "expert",
        "target_scores": {
            "facial": 85,
            "voice": 85,
            "content": 85,
            "overall": 85
        },
        "time_limit": 180,  # 3 minutes
        "filler_word_tolerance": 3,  # Allow up to 3 filler words
        "pace_range": (130, 150),  # 130-150 WPM (optimal range)
        "multiplier_base": 2.0,
        "xp_multiplier": 2.5,
        "unlock_level": 7,
        "description": "Maximum challenge for masters. Strict requirements, 2.5x XP!",
        "color": "#EF4444"  # Red
    }
}

PENALTY_RULES = {
    "excessive_filler_words": -10,  # Per word over limit
    "poor_eye_contact": -5,         # Per 10s below 60% threshold
    "monotone_voice": -15,          # Pitch variation < 20%
    "too_fast": -10,                # WPM > max for difficulty
    "too_slow": -10,                # WPM < min for difficulty
    "low_volume": -5,               # Volume < -30dB
    "incomplete_session": -50,      # Quit before completing
    "poor_engagement": -8,          # Engagement < 50%
}

def get_difficulty_config(difficulty: str) -> dict:
    """Get configuration for a difficulty level"""
    return DIFFICULTY_CONFIGS.get(difficulty, DIFFICULTY_CONFIGS["intermediate"])

def calculate_score_with_multiplier(base_score: float, metrics: dict, difficulty: str) -> dict:
    """
    Calculate final score with multipliers applied
    
    Args:
        base_score: Base score before multipliers
        metrics: Dict containing combo_count, streak_days, category_scores
        difficulty: Difficulty level
    
    Returns:
        Dict with final_score, multiplier, breakdown
    """
    config = get_difficulty_config(difficulty)
    multiplier = config["multiplier_base"]
    breakdown = {"base": config["multiplier_base"]}
    
    # Combo multiplier (consecutive good performances)
    combo_count = metrics.get("combo_count", 0)
    if combo_count > 5:
        combo_bonus = 0.1 * (combo_count // 5)
        multiplier += combo_bonus
        breakdown["combo"] = combo_bonus
    
    # Streak multiplier (days in a row)
    streak_days = metrics.get("streak_days", 0)
    if streak_days > 3:
        streak_bonus = 0.05 * streak_days
        multiplier += streak_bonus
        breakdown["streak"] = streak_bonus
    
    # Perfect performance bonus
    category_scores = metrics.get("category_scores", {})
    if all(score > 90 for score in category_scores.values()):
        multiplier += 0.5
        breakdown["perfect"] = 0.5
    
    # Cap multiplier at 5x
    multiplier = min(multiplier, 5.0)
    
    final_score = base_score * multiplier
    
    return {
        "base_score": base_score,
        "multiplier": multiplier,
        "final_score": final_score,
        "breakdown": breakdown
    }

def apply_penalties(metrics: dict, difficulty: str) -> dict:
    """
    Apply penalties based on performance metrics
    
    Args:
        metrics: Performance metrics
        difficulty: Difficulty level
    
    Returns:
        Dict with penalties list, total_penalty, adjusted_score
    """
    config = get_difficulty_config(difficulty)
    penalties = []
    total_penalty = 0
    
    # Check filler words
    filler_count = metrics.get("filler_count", 0)
    if filler_count > config["filler_word_tolerance"]:
        excess = filler_count - config["filler_word_tolerance"]
        penalty = excess * PENALTY_RULES["excessive_filler_words"]
        penalties.append({
            "type": "excessive_filler_words",
            "count": excess,
            "amount": penalty,
            "message": f"{excess} filler words over limit"
        })
        total_penalty += penalty
    
    # Check pace
    speech_rate = metrics.get("speech_rate", 0)
    min_pace, max_pace = config["pace_range"]
    
    if speech_rate > max_pace:
        penalties.append({
            "type": "too_fast",
            "amount": PENALTY_RULES["too_fast"],
            "message": f"Speaking too fast ({speech_rate} WPM)"
        })
        total_penalty += PENALTY_RULES["too_fast"]
    elif speech_rate < min_pace and speech_rate > 0:
        penalties.append({
            "type": "too_slow",
            "amount": PENALTY_RULES["too_slow"],
            "message": f"Speaking too slow ({speech_rate} WPM)"
        })
        total_penalty += PENALTY_RULES["too_slow"]
    
    # Check pitch variation
    pitch_variation = metrics.get("pitch_variation", 100)
    if pitch_variation < 20:
        penalties.append({
            "type": "monotone_voice",
            "amount": PENALTY_RULES["monotone_voice"],
            "message": "Voice too monotone"
        })
        total_penalty += PENALTY_RULES["monotone_voice"]
    
    # Check eye contact
    eye_contact_score = metrics.get("eye_contact_score", 100)
    if eye_contact_score < 60:
        penalties.append({
            "type": "poor_eye_contact",
            "amount": PENALTY_RULES["poor_eye_contact"],
            "message": "Insufficient eye contact"
        })
        total_penalty += PENALTY_RULES["poor_eye_contact"]
    
    # Check engagement
    engagement_score = metrics.get("engagement_score", 100)
    if engagement_score < 50:
        penalties.append({
            "type": "poor_engagement",
            "amount": PENALTY_RULES["poor_engagement"],
            "message": "Low engagement detected"
        })
        total_penalty += PENALTY_RULES["poor_engagement"]
    
    base_score = metrics.get("base_score", 0)
    adjusted_score = max(0, base_score - total_penalty)
    
    return {
        "penalties": penalties,
        "total_penalty": total_penalty,
        "base_score": base_score,
        "adjusted_score": adjusted_score
    }
