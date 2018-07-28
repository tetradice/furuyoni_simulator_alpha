import { h } from "hyperapp";

/** 領域枠 */
interface Param {
    region: SakuraTokenRegion;
    title: string;

    left: number;
    top: number;
    width: number;
    height: number;

    tokenCount?: number;
}

export const SakuraTokenAreaBackground = (p: Param) => (state: state.State) => {
    let styles: Partial<CSSStyleDeclaration> = {
          left: `${p.left}px`
        , top: `${p.top}px`
        , width: `${p.width}px`
        , height: `${p.height}px`
        , position: 'relative'
    };

    return (
        <div
            class={"area background sakura-token-region ui segment " + (state.draggingHoverSakuraTokenRegion === p.region ? 'over' : '')}
            style={styles}
            key={"SakuraTokenAreaBackground_" + p.region}
        >
            <div class="area-title">{p.title}</div>
        </div>
    );
}