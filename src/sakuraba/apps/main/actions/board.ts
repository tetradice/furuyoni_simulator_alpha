import * as  _ from "lodash";
import * as models from "sakuraba/models";
import * as utils from "sakuraba/utils";
import { Megami, CARD_DATA } from "sakuraba";
import cardActions from './card';
import { ActionsType } from ".";

type LogParam = {text: string, visibility?: LogVisibility};

export default {
    /** 複数の操作を行い、必要に応じてUndo履歴、ログを設定。同時にソケットに変更後ボードを送信 */
    operate: (p: {
        /** 
         * 元に戻す履歴の処理タイプ
         * undoable - 元に戻すことが可能 (デフォルト)
         * notBack - 操作を行うと元に戻せなくなる (履歴も削除される)
         * ignore - 元に戻す対象とならない
         */
        undoType?: 'undoable' | 'notBack' | 'ignore';
        
        /**
         * 操作ログに記録する内容
         */
        log?: string | string[] | LogParam[];

        /**
         * 実行する処理の内容
         */
        proc: () => void;
    }) => (state: state.State, actions: ActionsType) => {
        // アクションログを追加し、追加されたログレコードを取得
        let appendLogs: state.LogRecord[] = null;

        if(p.log !== undefined){
            if(typeof p.log === 'string'){
                actions.appendActionLog({text: p.log});
            } else if(p.log.length >= 1){
                if(typeof p.log[0] === 'string'){
                    (p.log as string[]).forEach((text) => actions.appendActionLog({text: text}));
                } else {
                    (p.log as LogParam[]).forEach((log) => actions.appendActionLog({text: log.text, visibility: log.visibility}));
                }
            }
        }

        // メイン処理の実行
        p.proc();

        // 追加されたログだけを新しいステートから切り出す
        let newState = actions.getState();
        let oldLength = state.actionLog.length;
        appendLogs = newState.actionLog.slice(oldLength);

        // 処理の実行が終わったら、socket.ioで更新後のボードの内容と、アクションログを送信
        if(newState.socket){
            newState.socket.emit('updateBoard', { tableId: newState.tableId, side: newState.side, board: newState.board, appendedActionLogs: appendLogs });
        }

        // 履歴を忘れるモードの場合は、ボード履歴を削除し、元に戻せないようにする
        if(p.undoType === 'notBack'){
            actions.forgetBoardHistory();
        }

        // 履歴の更新 (履歴を記録するモードの場合のみ)
        if(p.undoType === undefined || p.undoType === 'undoable'){
            let newHist: state.BoardHistoryItem = {board: state.board, appendedLogs: appendLogs};
            return {boardHistoryPast: state.boardHistoryPast.concat([newHist]), boardHistoryFuture: []};
        } else {
            // 履歴の更新が必要ない場合はnullを返す
            return null;
        }
    },

    /** ボード全体を設定する */
    setBoard: (newBoard: state.Board) => {
        return {board: newBoard};
    },

    /** ボードの領域情報のみを更新 */
    updateBoardRegionInfo: () => (state: state.State) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.updateRegionInfo();

        return {board: newBoard};
    },

    /** ボード全体を初期化する（プレイヤー名除く） */
    resetBoard: () => (state: state.State, actions: ActionsType) => {

        let extended: Partial<state.Board> = {playerNames: state.board.playerNames};
        return {board: _.extend(utils.createInitialState().board, extended)} as Partial<state.State>;
    },

    /** Undo */
    undoBoard: () => (state: state.State, actions: ActionsType) => {
        let newPast = state.boardHistoryPast.concat(); // clone array
        let newFuture = state.boardHistoryFuture.concat(); // clone array

        let recoveredHistItem = newPast.pop();
        newFuture.push({board: state.board, appendedLogs: recoveredHistItem.appendedLogs});

        // 処理の実行が終わったら、socket.ioで更新後のボードの内容と、アクションログを送信
        let appendLogs: state.LogRecord[] = [];
        let newActionLogs = actions.appendActionLog({text: `直前の操作を取り消しました`}).actionLog;
        let appendedLogs = [newActionLogs[newActionLogs.length - 1]];

        if(state.socket){
            state.socket.emit('updateBoard', { tableId: state.tableId, side: state.side, board: recoveredHistItem.board, appendedActionLogs: appendedLogs});
        }
        return {boardHistoryPast: newPast, boardHistoryFuture: newFuture, board: recoveredHistItem.board} as Partial<state.State>;
    },

    /** Redo */
    redoBoard: () => (state: state.State, actions: ActionsType) => {
        let newPast = state.boardHistoryPast.concat(); // clone array
        let newFuture = state.boardHistoryFuture.concat(); // clone array

        let recoveredHistItem = newFuture.pop();
        newPast.push({board: state.board, appendedLogs: recoveredHistItem.appendedLogs});

        // 処理の実行が終わったら、socket.ioで更新後のボードの内容と、アクションログを送信
        recoveredHistItem.appendedLogs.forEach(log => actions.appendActionLog({text: log.body, visibility: log.visibility}));

        if(state.socket){
            state.socket.emit('updateBoard', { tableId: state.tableId, side: state.side, board: recoveredHistItem.board, appendedActionLogs: recoveredHistItem.appendedLogs});
        }
        return {boardHistoryPast: newPast, boardHistoryFuture: newFuture, board: recoveredHistItem.board} as Partial<state.State>;
    },

    /** ボード履歴を削除して、Undo/Redoを禁止する */
    forgetBoardHistory: () => {
        return {boardHistoryPast: [], boardHistoryFuture: []} as Partial<state.State>;
    },

    /** 指定したサイドのプレイヤー名を設定する */
    setPlayerName: (p: {side: PlayerSide, name: string}) => (state: state.State) => {
        let newBoard = _.merge({}, state.board);
        newBoard.playerNames[p.side] = p.name;
        
        return {board: newBoard} as Partial<state.State>;
    },

    /** 観戦者情報をセット */
    setWatcherInfo: (p: {watchers: {[sessionId: string]: WatcherInfo}, currentWatcherSessionId?: string}) => (state: state.State) => {
        let newBoard = _.merge({}, state.board);
        newBoard.watchers = p.watchers;
        
        return {board: newBoard, currentWatcherSessionId: (p.currentWatcherSessionId === undefined ? null : p.currentWatcherSessionId)} as Partial<state.State>;
    },

    /** 指定したサイドのメガミを設定する */
    setMegamis: (p: {side: PlayerSide, megami1: Megami, megami2: Megami}) => (state: state.State, actions: ActionsType) => {
        let newBoard = _.merge({}, state.board);
        newBoard.megamis[p.side] = [p.megami1, p.megami2];
        
        return {board: newBoard} as Partial<state.State>;
    },

    /** 集中力の値を変更 */
    oprSetVigor: (p: {
        /** どちら側の集中力か */
        side: PlayerSide;
        /** 新しい集中力の値 */
        value: VigorValue;
    }) => (state: state.State, actions: ActionsType) => {
        let oldValue = state.board.vigors[p.side];

        // ログの内容を設定 (増加か減少かで変更)
        let logText: string;
        if(p.value >= oldValue){
            logText = `集中力を${p.value - oldValue}増やしました`;
        } else {
            logText = `集中力を${oldValue - p.value}減らしました`;
        }

        // 他の人の集中力を変更した場合
        if(p.side !== state.side){
            logText = `${state.board.playerNames[p.side]}の` + logText;
        }

        // 実行
        actions.operate({
            log: logText,
            proc: () => {
                actions.setVigor(p);
            }
        });
    }, 

    /** 集中力の値を変更 */
    setVigor: (p: {
        /** どちら側の集中力か */
        side: PlayerSide;
        /** 新しい集中力の値 */
        value: VigorValue;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.vigors[p.side] = p.value;

        return {board: newBoard};
    },

    /** 畏縮フラグを変更 */
    oprSetWitherFlag: (p: {
        /** どちら側の畏縮フラグか */
        side: PlayerSide;
        /** 新しい畏縮フラグの値 */
        value: boolean;
    }) => (state: state.State, actions: ActionsType) => {
        // ログの内容を設定
        let logText: string;
        if(p.value){
            if(p.side !== state.side){
                logText = `${state.board.playerNames[p.side]}を畏縮させました`;
            } else {
                logText = `畏縮しました`;
            }
        } else {
            if(p.side !== state.side){
                logText = `${state.board.playerNames[p.side]}の畏縮を解除しました`;
            } else {
                logText = `畏縮を解除しました`;
            }
        }

        // 実行
        actions.operate({
            log: logText,
            proc: () => {
                actions.setWitherFlag(p);
            }
        });
    }, 

    /** 畏縮フラグを変更 */
    setWitherFlag: (p: {
        /** どちら側の畏縮フラグか */
        side: PlayerSide;
        /** 新しい畏縮フラグの値 */
        value: boolean;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.witherFlags[p.side] = p.value;

        return {board: newBoard};
    },


    /** デッキのカードを設定する */
    setDeckCards: (p: {cardIds: string[]}) => (state: state.State, actions: ActionsType) => {
        if(state.side === 'watcher') throw `Forbidden operation for watcher`  // 観戦者は実行不可能な操作
        let side = state.side;

        // 自分の側のカードをすべて削除
        actions.clearDeckCards();

        // 選択されたカードを追加
        p.cardIds.forEach((id) => {
            const data = CARD_DATA[id];
            if(data.baseType === 'normal'){
                actions.addCard({side: side, region: 'library', cardId: id});
            }
            if(data.baseType === 'special'){
                actions.addCard({side: side, region: 'special', cardId: id});
            }           
        });
    },

    /** メガミを公開したフラグをセット */
    setMegamiOpenFlag: (p: {
        /** どちら側のフラグか */
        side: PlayerSide;
        /** 新しいフラグの値 */
        value: boolean;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.megamiOpenFlags[p.side] = p.value;

        return {board: newBoard};
    },

    /** 最初の手札を引いたフラグをセット */
    setFirstDrawFlag: (p: {
        /** どちら側のフラグか */
        side: PlayerSide;
        /** 新しいフラグの値 */
        value: boolean;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.firstDrawFlags[p.side] = p.value;

        return {board: newBoard};
    },

    /** マリガンフラグを変更 */
    setMariganFlag: (p: {
        /** どちら側のフラグか */
        side: PlayerSide;
        /** 新しいフラグの値 */
        value: boolean;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.mariganFlags[p.side] = p.value;

        return {board: newBoard};
    },

    /** 手札公開したフラグをセット */
    setHandOpenFlag: (p: {
        /** どちら側のフラグか */
        side: PlayerSide;
        /** 新しいフラグの値 */
        value: boolean;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        // 手札公開フラグを変更
        newBoard.handOpenFlags[p.side] = p.value;

        // OFFにした場合、カード個別の公開フラグは初期化
        newBoard.handCardOpenFlags[p.side] = {};

        // 領域情報を更新
        newBoard.updateRegionInfo();

        return {board: newBoard};
    },

    /** 手札の個別カード公開したフラグをセット */
    setHandCardOpenFlag: (p: {
        /** どちら側のフラグか */
        side: PlayerSide;
        /** カードのオブジェクトID */
        cardId: string;
        /** 新しいフラグの値 */
        value: boolean;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        // 手札公開フラグを変更
        newBoard.handCardOpenFlags[p.side][p.cardId] = p.value;

        // 領域情報を更新
        newBoard.updateRegionInfo();

        return {board: newBoard};
    },

    /** 計略の状態をセット */
    setPlanState: (p: {
        /** どちら側の計略か */
        side: PlayerSide;
        /** 新しい値 */
        value: PlanState;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        // 計略の状態をセット
        newBoard.planStatus[p.side] = p.value;

        return {board: newBoard};
    },

    /** 傘の状態をセット */
    setUmbrellaState: (p: {
        /** どちら側の傘か */
        side: PlayerSide;
        /** 新しい値 */
        value: UmbrellaState;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        // 計略の状態をセット
        newBoard.umbrellaStatus[p.side] = p.value;

        return {board: newBoard};
    },

    /** 風神ゲージを初期化 */
    resetWindGauge: (p: {
        /** どちら側の風雷ゲージか */
        side: PlayerSide;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.windGuage[p.side] = 0;

        return {board: newBoard};
    },

    /** 雷神ゲージを初期化 */
    resetThunderGauge: (p: {
        /** どちら側の風雷ゲージか */
        side: PlayerSide;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.thunderGuage[p.side] = 0;

        return {board: newBoard};
    },

    /** 風ゲージ+1 */
    incrementWindGuage: (p: {
        /** どちら側の風ゲージか */
        side: PlayerSide;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.windGuage[p.side] += 1;
        if(newBoard.windGuage[p.side] > 20) newBoard.windGuage[p.side] = 20;

        return {board: newBoard};
    },

    /** 雷ゲージ+1 */
    incrementThunderGuage: (p: {
        /** どちら側の雷ゲージか */
        side: PlayerSide;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.thunderGuage[p.side] += 1;
        if(newBoard.thunderGuage[p.side] > 20) newBoard.thunderGuage[p.side] = 20;

        return {board: newBoard};
    },

    /** 雷ゲージ2倍 */
    doubleThunderGuage: (p: {
        /** どちら側の雷ゲージか */
        side: PlayerSide;
    }) => (state: state.State, actions: ActionsType) => {
        let newBoard = models.Board.clone(state.board);
        newBoard.thunderGuage[p.side] *= 2;
        if(newBoard.thunderGuage[p.side] > 20) newBoard.thunderGuage[p.side] = 20;

        return {board: newBoard};
    },

    /** 最初の手札を引く */
    oprFirstDraw: () => (state: state.State, actions: ActionsType) => {
        actions.operate({
            undoType: 'notBack',
            proc: () => {
                if(state.side === 'watcher') throw `Forbidden operation for watcher`  // 観戦者は実行不可能な操作
        
                let board = new models.Board(state.board);

                // 山札をシャッフル
                actions.shuffle({side: state.side});

                // 山札を3枚引く
                actions.appendActionLog({text: `最初の手札3枚を引きました`});
                actions.draw({number: 3, cardNameLogging: true});

                // 最初の手札を引いたフラグをセット
                actions.setFirstDrawFlag({side: state.side, value: true});
            }
        });
    },
    
    /** 桜花結晶などを配置する */
    oprBoardSetup: () => (state: state.State, actions: ActionsType) => {
        actions.operate({
            undoType: 'notBack',
            proc: () => {
                if(state.side === 'watcher') throw `Forbidden operation for watcher`  // 観戦者は実行不可能な操作
        
                let board = new models.Board(state.board);

                // 桜花結晶を作り、同時に集中力をセット
                actions.addSakuraToken({side: state.side, region: 'aura', number: 3});
                actions.addSakuraToken({side: state.side, region: 'life', number: 10});
                actions.setVigor({side: state.side, value: 0});
                actions.appendActionLog({text: '桜花結晶と集中力を配置しました', visibility: 'shown'});

                // まだ間合が置かれていなければセット
                if(board.getRegionSakuraTokens(null, 'distance', null).length === 0){
                    actions.addSakuraToken({side: null, region: 'distance', number: 10});
                };

                // シンラがいれば計略トークンをセット
                if(board.megamis[state.side].find(m => m === 'shinra')){
                    actions.setPlanState({side: state.side, value: 'back-blue'});
                }
                // ユキヒがいれば傘カードをセット
                if(board.megamis[state.side].find(m => m === 'yukihi')){
                    actions.setUmbrellaState({side: state.side, value: 'closed'});
                }
                // チカゲがいれば毒カードをセット
                if(board.megamis[state.side].find(m => m === 'chikage')){
                    actions.addCard({side: state.side, region: 'extra', cardId: '09-chikage-o-p-1'});
                    actions.addCard({side: state.side, region: 'extra', cardId: '09-chikage-o-p-2'});
                    actions.addCard({side: state.side, region: 'extra', cardId: '09-chikage-o-p-3'});
                    actions.addCard({side: state.side, region: 'extra', cardId: '09-chikage-o-p-4'});
                    actions.addCard({side: state.side, region: 'extra', cardId: '09-chikage-o-p-4'});
                }
                // サリヤがいれば造花結晶とTransformカードをセット
                if(board.megamis[state.side].find(m => m === 'thallya')){
                    actions.addSakuraToken({side: state.side, region: 'machine', number: 5, artificial: true, ownerSide: state.side});

                    actions.addCard({side: state.side, region: 'extra', cardId: 'transform-01'});
                    actions.addCard({side: state.side, region: 'extra', cardId: 'transform-02'});
                    actions.addCard({side: state.side, region: 'extra', cardId: 'transform-03'});
                }
                // クルルがいればでゅーぷりぎあを3枚セット
                if(board.megamis[state.side].find(m => m === 'kururu')){
                    actions.addCard({side: state.side, region: 'extra', cardId: '10-kururu-o-s-3-ex1'});
                    actions.addCard({side: state.side, region: 'extra', cardId: '10-kururu-o-s-3-ex1'});
                    actions.addCard({side: state.side, region: 'extra', cardId: '10-kururu-o-s-3-ex1'});
                }
                // ライラがいれば追加切札と、風雷ゲージをセット
                if(board.megamis[state.side].find(m => m === 'raira')){
                    actions.addCard({side: state.side, region: 'extra', cardId: '12-raira-o-s-3-ex1'});
                    actions.addCard({side: state.side, region: 'extra', cardId: '12-raira-o-s-3-ex2'});
                    actions.addCard({side: state.side, region: 'extra', cardId: '12-raira-o-s-3-ex3'});
                    actions.resetWindGauge({side: state.side});
                    actions.resetThunderGauge({side: state.side});
                }
            }
        });
    },

    clearDeckCards: () => (state: state.State, actions: ActionsType) => {
        let board = models.Board.clone(state.board);
        _.remove(board.objects, o => (o.type === 'card' && o.side === state.side));
        board.updateRegionInfo();

        return {board: board};
    },

    /** ボードの状態を取得 */
    getState: () => (state: state.State) => state
}