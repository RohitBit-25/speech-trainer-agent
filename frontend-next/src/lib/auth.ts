// Authentication utilities
const API_URL = "/api";

// Note: Token is now stored in an HTTP-only cookie, not accessible to JS.
// We only store user info in localStorage for UI display purposes.

export function getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

export async function checkSession(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        });
        if (response.ok) {
            const user = await response.json();
            // Update local user data if needed
            localStorage.setItem('user', JSON.stringify(user));
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

export function isAuthenticated(): boolean {
    // This checks if we *think* we are logged in based on local user data.
    // For critical actions, the backend will enforce the cookie.
    return !!getUser();
}

export async function logout() {
    try {
        // Call backend to clear cookie
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) {
        console.error("Logout failed", e);
    }

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Cleanup old tokens if any

    // Redirect to home
    window.location.href = '/';

    // Notify listeners
    window.dispatchEvent(new Event('auth-change'));
}

export function setAuthData(user: any) {
    // Only store user info in localStorage
    localStorage.setItem('user', JSON.stringify(user));

    // We do NOT store the token anymore; backend sets the cookie.

    // Notify listeners
    window.dispatchEvent(new Event('auth-change'));
}
