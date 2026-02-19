import asyncio
import random
from datetime import datetime, timedelta
from app.db.mongodb import init_db, leaderboard_collection, close_db
from app.db.models_mongo import LeaderboardEntryInDB

USERNAMES = [
    "SpeechMaster", "VoicePro", "TalkativeTom", "ChattyCathy", "OratorRex",
    "EloquentEliza", "PublicSpeaker101", "StageFrightNoMore", "MicrophoneMike", "PodiumPaul",
    "AudienceAlice", "VocalVictor", "RhetoricRick", "SpeechifySam", "LoudLarry",
    "QuietQuinn", "DynamicDana", "ExpressiveEvan", "FluentFiona", "ArticulateArt",
    "ConfidentCarl", "SmoothSarah", "BoldBen", "ClearClaire", "DirectDave"
]

CATEGORIES = ["daily", "weekly", "all_time"]
DIFFICULTIES = ["beginner", "intermediate", "expert"]

async def seed_leaderboard():
    await init_db()
    print("🌱 Seeding leaderboard...")

    entries = []
    
    # Generate around 50 entries
    for i in range(50):
        username = random.choice(USERNAMES)
        user_id = f"mock_user_{i}" # Simple mock IDs
        
        # Create an entry for each category primarily, maybe multiple per user
        for category in CATEGORIES:
            if random.random() < 0.3: # 30% chance to skip a category for variety
                continue

            score = random.randint(100, 5000)
            difficulty = random.choice(DIFFICULTIES)
            
            # Timestamp logic
            now = datetime.utcnow()
            if category == "daily":
                timestamp = now - timedelta(hours=random.randint(0, 24))
            elif category == "weekly":
                timestamp = now - timedelta(days=random.randint(0, 6))
            else:
                timestamp = now - timedelta(days=random.randint(0, 30))

            entry_data = LeaderboardEntryInDB(
                user_id=user_id,
                username=username,
                score=float(score),
                difficulty=difficulty,
                session_id=f"session_{i}_{category}",
                category=category,
                timestamp=timestamp
            )
            entry_dict = entry_data.model_dump(by_alias=True)
            if entry_dict.get("_id") is None:
                del entry_dict["_id"]
            entries.append(entry_dict)

    if entries:
        # Optional: Clear existing mock data first if needed, but for now just appending
        # await leaderboard_collection.delete_many({"user_id": {"$regex": "^mock_user_"}}) 
        
        await leaderboard_collection.insert_many(entries)
        print(f"✅ Inserted {len(entries)} leaderboard entries.")
    else:
        print("⚠️ No entries generated.")

    print("✨ Leaderboard seeding complete!")
    await close_db()

if __name__ == "__main__":
    asyncio.run(seed_leaderboard())
