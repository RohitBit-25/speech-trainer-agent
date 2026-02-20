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

# ==================== MICRO-CHALLENGES FOR SPEECH SKILLS ====================

# Daily Micro-Challenges (Body Language Focus)
DAILY_MICRO_CHALLENGES = [
    {
        "challenge_id": "daily_eye_contact_pro",
        "type": "daily",
        "title": "EYE_CONTACT_PRO",
        "description": "Maintain 75%+ eye contact during your entire session",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(
            min_eye_contact_percent=75,
            skill_category="body_language"
        ),
        "rewards": ChallengeRewards(xp=200, badge_id="eye_contact_pro"),
        "expires_at": datetime.utcnow() + timedelta(days=1)
    },
    {
        "challenge_id": "daily_confidence_boost",
        "type": "daily",
        "title": "CONFIDENCE_BOOST",
        "description": "Achieve 80%+ facial confidence score",
        "difficulty": "beginner",
        "requirements": ChallengeRequirements(
            min_facial_confidence=80,
            skill_category="presence"
        ),
        "rewards": ChallengeRewards(xp=150),
        "expires_at": datetime.utcnow() + timedelta(days=1)
    },
    {
        "challenge_id": "daily_perfect_pace",
        "type": "daily",
        "title": "PERFECT_PACE",
        "description": "Keep your speaking pace between 120-150 WPM",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(
            target_wpm_min=120,
            target_wpm_max=150,
            skill_category="voice_control"
        ),
        "rewards": ChallengeRewards(xp=250, badge_id="pace_master"),
        "expires_at": datetime.utcnow() + timedelta(days=1)
    },
    {
        "challenge_id": "daily_crystal_clear",
        "type": "daily",
        "title": "CRYSTAL_CLEAR",
        "description": "Achieve 85%+ content clarity score",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(
            min_content_clarity=85,
            skill_category="content_clarity"
        ),
        "rewards": ChallengeRewards(xp=200),
        "expires_at": datetime.utcnow() + timedelta(days=1)
    },
    {
        "challenge_id": "daily_steady_voice",
        "type": "daily",
        "title": "STEADY_VOICE",
        "description": "Maintain consistent volume between 60-70 dB",
        "difficulty": "beginner",
        "requirements": ChallengeRequirements(
            volume_min_db=60,
            volume_max_db=70,
            skill_category="voice_control"
        ),
        "rewards": ChallengeRewards(xp=150),
        "expires_at": datetime.utcnow() + timedelta(days=1)
    },
]

# Weekly Micro-Challenges (Skill Building)
WEEKLY_MICRO_CHALLENGES = [
    {
        "challenge_id": "weekly_body_language_master",
        "type": "weekly",
        "title": "BODY_LANGUAGE_MASTER",
        "description": "Complete 5 sessions with 70%+ eye contact",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(
            target_session_count=5,
            min_eye_contact_percent=70,
            skill_category="body_language"
        ),
        "rewards": ChallengeRewards(xp=800, badge_id="body_language_master"),
        "expires_at": datetime.utcnow() + timedelta(weeks=1)
    },
    {
        "challenge_id": "weekly_pacing_perfection",
        "type": "weekly",
        "title": "PACING_PERFECTION",
        "description": "Complete 3 sessions within optimal WPM range (120-150)",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(
            target_session_count=3,
            target_wpm_min=120,
            target_wpm_max=150,
            skill_category="voice_control"
        ),
        "rewards": ChallengeRewards(xp=600, title="Pace Controller"),
        "expires_at": datetime.utcnow() + timedelta(weeks=1)
    },
    {
        "challenge_id": "weekly_engagement_expert",
        "type": "weekly",
        "title": "ENGAGEMENT_EXPERT",
        "description": "Achieve 85%+ engagement score in 4 sessions",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(
            target_session_count=4,
            min_engagement_score=85,
            skill_category="presence"
        ),
        "rewards": ChallengeRewards(xp=750, badge_id="engagement_expert"),
        "expires_at": datetime.utcnow() + timedelta(weeks=1)
    },
    {
        "challenge_id": "weekly_clarity_champion",
        "type": "weekly",
        "title": "CLARITY_CHAMPION",
        "description": "Get 80%+ content clarity in 5 sessions this week",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(
            target_session_count=5,
            min_content_clarity=80,
            skill_category="content_clarity"
        ),
        "rewards": ChallengeRewards(xp=700, title="Clear Communicator"),
        "expires_at": datetime.utcnow() + timedelta(weeks=1)
    },
]

