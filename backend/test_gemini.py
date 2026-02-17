import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

def test_gemini():
    """Test Gemini API connection"""
    print("=" * 60)
    print("🧪 Testing Gemini API Connection")
    print("=" * 60)
    
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found in .env file")
        print("\n📝 To fix this:")
        print("1. Go to https://makersuite.google.com/app/apikey")
        print("2. Create an API key")
        print("3. Add to backend/.env: GEMINI_API_KEY=your_key_here")
        return False
    
    print(f"✅ API Key found: {api_key[:10]}...{api_key[-4:]}")
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        print("\n🔄 Testing Gemini 1.5 Flash model...")
        
        # Test with a simple prompt
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Say 'Hello, Speech Trainer!' if you're working.")
        
        print(f"\n✅ Gemini Response:")
        print(f"   {response.text}")
        print("\n✅ Gemini API is working correctly!")
        print("\n📊 Model Info:")
        print(f"   Model: gemini-1.5-flash")
        print(f"   Response length: {len(response.text)} characters")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Gemini API Error: {str(e)}")
        print("\n🔍 Common issues:")
        print("   - Invalid API key")
        print("   - API key not activated")
        print("   - Rate limit exceeded (15 requests/minute for free tier)")
        print("   - Network connectivity issues")
        return False


if __name__ == "__main__":
    success = test_gemini()
    print("\n" + "=" * 60)
    if success:
        print("✅ TEST PASSED - Gemini is ready to use!")
    else:
        print("❌ TEST FAILED - Please fix the issues above")
    print("=" * 60)
