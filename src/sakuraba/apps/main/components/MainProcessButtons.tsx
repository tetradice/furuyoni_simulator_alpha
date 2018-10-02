import { h, app, Children } from "hyperapp";
import { ActionsType } from "../actions";
import * as sakuraba from "sakuraba";
import * as utils from "sakuraba/utils";
import * as css from "./ControlPanel.css"
import { withLogger } from "@hyperapp/logger"
import * as models from "sakuraba/models";
import { Card, ProcessButton } from "sakuraba/apps/common/components";



/** 処理を進めるためのボタンを表示 */
export const MainProcessButtons = (p: {left: number}) => (state: state.State, actions: ActionsType) => {

    /** メガミ選択処理 */
    let megamiSelect = function(){
        if(state.side === 'watcher') throw `Forbidden operation for watcher`  // 観戦者は実行不可能な操作
        let side = state.side;

        // メガミ選択ダイアログでのボタン表示更新
        function updateMegamiSelectModalView(){
            let megami1 = $('#MEGAMI1-SELECTION').val() as string;
            let megami2 = $('#MEGAMI2-SELECTION').val() as string;

            if(megami1 !== '' && megami2 !== ''){
                $('#MEGAMI-SELECT-MODAL .positive.button').removeClass('disabled');
            } else {
                $('#MEGAMI-SELECT-MODAL .positive.button').addClass('disabled');
            }
        }
        
        // ドロップダウンの選択肢を設定
        $('#MEGAMI1-SELECTION').empty().append('<option></option>');
        $('#MEGAMI2-SELECTION').empty().append('<option></option>');
        for(let key in sakuraba.MEGAMI_DATA){
            let data = sakuraba.MEGAMI_DATA[key];
            $('#MEGAMI1-SELECTION').append(`<option value='${key}'>${data.name} (${data.symbol})</option>`);
            $('#MEGAMI2-SELECTION').append(`<option value='${key}'>${data.name} (${data.symbol})</option>`);
        }
    

        let megami2Rule: SemanticUI.Form.Field = {identifier: 'megami2', rules: [{type: 'different[megami1]', prompt: '同じメガミを選択することはできません。'}]};
        $('#MEGAMI-SELECT-MODAL .ui.form').form({
            fields: {
                megami2: megami2Rule
            }
        });
        $('#MEGAMI-SELECT-MODAL').modal({closable: false, autofocus: false, onShow: function(){
            let megamis = state.board.megamis[state.side];

            // メガミが選択済みであれば、あらかじめドロップダウンに設定しておく
            if(megamis !== null && megamis.length >= 1){
                $('#MEGAMI1-SELECTION').val(megamis[0]);
                $('#MEGAMI2-SELECTION').val(megamis[1]);
            }
            
        }, onApprove:function(){
            if(!$('#MEGAMI-SELECT-MODAL .ui.form').form('validate form')){
                return false;
            }
            
            // 選択したメガミを設定
            let megamis = [$('#MEGAMI1-SELECTION').val() as sakuraba.Megami, $('#MEGAMI2-SELECTION').val() as sakuraba.Megami];

            actions.operate({
                log: `メガミを選択しました`,
                proc: () => {
                    //actions.appendActionLog({text: `-> ${utils.getMegamiDispName(megamis[0])}、${utils.getMegamiDispName(megamis[1])}`, hidden: true});
                    actions.setMegamis({side: side, megami1: megamis[0], megami2: megamis[1]});
                }
            });

            return undefined;
        }}).modal('show');

        $('#MEGAMI1-SELECTION, #MEGAMI2-SELECTION').on('change', function(e){
            updateMegamiSelectModalView();
        });
    }

    /** デッキ構築処理 */
    let boardModel = new models.Board(state.board);
    let deckBuild = () => {
        if(state.side === 'watcher') throw `Forbidden operation for watcher`  // 観戦者は実行不可能な操作
        let side = state.side;

        let initialState = {
            shown: true,
            selectedCardIds: boardModel.getSideCards(state.side).filter(c => c.cardId).map(c => c.cardId),
        };

        // モーダル表示処理
        let promise = new Promise(function(resolve, reject){
            let cardIds: string[][] = [[], [], []];

            // 1柱目の通常札 → 2柱目の通常札 → すべての切札 順にソート。ただし追加札は除外
            for(let key in sakuraba.CARD_DATA){
                let data = sakuraba.CARD_DATA[key];
                if(data.megami === state.board.megamis[state.side][0] && data.baseType === 'normal' && !data.extra){
                    cardIds[0].push(key);
                }
                if(data.megami === state.board.megamis[state.side][1] && data.baseType === 'normal' && !data.extra){
                    cardIds[1].push(key);
                }
                if(state.board.megamis[state.side].indexOf(data.megami) >= 0 && data.baseType === 'special' && !data.extra){
                    cardIds[2].push(key);
                }
            }

            // デッキ構築エリアをセット
            let actDefinitions = {
                hide: () => {
                    return {shown: false};
                },
                selectCard: (cardId: string) => (state: typeof initialState) => {
                    let newSelectedCardIds = state.selectedCardIds.concat([]);

                    if(newSelectedCardIds.indexOf(cardId) >= 0){
                        // 選択OFF
                        newSelectedCardIds.splice(newSelectedCardIds.indexOf(cardId), 1);
                    } else {
                        // 選択ON
                        newSelectedCardIds.push(cardId)
                    }

                    return {selectedCardIds: newSelectedCardIds};
                },
            };
            let view = (deckBuildState: typeof initialState, actions: typeof actDefinitions) => {
                if(!deckBuildState.shown) return null;

                let cardElements: JSX.Element[] = [];
                cardIds.forEach((cardIdsInRow, r) => {
                    cardIdsInRow.forEach((cardId, c) => {
                        let card = utils.createCard(`deck-${cardId}`, cardId, null, side);
                        card.openState = 'opened';
                        let top = 4 + r * (160 + 8);
                        let left = 4 + c * (100 + 8);
                        let selected = deckBuildState.selectedCardIds.indexOf(cardId) >= 0;
                        
                        cardElements.push(<Card target={card} opened={true} descriptionViewable={true} left={left} top={top} selected={selected} onclick={() => actions.selectCard(cardId)} zoom={state.zoom}></Card>);
                    });
                });

                let normalCardCount = deckBuildState.selectedCardIds.filter(cardId => sakuraba.CARD_DATA[cardId].baseType === 'normal').length;
                let specialCardCount = deckBuildState.selectedCardIds.filter(cardId => sakuraba.CARD_DATA[cardId].baseType === 'special').length;

                let normalColor = (normalCardCount > 7 ? 'red' : (normalCardCount < 7 ? 'blue' : 'black'));
                let normalCardCountStyles: Partial<CSSStyleDeclaration> = {color: normalColor, fontWeight: (normalColor === 'black' ? 'normal' : 'bold')};
                let specialColor = (specialCardCount > 3 ? 'red' : (specialCardCount < 3 ? 'blue' : 'black'));
                let specialCardCountStyles: Partial<CSSStyleDeclaration> = {color: specialColor, fontWeight: (specialColor === 'black' ? 'normal' : 'bold')};

                let okButtonClass = "ui positive labeled icon button";
                if(normalCardCount !== 7 || specialCardCount !== 3) okButtonClass += " disabled";

                return(
                    <div class={"ui dimmer modals page visible active " + css.modalTop}>
                        <div class="ui modal visible active">
                            <div class="content">
                                <div class="description" style={{marginBottom: '2em'}}>
                                    <p>使用するカードを選択してください。</p>
                                </div>
                                <div class={css.outer}>
                                    <div class={css.cardArea} id="DECK-BUILD-CARD-AREA">
                                        {cardElements}
                                    </div>
                                </div>
                                <div class={css.countCaption}>通常札: <span style={normalCardCountStyles}>{normalCardCount}</span>/7　　切札: <span style={specialCardCountStyles}>{specialCardCount}</span>/3</div>
                            </div>
                            <div class="actions">
                                <div class={okButtonClass} onclick={() => {actions.hide(); resolve(deckBuildState)}}>
                                    決定 <i class="checkmark icon"></i>
                                </div>
                                <div class="ui black deny button" onclick={() => {actions.hide(); reject()}}>
                                    キャンセル
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }   
            withLogger(app)(initialState, actDefinitions, view, document.getElementById('DECK-BUILD-MODAL'));
        });

        // モーダル終了後の処理
        promise.then((finalState: typeof initialState) => {
            // 確定した場合、デッキを保存
            actions.operate({
                log: `デッキを構築しました`,
                proc: () => {
                    actions.setDeckCards({cardIds: finalState.selectedCardIds});
                }
            });
        }).catch((reason) => {
            
        });
    }

    let megamiOpen = () => {
        if(state.side === 'watcher') throw `Forbidden operation for watcher`  // 観戦者は実行不可能な操作
        let side = state.side;

        utils.confirmModal('選択したメガミ2柱を公開します。<br><br>この操作を行うと、それ以降メガミの変更は行えません。<br>よろしいですか？', () => {
            actions.operate({
                log: `選択したメガミを公開しました`,
                undoType: 'notBack',
                proc: () => {
                    actions.appendActionLog({text: `-> ${utils.getMegamiDispName(board.megamis[state.side][0])}、${utils.getMegamiDispName(board.megamis[state.side][1])}`});
                    actions.setMegamiOpenFlag({side: side, value: true});
                    utils.messageModal("次に、右上の「デッキ構築」ボタンをクリックし、デッキの構築を行ってください。");
                }
            });
        });
    };
    let firstHandSet = () => {
        utils.confirmModal('手札を引くと、それ以降デッキの変更は行えません。<br>よろしいですか？', () => {
            actions.oprBoardSetup({side: state.side});
        });
    };

    let board = state.board;
    let deckBuilded = (state.side !== 'watcher' && boardModel.getSideCards(state.side).length >= 1);

    // コマンドボタンの決定
    let processButtons: Children = null;
    let top1 = 500;
    let top2 = 600;

    if(state.side === 'watcher'){
        // 観戦者である場合の処理 (何も表示しない)
    } else {
        // プレイヤーである場合の処理
        if(state.board.firstDrawFlags[state.side]){
            // 最初の手札を引いたあとは表示無し
        } else if(state.board.megamiOpenFlags[state.side]){
            // 選択したメガミを公開済みの場合
            processButtons = (
                <div>
                    <ProcessButton left={p.left} top={top1} zoom={state.zoom} onclick={deckBuild} primary={!deckBuilded}>デッキ構築</ProcessButton>
                    {deckBuilded ? <ProcessButton left={p.left} top={top2} zoom={state.zoom} onclick={firstHandSet} primary disabled={!deckBuilded}>最初の手札を引く</ProcessButton> : null}
                </div>
            );
        } else {
            // まだメガミを公開済みでない場合
            let megamiSelected = state.board.megamis[state.side] !== null;
            processButtons = (
                <div>
                    <ProcessButton left={p.left} top={top1} zoom={state.zoom} onclick={megamiSelect} primary={!megamiSelected}>メガミ選択</ProcessButton>
                    {megamiSelected ? <ProcessButton left={p.left} top={top2} zoom={state.zoom} onclick={megamiOpen} primary  disabled={!megamiSelected}>選択したメガミを公開</ProcessButton> : null}
                </div>
            );
        }
    }
    return processButtons;
}