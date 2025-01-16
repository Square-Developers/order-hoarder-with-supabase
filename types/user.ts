export interface SquareData {
    tokens?: string
    refreshToken?: string
    expiresAt?: string
    merchantId?: string
    userDeniedSquare?: boolean
    iv?: string
    squareTokenLastUpdated?: string
    scopes?: string
}

export interface Tokens {
    accessToken: string
    refreshToken: string
}

export interface AuthStatus {
    isAuthed: boolean
    userDeniedSquare: boolean
}
