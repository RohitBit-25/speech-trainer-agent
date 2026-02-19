/**
 * API Endpoints Configuration
 * This file documents all backend endpoints and their expected request/response formats
 */

export const API_ENDPOINTS = {
  // Analysis endpoints
  ANALYZE: '/api/analyze',
  ANALYSIS_STATUS: '/api/status/:taskId',
  ANALYSIS_GET: '/api/analysis/:taskId',
  ANALYSIS_STREAM: '/api/stream/:taskId',
  HISTORY: '/api/history',
  
  // Real-time session endpoints
  REALTIME_START_SESSION: '/api/realtime/start-session',
  REALTIME_END_SESSION: '/api/realtime/end-session/:sessionId',
  REALTIME_SESSION_STATS: '/api/realtime/session/:sessionId/stats',
  REALTIME_WEBSOCKET: '/ws/practice/:sessionId',
  
  // Game endpoints
  GAME_DIFFICULTY_CONFIGS: '/api/game/difficulty-configs',
  GAME_DIFFICULTY_DETAIL: '/api/game/difficulty/:level',
  GAME_CHALLENGES_ACTIVE: '/api/game/challenges/active',
  GAME_CHALLENGES_CLAIM: '/api/game/challenges/:challengeId/claim',
  GAME_CHALLENGES_PROGRESS: '/api/game/challenges/progress/:userId',
  GAME_LEADERBOARD: '/api/game/leaderboard/:category',
  GAME_LEADERBOARD_SUBMIT: '/api/game/leaderboard/submit',
  GAME_LEADERBOARD_USER_RANK: '/api/game/leaderboard/user/:userId/rank',
  
  // Auth endpoints (if needed)
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',
} as const;

/**
 * List of all backend endpoints for reference
 * Updated: 2025-02-19
 */

export const BACKEND_ROUTES_AVAILABLE = {
  POST: [
    '/api/analyze - Upload video for analysis',
    '/api/realtime/start-session - Start a real-time practice session',
    '/api/realtime/end-session/{session_id} - End a real-time session',
    '/api/game/challenges/{challenge_id}/claim - Claim a challenge reward',
    '/api/game/leaderboard/submit - Submit score to leaderboard',
  ],
  GET: [
    '/api/ - Root endpoint',
    '/api/status/{task_id} - Get analysis status',
    '/api/stream/{task_id} - Stream analysis logs',
    '/api/history - Get user\'s analysis history',
    '/api/analysis/{task_id} - Get completed analysis',
    '/api/realtime/session/{session_id}/stats - Get session statistics',
    '/api/game/difficulty-configs - Get all difficulty configurations',
    '/api/game/difficulty/{level} - Get specific difficulty config',
    '/api/game/challenges/active - Get active challenges',
    '/api/game/challenges/progress/{user_id} - Get user\'s challenge progress',
    '/api/game/leaderboard/{category} - Get leaderboard entries',
    '/api/game/leaderboard/user/{user_id}/rank - Get user\'s leaderboard rank',
  ],
  WEBSOCKET: [
    '/ws/realtime-analysis/{session_id} - Real-time analysis WebSocket',
    '/ws/practice/{session_id} - Practice mode WebSocket with full AI coach',
  ]
} as const;
