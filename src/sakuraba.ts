import {Serializable, Serialize, SerializeProperty} from "ts-serializer";
import * as moment from 'moment';

// 独自型
export type CardType = "attack" | "reaction" | "action" | "fullpower" | "enhance" | "variable" | 'transform';

// 領域ごとの桜花結晶最大数
export const SAKURA_TOKEN_MAX: {[P in SakuraTokenRegion]: number} = {
      aura: 5
    , life: 99
    , flair: 99
    , distance: 10
    , dust: 99
    , 'on-card': 99
    , machine : 5
    , burned : 5
};

// メガミ情報
export interface MegamiDataItem {
    name: string;
    symbol: string;
    base?: string;
    anotherID?: string;
}
const MEGAMI_DATA_BASE = {
      'yurina':   {name: 'ユリナ', symbol: '刀'}
    , 'yurina-a1': {name: '第一章ユリナ', symbol: '古刀', base: 'yurina', anotherID: 'A1'}
    , 'saine':    {name: 'サイネ', symbol: '薙刀'}
    , 'saine-a1':  {name: '第二章サイネ', symbol: '琵琶', base: 'saine', anotherID: 'A1'}
    , 'himika':   {name: 'ヒミカ', symbol: '銃'}
    , 'himika-a1': {name: '原初ヒミカ', symbol: '炎', base: 'himika', anotherID: 'A1'}
    , 'tokoyo':   {name: 'トコヨ', symbol: '扇'}
    , 'tokoyo-a1': {name: '旅芸人トコヨ', symbol: '笛', base: 'tokoyo', anotherID: 'A1'}
    , 'oboro':    {name: 'オボロ', symbol: '忍'}
    , 'yukihi':   {name: 'ユキヒ', symbol: '傘/簪'}
    , 'shinra':   {name: 'シンラ', symbol: '書'}
    , 'hagane':   {name: 'ハガネ', symbol: '槌'}
    , 'chikage':  {name: 'チカゲ', symbol: '毒'}
    , 'kururu':   {name: 'クルル', symbol: '絡繰'}
    , 'thallya':  {name: 'サリヤ', symbol: '乗騎'}
    , 'raira':    {name: 'ライラ', symbol: '爪'}
    , 'utsuro':   {name: 'ウツロ', symbol: '鎌'}
};
export type Megami = keyof (typeof MEGAMI_DATA_BASE);
export const MEGAMI_DATA: {[megami: string]: MegamiDataItem} = MEGAMI_DATA_BASE;

// カード情報
interface CardDataItemBase {
    megami: Megami;
    name: string;
    anotherID?: string;
    replace?: string;
    ruby?: string;
    types: CardType[];
    range?: string;
    rangeOpened?: string;
    damage?: string;
    damageOpened?: string;
    capacity?: string;
    text: string;
    textOpened?: string;

    /** 他のカードを封印可能 */
    sealable?: boolean;
    /** 取り除くことが可能 */
    removable?: boolean;
    /** 毒 */
    poison?: boolean;
    /** 追加札かどうか */
    extra?: boolean;
}

export interface NormalCardDataItem extends CardDataItemBase {
    baseType: 'normal';
}


export interface SpecialCardDataItem extends CardDataItemBase {
    baseType: 'special';
    cost?: string;
}

export interface TransformCardDataItem extends CardDataItemBase {
    baseType: 'transform';
}


export type CardDataItem = NormalCardDataItem | SpecialCardDataItem | TransformCardDataItem;

