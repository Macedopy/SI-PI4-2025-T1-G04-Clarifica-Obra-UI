//Responsável de User: Bruno Macedo

export interface UserTypeResponse {
    type: string;
}

export interface LoginResponse {
    id: string;
}

export async function getUserType(): Promise<UserTypeResponse> {
    const response = await fetch('/api/user/type', {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Erro ao buscar tipo do usuário');
    }
    //return response.json();
    return {type: "cliente"};
}

export async function login(customerId: string): Promise<string> {
    const response = await fetch(`http://localhost:8080/users/customer${customerId}`);
    if (!response.ok) {
        throw new Error('Login failed');
    }
    const data = await response.json();
    return data.id; // assuming the response has the user ID
}
