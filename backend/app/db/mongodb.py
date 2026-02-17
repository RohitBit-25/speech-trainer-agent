from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "speech_trainer")

# Async client for FastAPI
async_client = AsyncIOMotorClient(MONGODB_URL)
async_db = async_client[DATABASE_NAME]

# Sync client for Celery workers
sync_client = MongoClient(MONGODB_URL)
sync_db = sync_client[DATABASE_NAME]

# Collections
users_collection = async_db.users
analysis_results_collection = async_db.analysis_results
realtime_sessions_collection = async_db.realtime_sessions
realtime_metrics_collection = async_db.realtime_metrics
realtime_achievements_collection = async_db.realtime_achievements

# Sync collections for Celery
sync_users_collection = sync_db.users
sync_analysis_results_collection = sync_db.analysis_results


async def init_db():
    """Initialize database with indexes"""
    try:
        # Create indexes for better performance
        await users_collection.create_index("email", unique=True)
        await analysis_results_collection.create_index("user_id")
        await analysis_results_collection.create_index("task_id", unique=True)
        await realtime_sessions_collection.create_index("session_id", unique=True)
        await realtime_sessions_collection.create_index("user_id")
        
        print("✅ MongoDB initialized with indexes")
    except Exception as e:
        print(f"⚠️  MongoDB initialization warning: {str(e)}")


async def close_db():
    """Close database connections"""
    async_client.close()
    sync_client.close()
    print("✅ MongoDB connections closed")