export const CARD_DATA: {[key: string]: CardDataItem} = {
      '01-yurina-o-n-1': {megami: 'yurina', name: '斬', ruby: 'ざん', baseType: 'normal', types: ['attack'], range: '3-4', damage: '3/1', text: ''}
    , '01-yurina-A1-n-1': {megami: 'yurina', anotherID: 'A1', replace: '01-yurina-o-n-1', name: '乱打', ruby: 'らんだ', baseType: 'normal', types: ['attack'], range: '2', damage: '2/1', text: '【常時】決死-あなたのライフが3以下ならば、この《攻撃》は+0/+2となり、対応不可を得る。'}
    , '01-yurina-o-n-2': {megami: 'yurina', name: '一閃', ruby: 'いっせん', baseType: 'normal', types: ['attack'], range: '3', damage: '2/2', text: '【常時】決死-あなたのライフが3以下ならば、この《攻撃》は+1/+0となる。'}
    , '01-yurina-o-n-3': {megami: 'yurina', name: '柄打ち', ruby: 'つかうち', baseType: 'normal', types: ['attack'], range: '1-2', damage: '2/1', text: '【攻撃後】決死-あなたのライフが3以下ならば、このターンにあなたが次に行う《攻撃》は+1/+0となる。'}
    , '01-yurina-o-n-4': {megami: 'yurina', name: '居合', ruby: 'いあい', baseType: 'normal', types: ['attack', 'fullpower'], range: '2-4', damage: '4/3', text: '【常時】現在の間合が2以下ならば、この攻撃は-1/-1となる。'}
    , '01-yurina-o-n-5': {megami: 'yurina', name: '足捌き', ruby: 'あしさばき', baseType: 'normal', types: ['action'], text: '現在の間合が4以上ならば、間合→ダスト：2\n現在の間合が1以下ならば、ダスト→間合：2'}
    , '01-yurina-o-n-6': {megami: 'yurina', name: '圧気', ruby: 'あっき', baseType: 'normal', types: ['enhance'], capacity: '2', text: '隙\n【破棄時】攻撃『適正距離1-4、3/-』を行う。'}
    , '01-yurina-A1-n-6': {megami: 'yurina', anotherID: 'A1', replace: '01-yurina-o-n-6', name: '癇癪玉', ruby: 'かんしゃくだま ', baseType: 'normal', types: ['enhance', 'reaction'], capacity: '１', text: '【破棄時】攻撃『適正距離0-4、1/-、対応不可、【攻撃後】相手を畏縮させる』を行う。'}
    , '01-yurina-o-n-7': {megami: 'yurina', name: '気炎万丈', ruby: 'きえんばんじょう', baseType: 'normal', types: ['enhance', 'fullpower'], capacity: '4', text: '【展開中】決死-あなたのライフが3以下ならば、あなたの他のメガミによる《攻撃》は+1/+1となるとともに超克を得る。'}
    , '01-yurina-o-s-1': {megami: 'yurina', name: '月影落', ruby: 'つきかげおとし', baseType: 'special', types: ['attack'], range: '3-4', damage: '4/4', cost: '7', text: ''}
    , '01-yurina-o-s-2': {megami: 'yurina', name: '浦波嵐', ruby: 'うらなみあらし', baseType: 'special', types: ['attack', 'reaction'], range: '0-10', damage: '2/-', cost: '3', text: '【攻撃後】対応した《攻撃》は-2/+0となる。'}
    , '01-yurina-A1-s-2': {megami: 'yurina', anotherID: 'A1', replace: '01-yurina-o-s-2', name: '不完全浦波嵐', ruby: 'ふかんぜんうらなみあらし', baseType: 'special', types: ['attack', 'reaction'], range: '0-10', damage: '3/-', cost: '5', text: '【攻撃後】対応した《攻撃》は-3/+0となる。'}
    , '01-yurina-o-s-3': {megami: 'yurina', name: '浮舟宿', ruby: 'うきふねやどし', baseType: 'special', types: ['action'], cost: '2', text: 'ダスト→自オーラ：5 \n----\n【即再起】決死-あなたのライフが3以下になる。'}
    , '01-yurina-o-s-4': {megami: 'yurina', name: '天音揺波の底力', ruby: 'あまねゆりなのそこぢから', baseType: 'special', types: ['attack', 'fullpower'], range: '1-4', damage: '5/5', cost: '5', text: '【常時】決死-あなたのライフが3以下でないと、このカードは使用できない。'}

    , '02-saine-o-n-1': {megami: 'saine', name: '八方振り', ruby: 'はっぽうぶり', baseType: 'normal', types: ['attack'], range: '4-5', damage: '2/1', text: '【攻撃後】八相-あなたのオーラが0ならば、攻撃『適正距離4-5、2/1』を行う。'}
    , '02-saine-o-n-2': {megami: 'saine', name: '薙斬り', ruby: 'なぎぎり', baseType: 'normal', types: ['attack', 'reaction'], range: '4-5', damage: '3/1', text: ''}
    , '02-saine-o-n-3': {megami: 'saine', name: '返し刃', ruby: 'かえしやいば', baseType: 'normal', types: ['attack', 'reaction'], range: '3-5', damage: '1/1', text: '【攻撃後】このカードを対応で使用したならば、攻撃『適正距離3-5、2/1、対応不可』を行う。'}
    , '02-saine-A1-n-3': {megami: 'saine', anotherID: 'A1', replace: '02-saine-o-n-3', name: '氷の音', ruby: 'ひのね', baseType: 'normal', types: ['action', 'reaction'], text: '相オーラ→ダスト：1\nこのカードを対応で使用したならば、さらに\n相オーラ→ダスト：1'}
    , '02-saine-o-n-4': {megami: 'saine', name: '見切り', ruby: 'みきり', baseType: 'normal', types: ['action'], text: '【常時】八相-あなたのオーラが0ならば、このカードを《対応》を持つかのように相手の《攻撃》に割り込んで使用できる。\n間合⇔ダスト：1'}
    , '02-saine-o-n-5': {megami: 'saine', name: '圏域', ruby: 'けんいき', baseType: 'normal', types: ['enhance'], capacity: '3', text: '【展開時】ダスト→間合：1\n【展開中】達人の間合は2大きくなる。'}
    , '02-saine-o-n-6': {megami: 'saine', name: '衝音晶', ruby: 'しょうおんしょう', baseType: 'normal', types: ['enhance', 'reaction'], capacity: '1', text: '【展開時】対応した《攻撃》は-1/+0となる。\n【破棄時】攻撃『適正距離0-10、1/-、対応不可』を行う。'}
    , '02-saine-A1-n-6': {megami: 'saine', anotherID: 'A1', replace: '02-saine-o-n-6', name: '伴奏', ruby: 'ばんそう', baseType: 'normal', types: ['enhance'], capacity: '4', text: '【展開中】あなたの他のメガミの切札が1枚以上使用済ならば、各ターンの最初の相手の《攻撃》は-1/+0となる。\n【展開中】あなたのサイネの切札が1枚以上使用済ならば、各ターンにあなたが最初に使用する切札の消費は1少なくなる(0未満にはならない)。'}
    , '02-saine-o-n-7': {megami: 'saine', name: '無音壁', ruby: 'むおんへき', baseType: 'normal', types: ['enhance', 'fullpower'], capacity: '5', text: '【展開中】あなたへのダメージを解決するに際し、このカードの上に置かれた桜花結晶をあなたのオーラにあるかのように扱う。'}
    , '02-saine-o-s-1': {megami: 'saine', name: '律動弧戟', ruby: 'りつどうこげき', baseType: 'special', types: ['action'], cost: '6', text: '攻撃『適正距離3-4、1/1』を行う。\n攻撃『適正距離4-5、1/1』を行う。\n攻撃『適正距離3-5、2/2』を行う。'}
    , '02-saine-o-s-2': {megami: 'saine', name: '響鳴共振', ruby: 'きょうめいきょうしん', baseType: 'special', types: ['action'], cost: '8', text: '【常時】このカードの消費は相手のオーラの数だけ少なくなる。\n相オーラ→間合：2'}
    , '02-saine-A1-s-2': {megami: 'saine', anotherID: 'A1', replace: '02-saine-o-s-2', name: '二重奏:弾奏氷瞑', ruby: 'にじゅうそう:だんそうひょうめい', baseType: 'special', types: ['action'], cost: '2', text: '現在のフェイズを終了する。\n【使用済】あなたの他のメガミによる《攻撃》は+0/+1となる。\n----\n【即再起】あなたが再構成以外でライフに1以上のダメージを受ける。'}
    , '02-saine-o-s-3': {megami: 'saine', name: '音無砕氷', ruby: 'おとなしさいひょう', baseType: 'special', types: ['attack', 'reaction'], range: '0-10', damage: '1/1', cost: '2', text: '対応した《攻撃》は-1/-1となる。\n----\n【再起】八相-あなたのオーラが0である。'}
    , '02-saine-o-s-4': {megami: 'saine', name: '氷雨細音の果ての果て', ruby: 'ひさめさいねのはてのはて', baseType: 'special', types: ['attack', 'reaction'], range: '1-5', damage: '5/5', cost: '5', text: '【常時】このカードは切札に対する対応でしか使用できない。'}

    , '03-himika-o-n-1': {megami: 'himika', name: 'シュート', ruby: '', baseType: 'normal', types: ['attack'], range: '4-10', damage: '2/1', text: ''}
    , '03-himika-o-n-2': {megami: 'himika', name: 'ラピッドファイア', ruby: '', baseType: 'normal', types: ['attack'], range: '7-8', damage: '2/1', text: '【常時】連火-このカードがこのターンに使用した3枚目以降のカードならば、この《攻撃》は+1/+1となる。'}
    , '03-himika-A1-n-2': {megami: 'himika', anotherID: 'A1', replace: '03-himika-o-n-2', name: '火炎流', ruby: 'かえんりゅう', baseType: 'normal', types: ['attack'], range: '1-3', damage: '2/1', text: '【常時】連火-このカードがこのターンに使用した3枚目以降のカードならば、この《攻撃》は+0/+1となる。'}
    , '03-himika-o-n-3': {megami: 'himika', name: 'マグナムカノン', ruby: '', baseType: 'normal', types: ['attack'], range: '5-8', damage: '3/2', text: '【攻撃後】自ライフ→ダスト：1'}
    , '03-himika-o-n-4': {megami: 'himika', name: 'フルバースト', ruby: '', baseType: 'normal', types: ['attack', 'fullpower'], range: '5-9', damage: '3/1', text: '【常時】この《攻撃》がダメージを与えるならば、相手は片方を選ぶのではなく両方のダメージを受ける。'}
    , '03-himika-o-n-5': {megami: 'himika', name: 'バックステップ', ruby: '', baseType: 'normal', types: ['action'], text: 'カードを1枚引く。 \nダスト→間合：1'}
    , '03-himika-A1-n-5': {megami: 'himika', anotherID: 'A1', replace: '03-himika-o-n-5', name: '殺意', ruby: 'さつい', baseType: 'normal', types: ['action'], text: 'あなたの手札が0枚ならば、相オーラ→ダスト：2'}
    , '03-himika-o-n-6': {megami: 'himika', name: 'バックドラフト', ruby: '', baseType: 'normal', types: ['action'], text: '相手を畏縮させる。\n連火-このカードがこのターンに使用した3枚目以降のカードならば、このターンにあなたが次に行う他のメガミによる《攻撃》を+1/+1する。'}
    , '03-himika-o-n-7': {megami: 'himika', name: 'スモーク', ruby: '', baseType: 'normal', types: ['enhance'], capacity: '3', text: '【展開中】カードの矢印(→)により間合にある桜花結晶は移動しない。'}
    , '03-himika-o-s-1': {megami: 'himika', name: 'レッドバレット', ruby: '', baseType: 'special', types: ['attack'], range: '5-10', damage: '3/1', cost: '0', text: ''}
    , '03-himika-o-s-2': {megami: 'himika', name: 'クリムゾンゼロ', ruby: '', baseType: 'special', types: ['attack'], range: '0-2', damage: '2/2', cost: '5', text: '【常時】この《攻撃》がダメージを与えるならば、相手は片方を選ぶのではなく両方のダメージを受ける。\n【常時】現在の間合が0ならば、この《攻撃》は対応不可を得る。'}
    , '03-himika-A1-s-2': {megami: 'himika', anotherID: 'A1', replace: '03-himika-o-s-2', name: '炎天・紅緋弥香', ruby: 'えんてん・くれないひみか', baseType: 'special', types: ['attack', 'fullpower'], range: '0-6', damage: 'X/X', cost: '7', text: '対応不可 \n【常時】Xは7から現在の間合を引いた値に等しい。 \n【攻撃後】あなたは敗北する。'}
    , '03-himika-o-s-3': {megami: 'himika', name: 'スカーレットイマジン', ruby: '', baseType: 'special', types: ['action'], cost: '3', text: 'カードを2枚引く。その後、あなたは手札を1枚伏せ札にする。'}
    , '03-himika-o-s-4': {megami: 'himika', name: 'ヴァーミリオンフィールド', ruby: '', baseType: 'special', types: ['action'], cost: '2', text: '連火-このカードがこのターンに使用した3枚目以降のカードならば、ダスト→間合：2\n----\n【再起】あなたの手札が0枚である。'}
    
    , '04-tokoyo-o-n-1': {megami: 'tokoyo', name: '梳流し', ruby: 'すきながし', baseType: 'normal', types: ['attack'], range: '4', damage: '-/1', text: '【攻撃後】境地-あなたの集中力が2ならば、このカードを山札の上に戻す。'}
    , '04-tokoyo-A1-n-1': {megami: 'tokoyo', anotherID: 'A1', replace: '04-tokoyo-o-n-1', name: '奏流し', ruby: 'かなでながし', baseType: 'normal', types: ['attack'], range: '5', damage: '-/1', text: '【常時】あなたのトコヨの切札が1枚以上使用済ならば、この《攻撃》は対応不可を得る。 \n【攻撃後】境地-あなたの集中力が2かつ、あなたの他のメガミの切札が1枚以上使用済ならば、このカードを山札の上に置く。'}
    , '04-tokoyo-o-n-2': {megami: 'tokoyo', name: '雅打ち', ruby: 'みやびうち', baseType: 'normal', types: ['attack', 'reaction'], range: '2-4', damage: '2/1', text: '【攻撃後】境地-あなたの集中力が2ならば、対応した切札でない《攻撃》を打ち消す。'}
    , '04-tokoyo-o-n-3': {megami: 'tokoyo', name: '跳ね兎', ruby: 'はねうさぎ', baseType: 'normal', types: ['action'], text: '現在の間合が3以下ならば、ダスト→間合：2'}
    , '04-tokoyo-o-n-4': {megami: 'tokoyo', name: '詩舞', ruby: 'しぶ', baseType: 'normal', types: ['action', 'reaction'], text: '集中力を1得て、以下から1つを選ぶ。\n・自フレア→自オーラ：1\n・自オーラ→間合：1'}
    , '04-tokoyo-o-n-5': {megami: 'tokoyo', name: '要返し', ruby: 'かなめがえし', baseType: 'normal', types: ['action', 'fullpower'], text: '捨て札か伏せ札からカードを2枚まで選ぶ。それらのカードを好きな順で山札の底に置く。 \nダスト→自オーラ：2'}
    , '04-tokoyo-o-n-6': {megami: 'tokoyo', name: '風舞台', ruby: 'かぜぶたい', baseType: 'normal', types: ['enhance'], capacity: '2', text: '【展開時】間合→自オーラ：2 \n【破棄時】自オーラ→間合：2'}
    , '04-tokoyo-o-n-7': {megami: 'tokoyo', name: '晴舞台', ruby: 'はれぶたい', baseType: 'normal', types: ['enhance'], capacity: '1', text: '【破棄時】境地-あなたの集中力が2ならば、ダスト→自オーラ：2 \n【破棄時】境地-あなたは集中力を1得る。'}
    , '04-tokoyo-A1-n-7': {megami: 'tokoyo', anotherID: 'A1', replace: '04-tokoyo-o-n-7', name: '陽の音', ruby: 'ひのね', baseType: 'normal', types: ['enhance'], capacity: '2', text: '【展開時/展開中】展開時、およびあなたが《対応》カードを使用した時、その解決後にダスト→自オーラ：1 \n【展開中】相手のターンにこのカードの上の桜花結晶は移動しない。'}
    , '04-tokoyo-o-s-1': {megami: 'tokoyo', name: '久遠ノ花', ruby: 'くおんのはな', baseType: 'special', types: ['attack', 'reaction'], range: '0-10', damage: '-/1', cost: '5', text: '【攻撃後】対応した《攻撃》を打ち消す。'}
    , '04-tokoyo-o-s-2': {megami: 'tokoyo', name: '千歳ノ鳥', ruby: 'ちとせのとり', baseType: 'special', types: ['attack'], range: '3-4', damage: '2/2', cost: '2', text: '【攻撃後】山札を再構成する。 \n(その際にダメージは受けない)'}
    , '04-tokoyo-A1-s-2': {megami: 'tokoyo', anotherID: 'A1', replace: '04-tokoyo-o-s-2', name: '二重奏:吹弾陽明', ruby: 'にじゅうそう：すいだんようめい', baseType: 'special', types: ['action'], cost: '1', text: '【使用済】あなたの開始フェイズの開始時に捨て札または伏せ札からカード1枚を選び、それを山札の底に置いてもよい。 \n----\n【即再起】あなたが再構成以外でライフに1以上のダメージを受ける。'}
    , '04-tokoyo-o-s-3': {megami: 'tokoyo', name: '無窮ノ風', ruby: 'むきゅうのかぜ', baseType: 'special', types: ['attack'], range: '3-8', damage: '1/1', cost: '1', text: '対応不可 \n【攻撃後】相手は手札から《攻撃》でないカード1枚を捨て札にする。それが行えない場合、相手は手札を公開する。 \n----\n【再起】境地-あなたの集中力が2である。'}
    , '04-tokoyo-o-s-4': {megami: 'tokoyo', name: '常世ノ月', ruby: 'とこよのつき', baseType: 'special', types: ['action'], cost: '2', text: 'あなたの集中力は2になり、相手の集中力は0になり、相手を畏縮させる。'}
            
    , '05-oboro-o-n-1': {megami: 'oboro', name: '鋼糸', ruby: 'こうし', baseType: 'normal', types: ['attack'], range: '3-4', damage: '2/2', text: '設置'}
    , '05-oboro-o-n-2': {megami: 'oboro', name: '影菱', ruby: 'かげびし', baseType: 'normal', types: ['attack'], range: '2', damage: '2/1', text: '設置　対応不可\n【攻撃後】このカードを伏せ札から使用したならば、相手の手札を見てその中から1枚を選び、それを伏せ札にする。'}
    , '05-oboro-o-n-3': {megami: 'oboro', name: '斬撃乱舞', ruby: 'ざんげきらんぶ', baseType: 'normal', types: ['attack', 'fullpower'], range: '2-4', damage: '3/2', text: '【常時】相手がこのターン中にオーラへのダメージを受けているならば、この《攻撃》は+1/+1となる。'}
    , '05-oboro-o-n-4': {megami: 'oboro', name: '忍歩', ruby: 'にんぽ', baseType: 'normal', types: ['action'], text: '設置 \n間合⇔ダスト：1 \nこのカードを伏せ札から使用したならば、伏せ札から設置を持つカードを1枚使用してもよい。'}
    , '05-oboro-o-n-5': {megami: 'oboro', name: '誘導', ruby: 'ゆうどう', baseType: 'normal', types: ['action', 'reaction'], text: '設置\n以下から１つを選ぶ。\n・間合→相オーラ：1\n・相オーラ→相フレア：1'}
    , '05-oboro-o-n-6': {megami: 'oboro', name: '分身の術', ruby: 'ぶんしんのじゅつ', baseType: 'normal', types: ['action', 'fullpower'], text: '伏せ札から《全力》でないカードを1枚選び、そのカードを使用する。その後、そのカードが捨て札にあるならば捨て札からもう1回使用する。《攻撃》カードが使用されたならばそれらの《攻撃》は対応不可を得る（2回ともに対応不可を得る）。'}
    , '05-oboro-o-n-7': {megami: 'oboro', name: '生体活性', ruby: 'せいたいかっせい', baseType: 'normal', types: ['enhance'], capacity: '4', text: '隙　設置 \n【破棄時】あなたの使用済の切札を1枚選び、それを未使用に戻す。'}
    , '05-oboro-o-s-1': {megami: 'oboro', name: '熊介', ruby: 'くますけ', baseType: 'special', types: ['attack', 'fullpower'], range: '3-4', damage: '2/2', cost: '4', text: '【攻撃後】攻撃『適正距離3-4、2/2』をX回行う。Xはあなたの伏せ札の枚数に等しい。'}
    , '05-oboro-o-s-2': {megami: 'oboro', name: '鳶影', ruby: 'とびかげ', baseType: 'special', types: ['action', 'reaction'], cost: '3', text: '伏せ札から《全力》でないカードを1枚選び、そのカードを使用してもよい。この際、このカードが対応している《攻撃》があるならば、使用されたカードはそれに対応しているものと扱う。'}
    , '05-oboro-o-s-3': {megami: 'oboro', name: '虚魚', ruby: 'うろうお', baseType: 'special', types: ['action'], cost: '4', text: '【使用済】あなたは1回の再構成に対して、設置を持つカードを任意の枚数、任意の順で使用できる。'}
    , '05-oboro-o-s-4': {megami: 'oboro', name: '壬蔓', ruby: 'みかずら', baseType: 'special', types: ['action'], cost: '0', text: '相オーラ→自フレア：1 \n----\n【再起】あなたのフレアが0である。'}

    , '06-yukihi-o-n-1': {megami: 'yukihi', name: 'しこみばり / ふくみばり', ruby: '', baseType: 'normal', types: ['attack'], range: '4-6', rangeOpened: '0-2', damage: '3/1', damageOpened: '1/2', text: '', textOpened: ''}
    , '06-yukihi-o-n-2': {megami: 'yukihi', name: 'しこみび / ねこだまし', ruby: '', baseType: 'normal', types: ['attack'], range: '5-6', rangeOpened: '0-2', damage: '1/1', damageOpened: '1/1', text: '【攻撃後】このカードを手札に戻し、傘の開閉を行う。 ', textOpened: ''}
    , '06-yukihi-o-n-3': {megami: 'yukihi', name: 'ふりはらい / たぐりよせ', ruby: '', baseType: 'normal', types: ['attack'], range: '2-5', rangeOpened: '0-2', damage: '1/1', damageOpened: '1/1', text: '【攻撃後】ダスト⇔間合：1 ', textOpened: '【攻撃後】間合→ダスト：2'}
    , '06-yukihi-o-n-4': {megami: 'yukihi', name: 'ふりまわし / つきさし', ruby: '', baseType: 'normal', types: ['attack', 'fullpower'], range: '4-6', rangeOpened: '0-2', damage: '5/-', damageOpened: '-/2', text: '', textOpened: ''}
    , '06-yukihi-o-n-5': {megami: 'yukihi', name: 'かさまわし', ruby: '', baseType: 'normal', types: ['action'], text: '(このカードは使用しても効果はない) \n【常時】あなたが傘の開閉を行った時、このカードを手札から公開してもよい。そうした場合、 \nダスト→自オーラ：1\n', textOpened: ''}
    , '06-yukihi-o-n-6': {megami: 'yukihi', name: 'ひきあし / もぐりこみ', ruby: '', baseType: 'normal', types: ['action', 'reaction'], text: 'ダスト→間合：1 ', textOpened: '間合→ダスト：1'}
    , '06-yukihi-o-n-7': {megami: 'yukihi', name: 'えんむすび', ruby: '', baseType: 'normal', types: ['enhance'], capacity: '2', text: '【展開時】間合→ダスト：1 \n【破棄時】ダスト→間合：1 \n【常時】あなたの傘が開いているならば、このカードの矢印(→)は逆になる。', textOpened: ''}
    , '06-yukihi-o-s-1': {megami: 'yukihi', name: 'はらりゆき', ruby: '', baseType: 'special', types: ['attack'], range: '3-5', rangeOpened: '0-1', damage: '3/1', damageOpened: '0/0', cost: '2', text: '', textOpened: '----\n【即再起】あなたが傘の開閉を行う。 '}
    , '06-yukihi-o-s-2': {megami: 'yukihi', name: 'ゆらりび', ruby: '', baseType: 'special', types: ['attack'], range: '4-6', rangeOpened: '0', damage: '0/0', damageOpened: '4/5', cost: '5', text: '', textOpened: ''}
    , '06-yukihi-o-s-3': {megami: 'yukihi', name: 'どろりうら', ruby: '', baseType: 'special', types: ['enhance', 'fullpower'], capacity: '7', cost: '3', text: '【展開中】あなたのユキヒの《攻撃》は傘を開いた状態と傘を閉じた状態両方の適正距離を持つ。', textOpened: ''}
    , '06-yukihi-o-s-4': {megami: 'yukihi', name: 'くるりみ', ruby: '', baseType: 'special', types: ['action', 'reaction'], cost: '1', text: '傘の開閉を行う。 \nダスト→自オーラ：1', textOpened: ''}
 
    , '07-shinra-o-n-1': {megami: 'shinra', name: '立論', ruby: 'りつろん', baseType: 'normal', types: ['attack'], range: '2-7', damage: '2/-', text: '【常時】相手の山札に2枚以上のカードがあるならば、この《攻撃》はダメージを与える代わりに山札の上から2枚を伏せ札にする。'}
    , '07-shinra-o-n-2': {megami: 'shinra', name: '反論', ruby: 'はんろん', baseType: 'normal', types: ['attack', 'reaction'], range: '2-7', damage: '1/-', text: '【攻撃後】対応した切札でなく、オーラへのダメージが3以上である《攻撃》のダメージを打ち消す。 \n【攻撃後】相手はカードを1枚引く。'}
    , '07-shinra-o-n-3': {megami: 'shinra', name: '詭弁', ruby: 'きべん', baseType: 'normal', types: ['attack', 'fullpower'], range: '3-8', damage: '-/1', text: '【攻撃後】計略を実行し、次の計略を準備する。 \n[神算] 相手の山札の上から3枚を伏せ札にする。 \n[鬼謀] 相手の捨て札にあるカードを1枚選び、それを使用してもよい。'}
    , '07-shinra-o-n-4': {megami: 'shinra', name: '引用', ruby: 'いんよう', baseType: 'normal', types: ['action'], text: '相手の手札を見て、《攻撃》カードを1枚選んでもよい。そうした場合、そのカードを使用するか伏せ札にする。その後、そのカードが《全力》を持つならば現在のフェイズを終了する。'}
    , '07-shinra-o-n-5': {megami: 'shinra', name: '煽動', ruby: 'せんどう', baseType: 'normal', types: ['action', 'reaction'], text: '計略を実行し、次の計略を準備する。 \n[神算] ダスト→間合：1 \n[鬼謀] 間合→相オーラ：1'}
    , '07-shinra-o-n-6': {megami: 'shinra', name: '壮語', ruby: 'そうご', baseType: 'normal', types: ['enhance'], capacity: '2', text: '【破棄時】計略を実行し、次の計略を準備する。 \n[神算] あなたの集中力は1増加し、このカードを山札の一番上に置く。 \n[鬼謀] 相手は手札が2枚以上ならば、手札を1枚になるまで捨て札にする。相手の集中力は0になる。'}
    , '07-shinra-o-n-7': {megami: 'shinra', name: '論破', ruby: 'ろんぱ', baseType: 'normal', types: ['enhance'], capacity: '4', text: '【展開時】相手の捨て札にあるカード1枚を選び、このカードの下に封印する。 \n【破棄時】このカードに封印されたカードを相手の捨て札に戻す。', sealable: true}
    , '07-shinra-o-s-1': {megami: 'shinra', name: '完全論破', ruby: 'かんぜんろんぱ', baseType: 'special', types: ['action'], cost: '4', text: '相手の捨て札にあるカード1枚を選び、このカードの下に封印する。 \n(ゲーム中に戻ることはない)', sealable: true}
    , '07-shinra-o-s-2': {megami: 'shinra', name: '皆式理解', ruby: 'かいしきりかい', baseType: 'special', types: ['action'], cost: '2', text: '計略を実行し、次の計略を準備する。 \n[神算] あなたの捨て札または使用済の切札から、消費を支払わずに《付与》カード1枚を使用する。そのカードが《全力》ならば現在のフェイズを終了する。 \n[鬼謀] 切札でない相手の付与札を1枚選ぶ。その上の桜花結晶全てをダストに送る。'}
    , '07-shinra-o-s-3': {megami: 'shinra', name: '天地反駁', ruby: 'てんちはんぱく', baseType: 'special', types: ['enhance', 'fullpower'], capacity: '5', cost: '2', text: '【展開中】あなたの《攻撃》のオーラへのダメージとライフへのダメージを入れ替える。 \n（ダメージの入れ替えは、ダメージの増減より先に適用される）'}
    , '07-shinra-o-s-4': {megami: 'shinra', name: '森羅判証', ruby: 'しんらばんしょう', baseType: 'special', types: ['enhance'], capacity: '6', cost: '6', text: '【展開時】ダスト→自ライフ：2 \n【展開中】あなたの他の付与札が破棄された時、相手のライフに1ダメージを与える。 \n【破棄時】あなたは敗北する。'}
 
    , '08-hagane-o-n-1': {megami: 'hagane', name: '遠心撃', ruby: 'えんしんげき', baseType: 'normal', types: ['attack'], range: '2-6', damage: '5/3', text: '遠心 \n【攻撃後】現在のターンがあなたのターンならば、あなたと相手の手札を全て伏せ札にし、あなたの集中力は0になり、現在のフェイズを終了する。'}
    , '08-hagane-o-n-2': {megami: 'hagane', name: '砂風塵', ruby: 'さふうじん', baseType: 'normal', types: ['attack'], range: '0-6', damage: '1/-', text: '【攻撃後】現在の間合がターン開始時の間合から2以上変化しているならば、相手の手札を1枚無作為に選び、それを捨て札にする。'}
    , '08-hagane-o-n-3': {megami: 'hagane', name: '大地砕き', ruby: 'だいちくだき', baseType: 'normal', types: ['attack', 'fullpower'], range: '0-3', damage: '2/-', text: '対応不可 \n【攻撃後】相手の集中力は0になり、相手を畏縮させる。'}
    , '08-hagane-o-n-4': {megami: 'hagane', name: '超反発', ruby: 'ちょうはんぱつ', baseType: 'normal', types: ['action'], text: '現在の間合が4以下ならば、相フレア→間合：1'}
    , '08-hagane-o-n-5': {megami: 'hagane', name: '円舞錬', ruby: 'えんぶれん', baseType: 'normal', types: ['action'], text: '遠心 \n相手のフレアが3以上ならば、相フレア→自オーラ：2'}
    , '08-hagane-o-n-6': {megami: 'hagane', name: '鐘鳴らし', ruby: 'かねならし', baseType: 'normal', types: ['action'], text: '遠心 \n以下から１つを選ぶ。\n・このターンにあなたが次に行う《攻撃》は対応不可を得る。\n・このターンにあなたが次に行う《攻撃》はオーラへのダメージが3以上ならば+0/+1、そうでないならば+2/+0となる。'}
    , '08-hagane-o-n-7': {megami: 'hagane', name: '引力場', ruby: 'いんりょくば', baseType: 'normal', types: ['enhance'], capacity: '4', text: '【展開時】間合→ダスト：1 \n【展開中】達人の間合は1小さくなる。'}
    , '08-hagane-o-s-1': {megami: 'hagane', name: '大天空クラッシュ', ruby: 'だいてんくうクラッシュ', baseType: 'special', types: ['attack'], range: '0-10', damage: 'X/Y', cost: '5', text: '超克 \n【常時】Xは現在の間合がターン開始時の間合からどれだけ変化しているかに等しい。YはXの半分(切り上げ)に等しい。'}
    , '08-hagane-o-s-2': {megami: 'hagane', name: '大破鐘メガロベル', ruby: 'だいはがねメガロベル', baseType: 'special', types: ['action'], cost: '2', text: 'あなたの他の切札が全て使用済ならば、ダスト→自ライフ：2'}
    , '08-hagane-o-s-3': {megami: 'hagane', name: '大重力アトラクト', ruby: 'だいじゅうりょくアトラクト', baseType: 'special', types: ['action'], cost: '5', text: '間合→自フレア：3 \n----\n【再起】このターンにあなたが遠心を持つカードを使用しており、このカードを使用していない。'}
    , '08-hagane-o-s-4': {megami: 'hagane', name: '大山脈リスペクト', ruby: 'だいさんみゃくリスペクト', baseType: 'special', types: ['action'], cost: '4', text: '遠心 \nあなたの捨て札にある異なる《全力》でないカードを2枚まで選び、任意の順番で使用する。'}
  
    , '09-chikage-o-n-1': {megami: 'chikage', name: '飛苦無', ruby: 'とびくない', baseType: 'normal', types: ['attack'], range: '4-5', damage: '2/2', text: ''}
    , '09-chikage-o-n-2': {megami: 'chikage', name: '毒針', ruby: 'どくばり', baseType: 'normal', types: ['attack'], range: '4', damage: '1/1', text: '【攻撃後】毒袋から「麻痺毒」「幻覚毒」「弛緩毒」のいずれか1枚を選び、そのカードを相手の山札の一番上に置く。'}
    , '09-chikage-o-n-3': {megami: 'chikage', name: '遁術', ruby: 'とんじゅつ', baseType: 'normal', types: ['attack', 'reaction'], range: '1-3', damage: '1/-', text: '【攻撃後】自オーラ→間合：2 \n【攻撃後】このターン中、全てのプレイヤーは基本動作《前進》を行えない。'}
    , '09-chikage-o-n-4': {megami: 'chikage', name: '首切り', ruby: 'くびきり', baseType: 'normal', types: ['attack', 'fullpower'], range: '0-3', damage: '2/3', text: '【攻撃後】相手の手札が2枚以上あるならば、相手は手札を1枚捨て札にする。'}
    , '09-chikage-o-n-5': {megami: 'chikage', name: '毒霧', ruby: 'どくぎり', baseType: 'normal', types: ['action'], text: '毒袋から「麻痺毒」「幻覚毒」「弛緩毒」のいずれか1枚を選び、そのカードを相手の手札に加える。'}
    , '09-chikage-o-n-6': {megami: 'chikage', name: '抜き足', ruby: 'ぬきあし', baseType: 'normal', types: ['enhance'], capacity: '4', text: '隙 \n【展開中】現在の間合は2減少する。 \n(間合は0未満にならない)'}
    , '09-chikage-o-n-7': {megami: 'chikage', name: '泥濘', ruby: 'でいねい', baseType: 'normal', types: ['enhance'], capacity: '2', text: '【展開中】相手は基本動作《後退》と《離脱》を行えない。'}
    , '09-chikage-o-s-1': {megami: 'chikage', name: '滅灯の魂毒', ruby: 'ほろびのみたまどく', baseType: 'special', types: ['action'], cost: '3', text: '毒袋から「滅灯毒」を1枚を選び、そのカードを相手の山札の一番上に置く。'}
    , '09-chikage-o-s-2': {megami: 'chikage', name: '叛旗の纏毒', ruby: 'はんきのまといどく', baseType: 'special', types: ['enhance', 'reaction'], capacity: '5', cost: '2', text: '【展開中】相手によるオーラへのダメージかライフへのダメージのどちらかが「-」である《攻撃》は打ち消される。'}
    , '09-chikage-o-s-3': {megami: 'chikage', name: '流転の霞毒', ruby: 'るてんのかすみどく', baseType: 'special', types: ['attack'], range: '3-7', damage: '1/2', cost: '1', text: '【再起】相手の手札が2枚以上ある。'}
    , '09-chikage-o-s-4': {megami: 'chikage', name: '闇昏千影の生きる道', ruby: 'やみくらちかげのいきるみち', baseType: 'special', types: ['enhance', 'fullpower'], capacity: '4', cost: '5', text: '【展開中】あなたが1以上のライフへのダメージを受けた時、このカードの上の桜花結晶は全てダストに送られ、このカードは未使用に戻る。 \n(破棄時効果は失敗する) \n【破棄時】あなたの他の切札が全て使用済ならば、あなたは勝利する。'}
    , '09-chikage-o-p-1': {megami: 'chikage', name: '麻痺毒', ruby: 'まひどく', extra: true, poison: true, baseType: 'normal', types: ['action'], text: '毒（このカードは伏せ札にできない） \n【常時】このターン中にあなたが基本動作を行ったならば、このカードは使用できない。 \nこのカードを相手の毒袋に戻す。その後、このフェイズを終了する。'}
    , '09-chikage-o-p-2': {megami: 'chikage', name: '幻覚毒', ruby: 'げんかくどく', extra: true, poison: true, baseType: 'normal', types: ['action'], text: '毒（このカードは伏せ札にできない） \nこのカードを相手の毒袋に戻す。 \n自フレア→ダスト：2'}
    , '09-chikage-o-p-3': {megami: 'chikage', name: '弛緩毒', ruby: 'しかんどく', extra: true, poison: true, baseType: 'normal', types: ['enhance'], capacity: '3', text: '毒（このカードは伏せ札にできない） \n【展開中】あなたは《攻撃》カードを使用できない。 \n【破棄時】このカードを相手の毒袋に戻す。'}
    , '09-chikage-o-p-4': {megami: 'chikage', name: '滅灯毒', ruby: 'ほろびどく', extra: true, poison: true, baseType: 'normal', types: ['action'], text: '毒（このカードは伏せ札にできない） \n自オーラ→ダスト：3'}
  
    , '10-kururu-o-n-1': {megami: 'kururu', name: 'えれきてる', ruby: '', baseType: 'normal', types: ['action'], text: '----\n<行行行対対> 相手のライフに1ダメージを与える。 '}
    , '10-kururu-o-n-2': {megami: 'kururu', name: 'あくせらー', ruby: '', baseType: 'normal', types: ['action'], text: '----\n<行行付> あなたの手札から《全力》カードを1枚選び、そのカードを使用してもよい。 \n(フェイズは終了しない) '}
    , '10-kururu-o-n-3': {megami: 'kururu', name: 'くるるーん', ruby: '', baseType: 'normal', types: ['action', 'reaction'], text: '【常時】このカードは対応でしか使用できない。 \n以下から2つまでを選び、任意の順に行う。 \n(同じものを2回選ぶことはできない)\n・カードを1枚引く。\n・伏せ札1枚を山札の底に置く。\n・相手は手札を1枚捨て札にする。'}
    , '10-kururu-o-n-4': {megami: 'kururu', name: 'とるねーど', ruby: '', baseType: 'normal', types: ['action', 'fullpower'], text: '----\n<攻攻> 相手のオーラに5ダメージを与える。 \n----\n<付付> 相手のライフに1ダメージを与える。'}
    , '10-kururu-o-n-5': {megami: 'kururu', name: 'りげいなー', ruby: '', baseType: 'normal', types: ['action', 'fullpower'], text: '----\n<攻対> あなたの使用済の切札を1枚選んでもよい。そのカードを消費を支払わずに使用する。(《全力》カードでもよい) \n----\nあなたの集中力は0になる。'}
    , '10-kururu-o-n-6': {megami: 'kururu', name: 'もじゅるー', ruby: '', baseType: 'normal', types: ['enhance'], capacity: '3', text: '【展開中】あなたが《行動》カードを使用した時、その解決後に基本動作を1回行ってもよい。'}
    , '10-kururu-o-n-7': {megami: 'kururu', name: 'りふれくた', ruby: '', baseType: 'normal', types: ['enhance'], capacity: '0', text: '----\n<攻対> 【展開時】このカードの上に桜花結晶を4個ダストから置く。 \n----\n【展開中】各ターンにおける相手の2回目の《攻撃》は打ち消される。\n'}
    , '10-kururu-o-s-1': {megami: 'kururu', name: 'どれーんでびる', ruby: '', baseType: 'special', types: ['action', 'reaction'], cost: '2', text: '相オーラ→自オーラ：1 \n【使用済】あなたの使用済の切札が未使用に戻った時、このカードを消費を支払わずに使用してもよい。'}
    , '10-kururu-o-s-2': {megami: 'kururu', name: 'びっぐごーれむ', ruby: '', baseType: 'special', types: ['action'], cost: '4', text: '----\n<対全全> 【使用済】あなたの終了フェイズに相手のライフに1ダメージを与えてもよい。そうした場合、山札を再構成する。 \n----\n【使用済】あなたが《全力》カードを使用した時、その解決後に基本動作を1回行ってもよい。\n'}
    , '10-kururu-o-s-3': {megami: 'kururu', name: 'いんだすとりあ', ruby: '', baseType: 'special', types: ['action'], cost: '1', text: 'このカードにカードが封印されていないならば、あなたの手札から《付与》でないカードを1枚選び、そのカードをこのカードの下に表向きで封印してもよい。 \nあなたの追加札から「でゅーぷりぎあ」を山札の底に1枚置く(最大で合計3枚)。 \n----\n【即再起】あなたが山札を再構成する(再構成の後に未使用に戻る)。', sealable: true}
    , '10-kururu-o-s-4': {megami: 'kururu', name: '神渉装置:枢式', ruby: 'かんしょうそうち　くるるしき', baseType: 'special', types: ['action'], cost: '3', text: '----\n<攻攻行行行付付> 相手の切札を見て、その中から1枚選び、それを使用済にしてもよい。\n----\n相手の使用済の切札1枚を選んでもよい。そのカードを消費を支払わずに使用する(《全力》カードでもよい)。その後、このカードを取り除く。', removable: true}
    , '10-kururu-o-s-3-ex1': {megami: 'kururu', name: 'でゅーぷりぎあ', ruby: '', extra: true, baseType: 'normal', types: ['variable'], text: '(カードタイプが不定のカードは使用できない) \n【常時】このカードはあなたの「いんだすとりあ」に封印されたカードの複製となる。但し、名前は変更されない。 \n(「いんだすとりあ」が未使用なら複製とならないので、使用できない)'}
    
    , '11-thallya-o-n-1': {megami: 'thallya', name: 'Burning Steam', ruby: 'バーニングスチーム', baseType: 'normal', types: ['attack'], range: '3-5', damage: '2/1', text: '【攻撃後】騎動を行う。'}
    , '11-thallya-o-n-2': {megami: 'thallya', name: 'Waving Edge', ruby: 'ウェービングエッジ', baseType: 'normal', types: ['attack'], range: '1-3', damage: '3/1', text: '燃焼 \n【攻撃後】騎動を行う。'}
    , '11-thallya-o-n-3': {megami: 'thallya', name: 'Shield Charge', ruby: 'シールドチャージ', baseType: 'normal', types: ['attack'], range: '1', damage: '3/2', text: '燃焼 \n【常時】この《攻撃》のダメージにより移動する桜花結晶は、ダストやフレアでなく間合に動かす。'}
    , '11-thallya-o-n-4': {megami: 'thallya', name: 'Steam Cannon', ruby: 'スチームカノン', baseType: 'normal', types: ['attack', 'fullpower'], range: '2-8', damage: '3/3', text: '燃焼'}
    , '11-thallya-o-n-5': {megami: 'thallya', name: 'Stunt', ruby: 'スタント', baseType: 'normal', types: ['action'], text: '相手を畏縮させる。 \n自オーラ→自フレア：2'}
    , '11-thallya-o-n-6': {megami: 'thallya', name: 'Roaring', ruby: 'ロアリング', baseType: 'normal', types: ['action'], text: 'コストとして、あなたのマシンにある造花結晶を2つ燃焼済にしても良い。そうした場合、あなたは集中力を1得て、相手は集中力を1失い、相手を畏縮させる。 \nコストとして、集中力を2支払ってもよい。そうした場合、あなたの燃焼済の造花結晶を3つ回復する。'}
    , '11-thallya-o-n-7': {megami: 'thallya', name: 'Turbo Switch', ruby: 'ターボスイッチ', baseType: 'normal', types: ['action', 'reaction'], text: '燃焼 \n騎動を行う。'}
    , '11-thallya-o-s-1': {megami: 'thallya', name: 'Alpha-Edge', ruby: 'アルファエッジ', baseType: 'special', types: ['attack'], range: '1,3,5,7', damage: '1/1', cost: '1', text: '【即再起】あなたが騎動により間合を変化させる。'}
    , '11-thallya-o-s-2': {megami: 'thallya', name: 'Omega-Burst', ruby: 'オメガバースト', baseType: 'special', types: ['action', 'reaction'], cost: '4', text: 'あなたの燃焼済の造花結晶を全て回復する。 \n対応した、オーラへのダメージが「-」またはX以下の《攻撃》を打ち消す。Xはこのカードにより回復した造花結晶の個数に等しい。'}
    , '11-thallya-o-s-4': {megami: 'thallya', name: 'Julia\'s BlackBox', ruby: 'ジュリアズ　ブラックボックス', baseType: 'special', types: ['action', 'fullpower'], cost: '0', text: 'あなたのマシンに造花結晶がないならば、あなたのマシンはTransFormし、あなたの燃焼済の造花結晶を2つ回復する。そうでない場合、このカードを未使用に戻す。'}
    , 'transform-01': {megami: 'thallya', name: 'Form: YAKSHA', ruby: 'フォルム:ヤクシャ', baseType: 'transform', types: ['transform'], text: '【変形時】相手は次の開始フェイズにカードを1枚しか引けない。相手を畏縮させる。\n----\n【常時】あなたのマシンに造花結晶がないならば、あなたは基本動作を行えない。\n----\n【追加基本行動：Beta-Edge】\n「適正距離2,4,6,8、2/1 【攻撃後】騎動を行う」の《攻撃》を行う。'}
    , 'transform-02': {megami: 'thallya', name: 'Form: NAGA', ruby: 'フォルム:ナーガ', baseType: 'transform', types: ['transform'], text: '【変形時】相手のフレアが3以上ならば、フレアが2になるように桜花結晶をダストへ移動させる。 \n----\n【追加基本行動：Gamma-Ray】\n相手の山札の一番上のカードを相手の捨て札に置く。'}
    , 'transform-03': {megami: 'thallya', name: 'Form: GARUDA', ruby: 'フォルム:ガルーダ', baseType: 'transform', types: ['transform'], text: '【変形時】カードを2枚引き、このターンの間手札の上限が無くなる。 \n----\n【常時】カードを2枚引き、このターンの間手札の上限が無くなる。 \n----\n【追加基本行動：Delta-Wing】\n現在の間合が7以下ならば、ダスト→間合：1'}

    , '12-raira-o-n-1': {megami: 'raira', name: '獣爪', ruby: 'じゅうそう', baseType: 'normal', types: ['attack'], range: '1-2', damage: '3/1', text: ''}
    , '12-raira-o-n-2': {megami: 'raira', name: '風雷撃', ruby: 'ふうらいげき', baseType: 'normal', types: ['attack'], range: '2', damage: 'X/2', text: '【常時】Xは風神ゲージと雷神ゲージのうち、小さい方の値である。'}
    , '12-raira-o-n-3': {megami: 'raira', name: '流転爪', ruby: 'るてんそう', baseType: 'normal', types: ['attack'], range: '1-2', damage: '2/1', text: '【攻撃後】あなたの捨て札にある《攻撃》カード1枚を選び、山札の一番上に置いてもよい。'}
    , '12-raira-o-n-4': {megami: 'raira', name: '風走り', ruby: 'かぜばしり', baseType: 'normal', types: ['action'], text: '現在の間合が3以上ならば、間合→ダスト：2'}
    , '12-raira-o-n-5': {megami: 'raira', name: '風雷の知恵', ruby: 'ふうらいのちえ', baseType: 'normal', types: ['action'], text: '風神ゲージと雷神ゲージの合計が4以上ならば、あなたの捨て札にある他のメガミのカード1枚を選び、山札の一番上に置いてもよい。 \n風神ゲージか雷神ゲージを1上げる。'}
    , '12-raira-o-n-6': {megami: 'raira', name: '呼び声', ruby: 'よびごえ', baseType: 'normal', types: ['action', 'fullpower'], text: '相手を畏縮させ、以下から1つを選ぶ。\n・風神ゲージと雷神ゲージを1ずつ上げる。\n・手札を全て伏せ札にし、雷神ゲージを2倍にする。'}
    , '12-raira-o-n-7': {megami: 'raira', name: '空駆け', ruby: 'そらかけ', baseType: 'normal', types: ['action', 'fullpower'], text: '間合⇔ダスト：3'}
    , '12-raira-o-s-1': {megami: 'raira', name: '雷螺風神爪', ruby: 'らいらふうじんそう', baseType: 'special', types: ['attack'], range: '1-2', damage: '2/2', cost: '3', text: '【常時】あなたの雷神ゲージが4以上ならば、この《攻撃》は+1/+0となる。 \n----\n【再起】あなたの風神ゲージが4以上である。'}
    , '12-raira-o-s-2': {megami: 'raira', name: '天雷召喚陣', ruby: 'てんらいしょうかんじん', baseType: 'special', types: ['action', 'fullpower'], cost: '6', text: '攻撃『適正距離0-10、1/1』をX回行う。Xは雷神ゲージの半分(切り上げ)に等しい。'}
    , '12-raira-o-s-3': {megami: 'raira', name: '風魔招来孔', ruby: 'ふうましょうらいこう', baseType: 'special', types: ['action'], cost: '0', text: '現在の風神ゲージに応じて、以下の切札を追加札から未使用で得る(条件を満たしたものは全て得る)。その後、このカードを取り除く。 \n3以上……風魔旋風 \n6以上……風魔纏廻 \n10以上……風魔天狗道', removable: true}
    , '12-raira-o-s-4': {megami: 'raira', name: '円環輪廻旋', ruby: 'えんかんりんかいせん', baseType: 'special', types: ['enhance', 'fullpower'], capacity: '5', cost: '3', text: '【展開中】あなたが《付与》でない通常札を使用した場合、それを捨て札にする代わりに山札の底に置く。'}
    , '12-raira-o-s-3-ex1': {megami: 'raira', name: '風魔旋風', ruby: 'ふうませんぷう', extra: true, baseType: 'special', types: ['attack'], range: '1-3', damage: '1/2', cost: '1', text: ''}
    , '12-raira-o-s-3-ex2': {megami: 'raira', name: '風魔纏廻', ruby: 'ふうまてんかい', extra: true, baseType: 'special', types: ['action'], cost: '1', text: 'あなたの使用済の切札を1枚選び、それを未使用に戻す。 \n【使用済】あなたの切札の消費は1少なくなる(0未満にはならない)。'}
    , '12-raira-o-s-3-ex3': {megami: 'raira', name: '風魔天狗道', ruby: 'ふうまてんぐどう', extra: true, baseType: 'special', types: ['action', 'reaction'], cost: '4', text: 'ダスト⇔間合：5 \nあなたはこの効果で本来より少ない個数の桜花結晶を動かしてもよい。その後、このカードを取り除く。', removable: true}

    , '12-utsuro-o-n-1': {megami: 'utsuro', name: '円月', ruby: 'えんげつ', baseType: 'normal', types: ['attack'], range: '6-7', damage: '2/2', text: '【常時】灰塵-ダストが12以上ならば、この《攻撃》のオーラへのダメージは「-」になる。'}
    , '12-utsuro-o-n-2': {megami: 'utsuro', name: '黒き波動', ruby: 'くろきはどう', baseType: 'normal', types: ['attack'], range: '4-7', damage: '1/2', text: '【攻撃後】相手がオーラへのダメージを選んだならば、相手の手札を見てその中から1枚を選び、それを捨て札にする。'}
    , '12-utsuro-o-n-3': {megami: 'utsuro', name: '刈取り', ruby: 'かりとり', baseType: 'normal', types: ['attack'], range: '4', damage: '-/0', text: '【攻撃後】相手は相手のオーラ、フレア、ライフのいずれかから桜花結晶を合計2つダストへ移動させる。 \n【攻撃後】相手の付与札を1枚選んでもよい。そうした場合、その付与札の上から桜花結晶を2つダストへ送る。'}
    , '12-utsuro-o-n-4': {megami: 'utsuro', name: '重圧', ruby: 'じゅうあつ', baseType: 'normal', types: ['action'], text: '相手は相手のオーラ、フレア、ライフのいずれかから桜花結晶を1つダストへ移動させる。 \n灰塵-ダストが12以上ならば、相手を畏縮させる。'}
    , '12-utsuro-o-n-5': {megami: 'utsuro', name: '影の翅', ruby: 'かげのはね', baseType: 'normal', types: ['action'], text: 'このターン中、現在の間合は2増加し、達人の間合は2大きくなる。'}
    , '12-utsuro-o-n-6': {megami: 'utsuro', name: '影の壁', ruby: 'かげのかべ', baseType: 'normal', types: ['action', 'reaction'], text: '対応した《攻撃》は+0/-1となる。'}
    , '12-utsuro-o-n-7': {megami: 'utsuro', name: '遺灰呪', ruby: 'いかいじゅ', baseType: 'normal', types: ['enhance', 'fullpower'], capacity: '2', text: '【展開時】相オーラ→ダスト：3 \n【破棄時】灰塵-ダストが12以上ならば以下を行う。 \nダスト→相オーラ：2、相ライフ→ダスト：1'}
    , '12-utsuro-o-s-1': {megami: 'utsuro', name: '灰滅', ruby: 'ヴィミラニエ', baseType: 'special', types: ['action'], cost: '24', text: '【常時】このカードの消費はダストの数だけ少なくなる。 \n相ライフ→ダスト：3 \nこのカードを取り除く。', removable: true}
    , '12-utsuro-o-s-2': {megami: 'utsuro', name: '虚偽', ruby: 'ローシェ', baseType: 'special', types: ['enhance', 'reaction'], capacity: '3', cost: '3', text: '【展開中】相手の《攻撃》は距離縮小(近1)を得て、【攻撃後】効果が解決されない。 \n【展開中】相手の《付与》カードは納が1減少し、【破棄時】効果が解決されない。'}
    , '12-utsuro-o-s-3': {megami: 'utsuro', name: '終末', ruby: 'カニェッツ', baseType: 'special', types: ['enhance'], capacity: '3', cost: '2', text: '【展開中】あなたに1以上のダメージを与えた《攻撃》の解決後に、このカードの上の桜花結晶を全てをダストに送る。 \n【破棄時】現在のフェイズを終了する。 \n----\n【再起】灰塵-ダストが12以上である。'}
    , '12-utsuro-o-s-4': {megami: 'utsuro', name: '魔食', ruby: 'エロージャ', baseType: 'special', types: ['action'], cost: '5', text: '【使用済】あなたの開始フェイズの開始時に相手は以下のどちらかを選ぶ。\n・相オーラ→ダスト：1\n・相フレア→ダスト：2'}
                       
};


// socket.io用イベント
export namespace SocketParam {
    export type appendActionLog = {boardId: string, log: state.LogRecord};
    export type bcAppendActionLog = {log: state.LogRecord};

    export type appendChatLog = {boardId: string, log: state.LogRecord};
    export type bcAppendChatLog = {log: state.LogRecord};
}
