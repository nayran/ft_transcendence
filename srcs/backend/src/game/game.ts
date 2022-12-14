import { IPlayer } from "./game.interface";

export class Game {
    constructor(gameId: string, custom: string, challenge: boolean, challenged: string) {
        this.gameID = gameId;
        this.isCustom = custom;
        this.challenge = challenge
        this.challenged = challenged

    }

    player1: IPlayer = {
        id: 0,
        socket: '',
        x: 0,
        y: 0,
        score: 0,
        message: '',
        width: 15,
        height: 150,
        username: '',
        disconnected: false
    };
    player2: IPlayer = {
        id: 0,
        socket: '',
        x: 0,
        y: 0,
        score: 0,
        message: '',
        width: 15,
        height: 150,
        username: '',
        disconnected: false
    };
    ball: any = {
        x: 0,
        y: 0,
        radius: 5,
        velocity: 3,
        direction: {
            x: 0.0,
            y: 0.0
        }
    }
    powerUp: any = {
        x: 0,
        y: 0,
        time: 0,
        show: false,
        type: 0,
        active: false,
    }
    finished: boolean = false;
    gameID: string;
    isCustom: string = '';
    connected: number = 0;
    index: number = 0;
    winner: IPlayer;
    challenge: boolean = false;
    challenged: string = '';
}