export interface IPlayer {
    id?: number,
    socket?: any,
    x?: number,
    y?: number,
    score?: number,
    message?: string,
    width?: number,
    height?: number,
    username?: string,
    disconnected: boolean
}

export interface IGame {
    gameID?: string
    player1?: IPlayer
    player2?: IPlayer
    scoreP1?: number
    scoreP2?: number
    isCustom?: string
    winner?: IPlayer
}