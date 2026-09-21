// Este arquivo exporta tipos e interfaces utilizados em toda a aplicação, garantindo a tipagem correta com TypeScript.

export interface User {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Category {
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Transaction {
    id: string;
    amount: number;
    categoryId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Context {
    userId?: string; // ID do usuário autenticado, se disponível
}