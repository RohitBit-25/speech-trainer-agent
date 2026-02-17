import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def test_mongodb():
    """Test MongoDB connection"""
    print("=" * 60)
    print("🧪 Testing MongoDB Connection")
    print("=" * 60)
    
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "speech_trainer")
    
    print(f"\n📍 MongoDB URL: {mongodb_url}")
    print(f"📍 Database: {database_name}")
    
    try:
        # Connect to MongoDB
        print("\n🔄 Connecting to MongoDB...")
        client = MongoClient(mongodb_url, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # Get database
        db = client[database_name]
        
        # List collections
        collections = db.list_collection_names()
        print(f"\n📚 Existing collections: {collections if collections else 'None (new database)'}")
        
        # Test write operation
        print("\n🔄 Testing write operation...")
        test_collection = db.test_connection
        result = test_collection.insert_one({"test": "connection", "status": "success"})
        print(f"✅ Write successful! Document ID: {result.inserted_id}")
        
        # Test read operation
        print("\n🔄 Testing read operation...")
        doc = test_collection.find_one({"_id": result.inserted_id})
        print(f"✅ Read successful! Document: {doc}")
        
        # Clean up test document
        test_collection.delete_one({"_id": result.inserted_id})
        print("✅ Cleanup successful!")
        
        # Show database stats
        stats = db.command("dbStats")
        print(f"\n📊 Database Stats:")
        print(f"   Collections: {stats['collections']}")
        print(f"   Data Size: {stats['dataSize']} bytes")
        print(f"   Storage Size: {stats['storageSize']} bytes")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"\n❌ MongoDB Connection Error: {str(e)}")
        print("\n🔍 Common issues:")
        print("   - MongoDB not running (run: brew services start mongodb-community@7.0)")
        print("   - Wrong connection string in .env")
        print("   - Network issues (for MongoDB Atlas)")
        print("   - IP not whitelisted (for MongoDB Atlas)")
        return False


if __name__ == "__main__":
    success = test_mongodb()
    print("\n" + "=" * 60)
    if success:
        print("✅ TEST PASSED - MongoDB is ready to use!")
    else:
        print("❌ TEST FAILED - Please fix the issues above")
    print("=" * 60)
