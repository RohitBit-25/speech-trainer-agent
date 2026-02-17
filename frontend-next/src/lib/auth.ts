// Authentication utilities

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

export function getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
    return !!getAuthToken();
}

export function logout() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    // Redirect to home
    window.location.href = '/';
}

export function setAuthData(token: string, user: any) {
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Set cookie for middleware (7 days)
    document.cookie = `auth_token=${token}; path=/; max-age=604800`;
}
