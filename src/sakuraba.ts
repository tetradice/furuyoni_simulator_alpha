export type Side = 'p1' | 'p2' | 'watch';

export class Board {
    data: BoardData;

    constructor(data?: BoardData){
        if(data !== undefined){
            this.data = data;
        } else {
            this.data = new BoardData();
        }
    }

    getMySide(side: Side){
        if(side === 'p1'){
            return this.data.p1Side;
        } else if(side === 'p2'){
            return this.data.p2Side;
        }
        return null;
    }

    getOpponentSide(side: Side){
        if(side === 'p1'){
            return this.data.p2Side;
        } else if(side === 'p2'){
            return this.data.p1Side;
        }
        return null;
    }
}

export class BoardData {
    dataVersion = 1;

    distance: number = 10;
    dust: number = 0;

    actionLog: LogRecord[] = [];
    chatLog: LogRecord[] = [];

    p1Side: BoardSide;
    p2Side: BoardSide;

    constructor(){
        this.p1Side = new BoardSide();
        this.p2Side = new BoardSide();
    }
}

export class BoardSide {
    playerName: string = null;

    megamis: string[] = null;

    aura: number = 3;
    life: number = 10;
    flair: number = 0;

    vigor: number = 0;

    library: Card[] = [];
    hands: Card[] = [];
    used: Card[] = [];
    hiddenUsed: Card[] = [];
}

export class LogRecord {
    text: string;
    created: Date;
}

export class Card {
    id: string;
    sakuraToken?: number;
}

export class SpecialCard extends Card {
    used: boolean = false;
}