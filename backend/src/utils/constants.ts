// Este arquivo define constantes utilizadas em toda a aplicação, como mensagens de erro e configurações.

export const ERROR_MESSAGES = {
    USER_NOT_FOUND: "Usuário não encontrado.",
    INVALID_CREDENTIALS: "Credenciais inválidas.",
    CATEGORY_NOT_FOUND: "Categoria não encontrada.",
    TRANSACTION_NOT_FOUND: "Transação não encontrada.",
    UNAUTHORIZED: "Acesso não autorizado.",
};

export const SUCCESS_MESSAGES = {
    USER_CREATED: "Usuário criado com sucesso.",
    LOGIN_SUCCESS: "Login realizado com sucesso.",
    CATEGORY_CREATED: "Categoria criada com sucesso.",
    TRANSACTION_CREATED: "Transação criada com sucesso.",
};

export const JWT_EXPIRATION = "1h"; // Tempo de expiração do token JWT
export const DEFAULT_PAGE_SIZE = 10; // Tamanho padrão da página para listagens