const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api/auth/Auth`
  : 'https://localhost:7299/api/auth/Auth';

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthError extends Error {
  message: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Récupérer le token du localStorage au démarrage
    this.token = localStorage.getItem('auth_token');
    if (this.token) {
      this.decodeAndSetUser(this.token);
    }
  }

  private decodeAndSetUser(token: string) {
    try {
      // Décoder le JWT pour extraire les informations utilisateur
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.user = {
        id: parseInt(payload.sub),
        email: payload.email,
        role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      };
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Erreur lors de la connexion');
    }

    const data: LoginResponse = await response.json();
    this.token = data.token;
    localStorage.setItem('auth_token', this.token);
    this.decodeAndSetUser(this.token);
  }

  async signUp(email: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Erreur lors de l\'inscription');
    }
  }

  async signOut(): Promise<void> {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // Méthode pour faire des requêtes authentifiées
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

export const authService = new AuthService(); 