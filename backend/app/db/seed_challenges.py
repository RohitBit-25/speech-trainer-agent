"""
Seed data for challenges
Run this script to populate the database with initial challenges
"""

from datetime import datetime, timedelta
from app.db.mongodb import challenges_collection
from app.db.models_mongo import ChallengeInDB, ChallengeRequirements, ChallengeRewards
import asyncio

# Daily Challenges
DAILY_CHALLENGES = [
    {
        "challenge_id": "daily_perfect_pitch",
        "type": "daily",
        "title": "PERFECT_PITCH_DAY",
        "description": "Maintain 90+ pitch consistency in a session",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(
            min_score=90,
            specific_metrics={"pitch_consistency": 90}
        ),
        "rewards": ChallengeRewards(xp=300, badge_id="pitch_master"),
        "expires_at": datetime.utcnow() + timedelta(days=1)
    },
    {
        "challenge_id": "daily_speed_demon",
        "type": "daily",
        "title": "SPEED_DEMON",
        "description": "Complete 3 analyses in one day",
        "difficulty": "beginner",
        "requirements": ChallengeRequirements(min_sessions=3),
        "rewards": ChallengeRewards(xp=250),
        "expires_at": datetime.utcnow() + timedelta(days=1)
    },
    {
        "challenge_id": "daily_filler_free",
        "type": "daily",
        "title": "FILLER_FREE_ZONE",
        "description": "Zero filler words in a session",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(max_filler_words=0),
        "rewards": ChallengeRewards(xp=500, badge_id="clean_speaker"),
        "expires_at": datetime.utcnow() + timedelta(days=1)
    }
]

# Weekly Challenges
WEEKLY_CHALLENGES = [
    {
        "challenge_id": "weekly_consistency",
        "type": "weekly",
        "title": "CONSISTENCY_KING",
        "description": "Practice 5 days this week",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(min_sessions=5),
        "rewards": ChallengeRewards(xp=1000, title="Consistent Communicator"),
        "expires_at": datetime.utcnow() + timedelta(weeks=1)
    },
    {
        "challenge_id": "weekly_score_master",
        "type": "weekly",
        "title": "SCORE_MASTER",
        "description": "Achieve 85+ average score across all sessions",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(min_score=85),
        "rewards": ChallengeRewards(xp=1500, badge_id="score_master"),
        "expires_at": datetime.utcnow() + timedelta(weeks=1)
    },
    {
        "challenge_id": "weekly_marathon",
        "type": "weekly",
        "title": "MARATHON_SPEAKER",
        "description": "30 minutes total practice time this week",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(min_duration=1800),  # 30 minutes
        "rewards": ChallengeRewards(xp=800),
        "expires_at": datetime.utcnow() + timedelta(weeks=1)
    }
]

# Achievement Challenges (permanent)
ACHIEVEMENT_CHALLENGES = [
    {
        "challenge_id": "achievement_first_steps",
        "type": "achievement",
        "title": "FIRST_STEPS",
        "description": "Complete your first analysis",
        "difficulty": "beginner",
        "requirements": ChallengeRequirements(min_sessions=1),
        "rewards": ChallengeRewards(xp=100, badge_id="first_contact"),
        "expires_at": None
    },
    {
        "challenge_id": "achievement_hundred_club",
        "type": "achievement",
        "title": "HUNDRED_CLUB",
        "description": "Reach level 10",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(
            specific_metrics={"user_level": 10}
        ),
        "rewards": ChallengeRewards(xp=2000, title="Veteran Speaker"),
        "expires_at": None
    },
    {
        "challenge_id": "achievement_perfectionist",
        "type": "achievement",
        "title": "PERFECTIONIST",
        "description": "Get 100 score in all categories",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(
            perfect_categories=["facial", "voice", "content"]
        ),
        "rewards": ChallengeRewards(xp=5000, badge_id="perfectionist", title="Perfect Orator"),
        "expires_at": None
    },
    {
        "challenge_id": "achievement_combo_master",
        "type": "achievement",
        "title": "COMBO_MASTER",
        "description": "Achieve a 20x combo in real-time practice",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(
            specific_metrics={"max_combo": 20}
        ),
        "rewards": ChallengeRewards(xp=3000, badge_id="combo_king"),
        "expires_at": None
    }
]

async def seed_challenges():
    """Seed the database with initial challenges"""
    all_challenges = DAILY_CHALLENGES + WEEKLY_CHALLENGES + ACHIEVEMENT_CHALLENGES
    
    for challenge_data in all_challenges:
        # Check if challenge already exists
        existing = await challenges_collection.find_one(
            {"challenge_id": challenge_data["challenge_id"]}
        )
        
        if not existing:
            challenge = ChallengeInDB(**challenge_data)
            await challenges_collection.insert_one(challenge.dict(by_alias=True))
            print(f"✅ Created challenge: {challenge_data['title']}")
        else:
            print(f"⏭️  Challenge already exists: {challenge_data['title']}")
    
    print(f"\n✅ Seeded {len(all_challenges)} challenges")

if __name__ == "__main__":
    asyncio.run(seed_challenges())
