import asyncio
from app.db.mongodb import init_db, challenges_collection
from app.db.models_mongo import ChallengeInDB
from datetime import datetime, timedelta

DEFAULT_CHALLENGES = [
    {
        "challenge_id": "daily_1",
        "type": "daily",
        "title": "First Words",
        "description": "Complete a 60-second practice session today.",
        "difficulty": "beginner",
        "requirements": {"sessions": 1, "min_duration": 60},
        "rewards": {"xp": 150},
        "active": True
    },
    {
        "challenge_id": "daily_2",
        "type": "daily",
        "title": "Filler Slayer",
        "description": "Complete a session with fewer than 5 filler words.",
        "difficulty": "intermediate",
        "requirements": {"filler_words_max": 5},
        "rewards": {"xp": 250, "badge_id": "clean_speaker"},
         "active": True
    },
    {
        "challenge_id": "daily_3",
        "type": "daily",
        "title": "Confidence Surge",
        "description": "Achieve a facial confidence score above 80%.",
        "difficulty": "intermediate",
        "requirements": {"facial_score_min": 80},
        "rewards": {"xp": 300},
         "active": True
    },
    {
        "challenge_id": "weekly_1",
        "type": "weekly",
        "title": "7-Day Warrior",
        "description": "Practice every day for 7 consecutive days.",
        "difficulty": "expert",
        "requirements": {"streak_days": 7},
        "rewards": {"xp": 1000, "badge_id": "warrior", "title": "The Consistent"},
         "active": True
    },
    {
        "challenge_id": "weekly_2",
        "type": "weekly",
        "title": "Score Hunter",
        "description": "Accumulate 5,000 total points across all sessions this week.",
        "difficulty": "intermediate",
        "requirements": {"total_score": 5000},
        "rewards": {"xp": 600, "badge_id": "score_hunter"},
         "active": True
    },
    {
        "challenge_id": "ach_1",
        "type": "achievement",
        "title": "First Blood",
        "description": "Complete your very first practice session.",
        "difficulty": "beginner",
        "requirements": {"sessions": 1},
        "rewards": {"xp": 100, "badge_id": "first_blood"},
         "active": True
    },
     {
        "challenge_id": "ach_3",
        "type": "achievement",
        "title": "Leaderboard Legend",
        "description": "Reach the Top 10 on the global leaderboard.",
        "difficulty": "expert",
        "requirements": {"rank": 10},
        "rewards": {"xp": 2000, "badge_id": "legend", "title": "Legend"},
         "active": True
    },
]

async def seed():
    await init_db()
    print("🌱 Seeding challenges...")
    
    now = datetime.utcnow()
    
    for challenge_data in DEFAULT_CHALLENGES:
        # Determine expiry based on type
        expires_at = None
        if challenge_data["type"] == "daily":
            expires_at = now + timedelta(days=1)
        elif challenge_data["type"] == "weekly":
            expires_at = now + timedelta(weeks=1)
            
        # Check if exists
        existing = await challenges_collection.find_one({"challenge_id": challenge_data["challenge_id"]})
        
        if not existing:
            challenge_data["created_at"] = now
            challenge_data["expires_at"] = expires_at
            
            await challenges_collection.insert_one(challenge_data)
            print(f"✅ Created challenge: {challenge_data['title']}")
        else:
             # Update expiry for daily/weekly to keep them active
            if challenge_data["type"] in ["daily", "weekly"]:
                 await challenges_collection.update_one(
                    {"challenge_id": challenge_data["challenge_id"]},
                    {"$set": {"expires_at": expires_at, "active": True}}
                )
            print(f"🔄 Updated challenge: {challenge_data['title']}")

    print("✨ Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
