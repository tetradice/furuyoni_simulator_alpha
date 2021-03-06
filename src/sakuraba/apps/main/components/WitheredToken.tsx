import { h } from "hyperapp";
import { ActionsType } from "../actions";
import * as utils from "sakuraba/utils";

/** 集中力 */
export const WitheredToken = (p: {side: PlayerSide, left: number, top: number}) => (state: state.State, actions: ActionsType) => {
    // DOMを返す
    let styles: Partial<CSSStyleDeclaration> = {
          left: `${p.left * state.zoom}px`
        , top: `${p.top * state.zoom}px`
        , width: `${80 * state.zoom}px`
        , height: `${89 * state.zoom}px`
    };
    let className = "withered-token clickable";
    if(p.side === utils.flipSide(state.viewingSide)) className += " opponent-side"; 
    const onclick = (e) => {
        if(p.side === state.side){
            $('#CONTEXT-WITHERED-TOKEN-CLICK').contextMenu({x: e.pageX, y: e.pageY});
        }
    };
    if(state.board.witherFlags[p.side]){
        return <div data-side={p.side} class={className} style={styles} onclick={onclick}></div>;
    } else {
        return null;
    }
}