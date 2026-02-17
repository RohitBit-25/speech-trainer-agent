"""
API endpoints for game mechanics: difficulty, challenges, leaderboard
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.mongodb import (
    challenges_collection,
    user_challenges_collection,
    leaderboard_collection,
    users_collection,
    realtime_sessions_collection
)
from app.db.models_mongo import (
    ChallengeInDB,
    UserChallengeInDB,
    LeaderboardEntryInDB
)
from app.core.difficulty import DIFFICULTY_CONFIGS, get_difficulty_config
from bson import ObjectId

router = APIRouter(prefix="/game", tags=["game-mechanics"])


# ============= DIFFICULTY ENDPOINTS =============

@router.get("/difficulty-configs")
async def get_difficulty_configs():
    """Get all difficulty level configurations"""
    return {
        "configs": DIFFICULTY_CONFIGS,
        "default": "intermediate"
    }

@router.get("/difficulty/{level}")
async def get_difficulty_detail(level: str):
    """Get detailed configuration for a specific difficulty level"""
    config = get_difficulty_config(level)
    if not config:
        raise HTTPException(status_code=404, detail="Difficulty level not found")
    return config


# ============= CHALLENGES ENDPOINTS =============

@router.get("/challenges/active")
async def get_active_challenges(user_id: Optional[str] = None):
    """Get all currently active challenges"""
    now = datetime.utcnow()
    
    # Get active challenges
    query = {
        "active": True,
        "$or": [
            {"expires_at": {"$gt": now}},
            {"expires_at": None}
        ]
    }
    
    challenges = await challenges_collection.find(query).to_list(100)
    
    # If user_id provided, get their progress
    if user_id:
        user_progress = {}
        user_challenges = await user_challenges_collection.find(
            {"user_id": user_id}
        ).to_list(100)
        
        for uc in user_challenges:
            user_progress[uc["challenge_id"]] = {
                "progress": uc.get("progress", 0),
                "completed": uc.get("completed", False),
                "claimed": uc.get("claimed", False)
            }
        
        # Add progress to challenges
        for challenge in challenges:
            challenge_id = challenge["challenge_id"]
            challenge["user_progress"] = user_progress.get(challenge_id, {
                "progress": 0,
                "completed": False,
                "claimed": False
            })
    
    return {"challenges": challenges, "count": len(challenges)}


@router.post("/challenges/{challenge_id}/claim")
async def claim_challenge_reward(challenge_id: str, user_id: str):
    """Claim rewards for a completed challenge"""
    
    # Get user challenge
    user_challenge = await user_challenges_collection.find_one({
        "user_id": user_id,
        "challenge_id": challenge_id
    })
    
    if not user_challenge:
        raise HTTPException(status_code=404, detail="Challenge not found for user")
    
    if not user_challenge.get("completed"):
        raise HTTPException(status_code=400, detail="Challenge not completed yet")
    
    if user_challenge.get("claimed"):
        raise HTTPException(status_code=400, detail="Rewards already claimed")
    
    # Get challenge details
    challenge = await challenges_collection.find_one({"challenge_id": challenge_id})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Mark as claimed
    await user_challenges_collection.update_one(
        {"_id": user_challenge["_id"]},
        {
            "$set": {
                "claimed": True,
                "claimed_at": datetime.utcnow()
            }
        }
    )
    
    rewards = challenge.get("rewards", {})
    
    return {
        "success": True,
        "rewards": rewards,
        "message": f"Claimed {rewards.get('xp', 0)} XP!"
    }


@router.get("/challenges/progress/{user_id}")
async def get_challenge_progress(user_id: str):
    """Get user's progress on all challenges"""
    
    user_challenges = await user_challenges_collection.find(
        {"user_id": user_id}
    ).to_list(100)
    
    # Get challenge details
    challenge_ids = [uc["challenge_id"] for uc in user_challenges]
    challenges = await challenges_collection.find(
        {"challenge_id": {"$in": challenge_ids}}
    ).to_list(100)
    
    # Create challenge map
    challenge_map = {c["challenge_id"]: c for c in challenges}
    
    # Combine data
    result = []
    for uc in user_challenges:
        challenge_id = uc["challenge_id"]
        if challenge_id in challenge_map:
            result.append({
                **challenge_map[challenge_id],
                "progress": uc.get("progress", 0),
                "completed": uc.get("completed", False),
                "claimed": uc.get("claimed", False),
                "started_at": uc.get("started_at"),
                "completed_at": uc.get("completed_at")
            })
    
    return {
        "challenges": result,
        "total": len(result),
        "completed": sum(1 for c in result if c["completed"]),
        "claimed": sum(1 for c in result if c["claimed"])
    }


# ============= LEADERBOARD ENDPOINTS =============

@router.get("/leaderboard/{category}")
async def get_leaderboard(
    category: str,  # "daily", "weekly", "all_time"
    difficulty: str = "all",
    limit: int = 100
):
    """Get top performers for a category"""
    
    # Determine time cutoff
    now = datetime.utcnow()
    if category == "daily":
        cutoff = now - timedelta(days=1)
    elif category == "weekly":
        cutoff = now - timedelta(weeks=1)
    elif category == "all_time":
        cutoff = None
    else:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    # Build query
    query = {"category": category}
    if cutoff:
        query["timestamp"] = {"$gte": cutoff}
    if difficulty != "all":
        query["difficulty"] = difficulty
    
    # Get leaderboard entries
    entries = await leaderboard_collection.find(query).sort(
        "score", -1
    ).limit(limit).to_list(limit)
    
    # Add ranks
    for i, entry in enumerate(entries):
        entry["rank"] = i + 1
    
    return {
        "leaderboard": entries,
        "category": category,
        "difficulty": difficulty,
        "total_entries": len(entries)
    }


@router.post("/leaderboard/submit")
async def submit_leaderboard_entry(
    user_id: str,
    username: str,
    score: float,
    difficulty: str,
    session_id: str
):
    """Submit a new leaderboard entry"""
    
    # Create entry for all categories
    categories = ["daily", "weekly", "all_time"]
    
    for category in categories:
        entry = LeaderboardEntryInDB(
            user_id=user_id,
            username=username,
            score=score,
            difficulty=difficulty,
            session_id=session_id,
            category=category,
            timestamp=datetime.utcnow()
        )
        
        await leaderboard_collection.insert_one(entry.dict(by_alias=True))
    
    return {
        "success": True,
        "message": "Score submitted to leaderboard"
    }


@router.get("/leaderboard/user/{user_id}/rank")
async def get_user_rank(user_id: str, category: str = "all_time", difficulty: str = "all"):
    """Get a user's current rank"""
    
    # Build query
    query = {"category": category}
    if difficulty != "all":
        query["difficulty"] = difficulty
    
    # Get all entries sorted by score
    all_entries = await leaderboard_collection.find(query).sort(
        "score", -1
    ).to_list(10000)
    
    # Find user's rank
    user_rank = None
    user_score = None
    
    for i, entry in enumerate(all_entries):
        if entry["user_id"] == user_id:
            user_rank = i + 1
            user_score = entry["score"]
            break
    
    if user_rank is None:
        return {
            "ranked": False,
            "message": "User not on leaderboard yet"
        }
    
    return {
        "ranked": True,
        "rank": user_rank,
        "score": user_score,
        "total_players": len(all_entries),
        "percentile": round((1 - (user_rank / len(all_entries))) * 100, 2)
    }
