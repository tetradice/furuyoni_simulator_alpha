import { h } from "hyperapp";
import { ActionsType } from "../actions";
import * as utils from "sakuraba/utils";

/** 集中力 */
export const Vigor = (p: {side: PlayerSide, left: number, top: number}) => (state: state.State, actions: ActionsType) => {
    // DOMを返す
    let styles: Partial<CSSStyleDeclaration> = {
          left: `${p.left * state.zoom}px`
        , top: `${p.top * state.zoom}px`
        , width: `${140 * state.zoom}px`
        , height: `${100 * state.zoom}px`
    };
    let vigor = state.board.vigors[p.side];
    if(vigor === null) return null; // 集中力の値がnullなら何も表示しない


    let className = "fbs-vigor-card";
    if(vigor === 0) className += " rotated";
    if(vigor === 2) className += " reverse-rotated";
    if(p.side === utils.flipSide(state.side)) className += " opponent-side"; 

    return <div class={className} style={styles} data-side={p.side}>
        <div class={"vigor0" + (vigor !== 0 ? " clickable" : "")} onclick={() => actions.oprSetVigor({value: 0, side: p.side})}></div>
        <div class={"vigor1" + (vigor !== 1 ? " clickable" : "")} onclick={() => actions.oprSetVigor({value: 1, side: p.side})}></div>
        <div class={"vigor2" + (vigor !== 2 ? " clickable" : "")} onclick={() => actions.oprSetVigor({value: 2, side: p.side})}></div>
    </div>;
}