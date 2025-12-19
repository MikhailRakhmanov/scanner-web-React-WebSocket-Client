const TOKEN_KEY = 'jwt_token';
const LOGIN_KEY = 'jwt_login';

export const auth = {
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },
    getLogin(): string | null {
        return localStorage.getItem(LOGIN_KEY);
    },
    setLogin(login: string): void {
        localStorage.setItem(LOGIN_KEY, login);
    },
    clear(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(LOGIN_KEY);
    },
    logout(): void {
        auth.clear();
        console.log('Logged out');
    },
};