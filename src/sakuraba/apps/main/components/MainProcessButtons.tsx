import { h, app, Children } from "hyperapp";
import { ActionsType } from "../actions";
import * as sakuraba from "sakuraba";
import * as utils from "sakuraba/utils";
import * as css from "./ControlPanel.css"
import * as models from "sakuraba/models";
import { Card, ProcessButton } from "sakuraba/apps/common/components";
import * as apps from "sakuraba/apps";


/** 処理を進めるためのボタンを表示 */
export const MainProcessButtons = (p: {left: number}) => (state: state.State, actions: ActionsType) => {
    if(state.side === 'watcher') return null; // 観戦者は表示しない
    let side = state.side;

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
    
        $.fn.form.settings.rules.originalMegamiEqual = function(value) {
            let megami1 = $('#MEGAMI1-SELECTION').val() as sakuraba.Megami;
            let megami2 = $('#MEGAMI2-SELECTION').val() as sakuraba.Megami;
            let megami1Base = (sakuraba.MEGAMI_DATA[megami1].base || megami1);
            let megami2Base = (sakuraba.MEGAMI_DATA[megami2].base || megami2);

            return megami1Base !== megami2Base;
        };
        let megami2Rule: SemanticUI.Form.Field = {
              identifier: 'megami2'
            , rules: [
                {type: 'originalMegamiEqual', prompt: '同じメガミを選択することはできません。'}
            ]
        };
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
            updateMegamiSelectModalView(); // 表示を更新
           
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

            // 全カード情報を取得しておく
            let allCardDataItem: sakuraba.CardDataItem[] = [];
            for(let key in sakuraba.CARD_DATA){
                allCardDataItem.push(sakuraba.CARD_DATA[key]);
            }

            // カードを追加する処理
            const addCardIds = (appendToCardIds: string[], megami: sakuraba.Megami, baseType: 'normal' | 'special') => {
                // 全カードを探索し、指定された種類のカードで追加札でないカードを、カードIDリストへ追加する
                for(let key in sakuraba.CARD_DATA){
                    let data = sakuraba.CARD_DATA[key];
                    let megamiData = sakuraba.MEGAMI_DATA[megami];
    
                    let replacedByAnother = allCardDataItem.find(x => x.anotherID !== undefined && x.replace === key);
    
                    if(data.baseType === baseType && !data.extra){
                        if(megamiData.anotherID){
                            // アナザーメガミである場合の所有カード判定
                            // 通常メガミが持ち、かつアナザーで置き換えられていないカードを追加
                            if(data.megami === megamiData.base && (data.anotherID === undefined) && !replacedByAnother){
                                appendToCardIds.push(key);
                            }
                            // アナザーメガミ用のカードを追加
                            if(data.megami === megamiData.base && (data.anotherID === megamiData.anotherID)){
                                appendToCardIds.push(key);
                            }
                        } else {
                            // 通常メガミである場合、メガミの種類が一致している通常カードを全て追加
                            if(data.megami === megami && (data.anotherID === undefined)){
                                appendToCardIds.push(key);
                            }
                        }
                    }
                }
            }
            // 1柱目の通常札 → 2柱目の通常札 → 1柱目の切札＋2柱目の切札 順に設定
            addCardIds(cardIds[0], state.board.megamis[state.side][0], 'normal');
            addCardIds(cardIds[1], state.board.megamis[state.side][1], 'normal');
            addCardIds(cardIds[2], state.board.megamis[state.side][0], 'special');
            addCardIds(cardIds[2], state.board.megamis[state.side][1], 'special');


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
                        
                        cardElements.push(<Card clickableClass target={card} opened descriptionViewable left={left} top={top} selected={selected} onclick={() => actions.selectCard(cardId)} zoom={state.zoom}></Card>);
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
            app(initialState, actDefinitions, view, document.getElementById('DECK-BUILD-MODAL'));
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
                }
            });
        });
    };
    let firstHandSet = () => {
        utils.confirmModal('手札を引くと、それ以降デッキの変更は行えません。<br>よろしいですか？', () => {
            actions.oprFirstDraw();
        });
    };

    let board = state.board;
    let deckBuilded = (boardModel.getSideCards(state.side).length >= 1);

    // コマンドボタンの決定
    let processButtons: Children = null;
    let top1 = 500;
    let top2 = 600;

    // プレイヤーである場合の処理
    if(state.board.mariganFlags[state.side]){
        // 手札の引き直しをするかどうかを確定した後は表示しない
    } else if(state.board.firstDrawFlags[state.side]){
        // 最初の手札を引いた後

        const marigan = () => {
            // マリガンダイアログを起動
            let board = new models.Board(state.board);
            
            let promise = new Promise<state.Card[]>((resolve, reject) => {
                let cards = board.getRegionCards(side, 'hand', null);
                let st = apps.mariganModal.State.create(side, cards, state.zoom, resolve, reject);
                apps.mariganModal.run(st, document.getElementById('MARIGAN-MODAL'));            
            }).then((selectedCards) => {
                // 一部のカードを山札の底に戻し、同じ枚数だけカードを引き直す
                actions.operate({
                    undoType: 'notBack',
                    log: `手札${selectedCards.length}枚を山札の底に置き、同じ枚数のカードを引き直しました`,
                    proc: () => {
                        // 選択したカードを山札の底に移動
                        selectedCards.forEach(card => {
                            actions.moveCard({from: card.id, to: [side, 'library', null], toPosition: 'first', cardNameLogging: true, cardNameLogTitle: '山札へ戻す'});
                        });

                        // 手札n枚を引く
                        actions.draw({number: selectedCards.length});
            
                        // マリガンフラグON
                        actions.setMariganFlag({side: side, value: true});

                        // 盤面をセットアップ
                        actions.oprBoardSetup();
                    }
                })

                utils.messageModal("桜花決闘を開始しました。<br>場のカードや桜花結晶を移動したい場合は、マウスでドラッグ操作を行ってください。");
            });
        };

        const notMarigan = () => {
            utils.confirmModal("手札の引き直しを行わずに、決闘を開始します。<br>よろしいですか？", () => {
                // マリガンフラグON
                actions.setMariganFlag({side: side, value: true});

                // 盤面のカードや桜花結晶などを配置して、メッセージを表示
                actions.oprBoardSetup({});
                utils.messageModal("桜花決闘を開始しました。<br>場のカードや桜花結晶を移動したい場合は、マウスでドラッグ操作を行ってください。");

            });

        }

        processButtons = (
            <div>
                <ProcessButton left={p.left} top={top1} zoom={state.zoom} onclick={marigan} primary>手札を引き直して決闘を開始</ProcessButton>
                <ProcessButton left={p.left} top={top2} zoom={state.zoom} onclick={notMarigan}>決闘を開始</ProcessButton>
            </div>
        );
    } else if(state.board.megamiOpenFlags[state.side]){
        // 選択したメガミを公開済みの場合
        processButtons = (
            <div>
                <ProcessButton left={p.left} top={top1} zoom={state.zoom} onclick={deckBuild} primary={!deckBuilded}>デッキ構築</ProcessButton>
                {deckBuilded ? <ProcessButton left={p.left} top={top2} zoom={state.zoom} onclick={firstHandSet} primary disabled={!deckBuilded}>最初の手札を引く</ProcessButton> : null}
            </div>
        );
    } else if(state.board.playerNames[state.side] !== null) {
        // まだメガミを公開済みでなく、プレイヤー名は決定済みである場合
        let megamiSelected = state.board.megamis[state.side] !== null;

        processButtons = (
            <div>
                <ProcessButton left={p.left} top={top1} zoom={state.zoom} onclick={megamiSelect} primary={!megamiSelected}>メガミ選択</ProcessButton>
                {megamiSelected ? <ProcessButton left={p.left} top={top2} zoom={state.zoom} onclick={megamiOpen} primary  disabled={!megamiSelected}>選択したメガミを公開</ProcessButton> : null}
            </div>
        );
    }
    return processButtons;
}