# Achievement Micro-Challenges (Permanent Skill Milestones)
ACHIEVEMENT_MICRO_CHALLENGES = [
    {
        "challenge_id": "achievement_eye_contact_guru",
        "type": "achievement",
        "title": "EYE_CONTACT_GURU",
        "description": "Maintain 90%+ eye contact in a single session",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(
            min_eye_contact_percent=90,
            skill_category="body_language"
        ),
        "rewards": ChallengeRewards(xp=1000, badge_id="eye_guru", title="Eye Contact Guru"),
        "expires_at": None
    },
    {
        "challenge_id": "achievement_voice_master",
        "type": "achievement",
        "title": "VOICE_MASTER",
        "description": "Achieve perfect volume consistency (65-68 dB) for 5 minutes",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(
            volume_min_db=65,
            volume_max_db=68,
            min_duration=300,
            skill_category="voice_control"
        ),
        "rewards": ChallengeRewards(xp=1200, badge_id="voice_master", title="Voice Master"),
        "expires_at": None
    },
    {
        "challenge_id": "achievement_clarity_king",
        "type": "achievement",
        "title": "CLARITY_KING",
        "description": "Achieve 95%+ content clarity score",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(
            min_content_clarity=95,
            skill_category="content_clarity"
        ),
        "rewards": ChallengeRewards(xp=1500, badge_id="clarity_king", title="Clarity King"),
        "expires_at": None
    },
    {
        "challenge_id": "achievement_confidence_legend",
        "type": "achievement",
        "title": "CONFIDENCE_LEGEND",
        "description": "Achieve 95%+ facial confidence in 10 different sessions",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(
            target_session_count=10,
            min_facial_confidence=95,
            skill_category="presence"
        ),
        "rewards": ChallengeRewards(xp=2000, badge_id="confidence_legend", title="Confidence Legend"),
        "expires_at": None
    },
    {
        "challenge_id": "achievement_pacing_ninja",
        "type": "achievement",
        "title": "PACING_NINJA",
        "description": "Complete 20 sessions within the optimal 130-140 WPM range",
        "difficulty": "expert",
        "requirements": ChallengeRequirements(
            target_session_count=20,
            target_wpm_min=130,
            target_wpm_max=140,
            skill_category="voice_control"
        ),
        "rewards": ChallengeRewards(xp=1800, badge_id="pacing_ninja", title="Pacing Ninja"),
        "expires_at": None
    },
    {
        "challenge_id": "achievement_well_rounded",
        "type": "achievement",
        "title": "WELL_ROUNDED_SPEAKER",
        "description": "Complete at least one challenge from each skill category",
        "difficulty": "intermediate",
        "requirements": ChallengeRequirements(
            specific_metrics={"categories_completed": ["body_language", "voice_control", "content_clarity", "presence"]}
        ),
        "rewards": ChallengeRewards(xp=1500, badge_id="well_rounded", title="Well-Rounded Speaker"),
        "expires_at": None
    },
]

async def seed_challenges():
    """Seed the database with initial challenges"""
    all_challenges = (
        DAILY_CHALLENGES + 
        WEEKLY_CHALLENGES + 
        ACHIEVEMENT_CHALLENGES +
        DAILY_MICRO_CHALLENGES +
        WEEKLY_MICRO_CHALLENGES +
        ACHIEVEMENT_MICRO_CHALLENGES
    )
    
    created_count = 0
    skipped_count = 0
    
    for challenge_data in all_challenges:
        # Check if challenge already exists
        existing = await challenges_collection.find_one(
            {"challenge_id": challenge_data["challenge_id"]}
        )
        
        if not existing:
            challenge = ChallengeInDB(**challenge_data)
            await challenges_collection.insert_one(challenge.dict(by_alias=True))
            print(f"✅ Created challenge: {challenge_data['title']}")
            created_count += 1
        else:
            print(f"⏭️  Challenge already exists: {challenge_data['title']}")
            skipped_count += 1
    
    print(f"\n✅ Seeded {created_count} new challenges ({skipped_count} skipped)")
    print(f"📊 Total: {len(all_challenges)} challenges")
    print(f"   - Daily: {len(DAILY_CHALLENGES) + len(DAILY_MICRO_CHALLENGES)}")
    print(f"   - Weekly: {len(WEEKLY_CHALLENGES) + len(WEEKLY_MICRO_CHALLENGES)}")
    print(f"   - Achievements: {len(ACHIEVEMENT_CHALLENGES) + len(ACHIEVEMENT_MICRO_CHALLENGES)}")

if __name__ == "__main__":
    asyncio.run(seed_challenges())
