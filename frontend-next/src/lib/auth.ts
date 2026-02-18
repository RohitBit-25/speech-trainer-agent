// Authentication utilities
const API_URL = "/api";

// Note: Token is now stored in an HTTP-only cookie, not accessible to JS.
// We only store user info in localStorage for UI display purposes.

export function getUser(): any | null {
    if (typeof window === "undefined") return null;
    try {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
}

export async function checkSession(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: "include",
        });
        if (response.ok) {
            const user = await response.json();
            // Update local user data from server
            localStorage.setItem("user", JSON.stringify(user));
            // Notify listeners that user data may have been refreshed
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth-change"));
            }
            return true;
        }
        return false;
    } catch (e) {
        // Network error — don't clear user state, just return false
        return false;
    }
}

export function isAuthenticated(): boolean {
    return !!getUser();
}

export async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
    } catch (e) {
        console.error("Logout API call failed", e);
    }

    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Notify listeners BEFORE redirect so Navbar updates
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
    }

    // Redirect to home
    window.location.href = "/";
}

export function setAuthData(user: any) {
    // Store user info in localStorage for UI
    localStorage.setItem("user", JSON.stringify(user));

    // Notify listeners so Navbar updates immediately
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
    }
}
