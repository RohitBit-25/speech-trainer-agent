"""
Health check for all AI/ML components
Verifies all components can be initialized and used
"""

import asyncio
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


async def check_component_health() -> Dict[str, bool]:
    """
    Verify all ML components can initialize and work
    Returns dict with component name -> status
    """
    results = {}
    
    # Check EmotionDetector
    try:
        from app.core.emotion_detector import EmotionDetector
        detector = EmotionDetector()
        results['emotion_detector'] = True
        logger.info("✅ EmotionDetector: OK")
    except Exception as e:
        results['emotion_detector'] = False
        logger.error(f"❌ EmotionDetector: FAILED - {e}")
    
    # Check VoiceQualityAnalyzer
    try:
        from app.core.voice_quality_analyzer import VoiceQualityAnalyzer
        analyzer = VoiceQualityAnalyzer()
        results['voice_analyzer'] = True
        logger.info("✅ VoiceQualityAnalyzer: OK")
    except Exception as e:
        results['voice_analyzer'] = False
        logger.error(f"❌ VoiceQualityAnalyzer: FAILED - {e}")
    
    # Check Gemini
    try:
        from app.core.gemini_coach_engine import GeminiCoachEngine
        gemini = GeminiCoachEngine()
        results['gemini'] = True
        logger.info("✅ GeminiCoachEngine: OK")
    except Exception as e:
        results['gemini'] = False
        logger.error(f"❌ GeminiCoachEngine: FAILED - {e}")
    
    # Check IntelligentScoringSystem
    try:
        from app.core.scoring_system import IntelligentScoringSystem
        scorer = IntelligentScoringSystem("intermediate")
        results['scorer'] = True
        logger.info("✅ IntelligentScoringSystem: OK")
    except Exception as e:
        results['scorer'] = False
        logger.error(f"❌ IntelligentScoringSystem: FAILED - {e}")
    
    # Check RealtimeFacialAgent
    try:
        from app.agents.realtime.realtime_facial_agent import RealtimeFacialAgent
        agent = RealtimeFacialAgent()
        results['facial_agent'] = True
        logger.info("✅ RealtimeFacialAgent: OK")
    except Exception as e:
        results['facial_agent'] = False
        logger.error(f"❌ RealtimeFacialAgent: FAILED - {e}")
    
    # Check RealtimeVoiceAgent
    try:
        from app.agents.realtime.realtime_voice_agent import RealtimeVoiceAgent
        agent = RealtimeVoiceAgent()
        results['voice_agent'] = True
        logger.info("✅ RealtimeVoiceAgent: OK")
    except Exception as e:
        results['voice_agent'] = False
        logger.error(f"❌ RealtimeVoiceAgent: FAILED - {e}")
    
    # Summary
    total_components = len(results)
    healthy_components = sum(1 for v in results.values() if v)
    
    logger.info(f"🏥 Component Health Check: {healthy_components}/{total_components} components healthy")
    
    if healthy_components < total_components:
        logger.warning(f"⚠️ WARNING: {total_components - healthy_components} components not available. Functionality reduced.")
        failed = [k for k, v in results.items() if not v]
        logger.warning(f"Failed components: {', '.join(failed)}")
    
    return results


async def get_health_status() -> Dict:
    """
    Get current health status of all components
    """
    # This is now an async function that can be called from async endpoints
    try:
        results = await check_component_health()
        
        total = len(results)
        healthy = sum(1 for v in results.values() if v)
        
        return {
            "status": "healthy" if healthy == total else "degraded" if healthy > 0 else "unhealthy",
            "healthy_components": healthy,
            "total_components": total,
            "components": results
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "components": {}
        }
