var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CARD_DATA = {
    '01-yurina-o-n-1': { name: '斬', ruby: 'ざん', baseType: 'normal', types: ['attack'], range: "3-4", damage: '3/1', text: '' },
    '01-yurina-o-n-2': { name: '一閃', ruby: 'いっせん', baseType: 'normal', types: ['attack'], range: "3", damage: '2/2', text: '【常時】決死-あなたのライフが3以下ならば、この《攻撃》は+1/+0となる。' },
    '01-yurina-o-n-3': { name: '柄打ち', ruby: 'つかうち', baseType: 'normal', types: ['attack'], range: "1-2", damage: '2/1', text: '【攻撃後】決死-あなたのライフが3以下ならば、このターンにあなたが次に行う《攻撃》は+1/+0となる。' },
    '01-yurina-o-n-4': { name: '居合', ruby: 'いあい', baseType: 'normal', types: ['attack', 'fullpower'], range: "3-4", damage: '4/3', text: '' },
    '01-yurina-o-n-5': { name: '足捌き', ruby: 'あしさばき', baseType: 'normal', types: ['action'], text: '現在の間合が4以上ならば、間合→ダスト：2' },
    '01-yurina-o-n-6': { name: '圧気', ruby: 'あっき', baseType: 'normal', types: ['enhance'], capacity: '4', text: '隙\n【破棄時】攻撃『適正距離1-4、3/-』を行う。' },
    '01-yurina-o-n-7': { name: '気炎万丈', ruby: 'きえんばんじょう', baseType: 'normal', types: ['enhance', 'fullpower'], capacity: '2', text: '【展開中】決死-あなたのライフが3以下ならば、あなたの他のメガミによる《攻撃》は+1/+1となるとともに超克を得る。' },
    '01-yurina-o-s-1': { name: '月影落', ruby: 'つきかげおとし', baseType: 'special', cost: '7', types: ['attack'], range: '3-4', damage: '4/4', text: '' },
    '01-yurina-o-s-2': { name: '浦波嵐', ruby: 'うらなみあらし', baseType: 'special', cost: '3', types: ['attack', 'reaction'], range: '0-10', damage: '2/-', text: '【攻撃後】対応した《攻撃》は-2/+0となる。' },
    '01-yurina-o-s-3': { name: '浮舟宿', ruby: 'うきふねやどし', baseType: 'special', cost: '3', types: ['action'], text: 'ダスト→自オーラ：5 \n【再起】決死-あなたのライフが3以下である。' },
    '01-yurina-o-s-4': { name: '天音揺波の底力', ruby: 'あまねゆりなのそこぢから', baseType: 'special', cost: '5', types: ['attack', 'fullpower'], range: '1-4', damage: '5/5', text: '【常時】決死-あなたのライフが3以下でないと、このカードは使用できない。' }
};
// クラス
var Card = /** @class */ (function () {
    function Card(id) {
        this.id = id;
    }
    Object.defineProperty(Card.prototype, "data", {
        get: function () {
            return CARD_DATA[this.id];
        },
        enumerable: true,
        configurable: true
    });
    return Card;
}());
var Layouter = /** @class */ (function () {
    function Layouter() {
    }
    // 横に並んだカードやトークンをレイアウトする
    Layouter.exec = function (selector, frameWidth, spacing, padding) {
        if (spacing === void 0) { spacing = 8; }
        if (padding === void 0) { padding = 4; }
        var $elems = $(selector);
        var itemWidth = $elems.outerWidth();
        $elems.each(function (i, elem) {
            $(elem).css('left', padding + (itemWidth + spacing) * i + "px").css('top', padding + "px");
        });
    };
    return Layouter;
}());
var Component = /** @class */ (function () {
    function Component() {
        this.draggable = true;
        this.rotated = 0;
        this.left = 0;
        this.top = 0;
        this.drawn = false;
    }
    /**
     * 位置が変更されていればtrue
     */
    Component.prototype.isLocationChanged = function () {
        return this.region !== this.oldRegion
            || this.indexOfRegion !== this.oldIndexOfRegion
            || this.draggable !== this.oldDraggable
            || this.rotated !== this.oldRotated;
    };
    Component.prototype.updateLocation = function () {
        this.oldRegion = this.region;
        this.oldIndexOfRegion = this.indexOfRegion;
        this.oldDraggable = this.draggable;
        this.oldRotated = this.rotated;
    };
    Object.defineProperty(Component.prototype, "zIndexOffset", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    return Component;
}());
var CardComponent = /** @class */ (function (_super) {
    __extends(CardComponent, _super);
    function CardComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.opened = false;
        return _this;
    }
    CardComponent.prototype.toHtml = function () {
        return ("<div class=\"fbs-card\" draggable=\"true\" id=\"" + this.htmlElementId + "\" data-card-id=\"" + this.card.id + "\" data-html=\"" + this.getDescriptionHtml() + "\"></div>");
    };
    CardComponent.prototype.isLocationChanged = function () {
        return _super.prototype.isLocationChanged.call(this) || this.opened !== this.oldOpened;
    };
    CardComponent.prototype.updateLocation = function () {
        _super.prototype.updateLocation.call(this);
        this.oldOpened = this.opened;
    };
    CardComponent.prototype.getDescriptionHtml = function () {
        var cardTitleHtml = "<ruby><rb>" + this.card.data.name + "</rb><rp>(</rp><rt>" + this.card.data.ruby + "</rt><rp>)</rp></ruby>";
        var html = "<div class='ui header' style='margin-right: 2em;'>" + cardTitleHtml;
        html += "</div><div class='ui content'>";
        var typeCaptions = [];
        if (this.card.data.types.indexOf('attack') >= 0)
            typeCaptions.push("<span style='color: red; font-weight: bold;'>攻撃</span>");
        if (this.card.data.types.indexOf('action') >= 0)
            typeCaptions.push("<span style='color: blue; font-weight: bold;'>行動</span>");
        if (this.card.data.types.indexOf('enhance') >= 0)
            typeCaptions.push("<span style='color: green; font-weight: bold;'>付与</span>");
        if (this.card.data.types.indexOf('reaction') >= 0)
            typeCaptions.push("<span style='color: purple; font-weight: bold;'>対応</span>");
        if (this.card.data.types.indexOf('fullpower') >= 0)
            typeCaptions.push("<span style='color: gold; font-weight: bold;'>全力</span>");
        html += "" + typeCaptions.join('/');
        if (this.card.data.range !== undefined) {
            html += "<span style='margin-left: 1em;'>" + this.card.data.range + "</span>";
        }
        html += "<br>";
        if (this.card.data.baseType === 'special') {
            html += "<div class='ui top right attached label'>" + this.card.data.cost + "</div>";
        }
        if (this.card.data.types.indexOf('enhance') >= 0) {
            html += "\u7D0D: " + this.card.data.capacity + "<br>";
        }
        if (this.card.data.damage !== undefined) {
            html += this.card.data.damage + "<br>";
        }
        html += "" + this.card.data.text.replace('\n', '<br>');
        html += "</div>";
        return html;
    };
    return CardComponent;
}(Component));
var SakuraTokenComponent = /** @class */ (function (_super) {
    __extends(SakuraTokenComponent, _super);
    function SakuraTokenComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cardId = null;
        return _this;
    }
    SakuraTokenComponent.prototype.toHtml = function () {
        return ("<div class=\"sakura-token\" draggable=\"true\" id=\"" + this.htmlElementId + "\"></div>");
    };
    Object.defineProperty(SakuraTokenComponent.prototype, "zIndexOffset", {
        get: function () {
            return 100;
        },
        enumerable: true,
        configurable: true
    });
    return SakuraTokenComponent;
}(Component));
var VigorComponent = /** @class */ (function (_super) {
    __extends(VigorComponent, _super);
    function VigorComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VigorComponent.prototype.toHtml = function () {
        return ("<div class=\"fbs-vigor-card\" id=\"" + this.htmlElementId + "\">\n        <div class=\"vigor0\"></div>\n        <div class=\"vigor1\"></div>\n        <div class=\"vigor2\"></div>\n        </div>");
    };
    // 表示状態を決定
    VigorComponent.prototype.setVigor = function (value) {
        if (value === 0) {
            this.rotated = 1;
        }
        if (value === 1) {
            this.rotated = 0;
        }
        if (value === 2) {
            this.rotated = -1;
        }
    };
    return VigorComponent;
}(Component));
// 盤を定義
var board = {
    library: [new Card('01-yurina-o-n-1'), new Card('01-yurina-o-n-2'), new Card('01-yurina-o-n-3'), new Card('01-yurina-o-n-4')],
    hands: [new Card('01-yurina-o-n-7'), new Card('01-yurina-o-n-5'), new Card('01-yurina-o-n-6')],
    specials: [new Card('01-yurina-o-s-1'), new Card('01-yurina-o-s-2'), new Card('01-yurina-o-s-3')],
    used: [],
    hiddenUsed: [],
    vigor: 1,
    tokensOnCard: {},
    aura: 3,
    life: 10,
    flair: 0,
    distance: 10,
    dust: 0
};
// コンポーネント一覧
var components = [];
// 変数を定義
var draggingFrom = null;
var contextMenuShowingAfterDrop = false;
// 関数
function shuffle(array) {
    var n = array.length, t, i;
    while (n) {
        i = Math.floor(Math.random() * n--);
        t = array[n];
        array[n] = array[i];
        array[i] = t;
    }
    return array;
}
function createCardComponent(card, region, indexOfRegion, opened) {
    if (opened === void 0) { opened = false; }
    var newCard = new CardComponent;
    newCard.card = card;
    newCard.htmlElementId = "fbs-card-" + card.id;
    newCard.region = region;
    newCard.indexOfRegion = indexOfRegion;
    newCard.opened = opened;
    components.push(newCard);
}
function createVigorComponent() {
    var comp = new VigorComponent;
    comp.region = 'vigor';
    comp.htmlElementId = "fbs-vigor-card";
    components.push(comp);
}
var sakuraTokenTotalCount = 0;
function createSakuraTokenComponent(region, count) {
    for (var i = 0; i < count; i++) {
        var newComp = new SakuraTokenComponent;
        newComp.region = region;
        newComp.indexOfRegion = i;
        newComp.htmlElementId = "sakura-token-" + sakuraTokenTotalCount;
        sakuraTokenTotalCount++;
        components.push(newComp);
    }
}
// 盤上のコンポーネント表示を更新
function updateComponents() {
    // 山札の再配置
    var libraryOffset = $('.area.library.background').position();
    components.filter(function (x) { return x.region === 'library'; }).forEach(function (comp, i) {
        comp.left = libraryOffset.left + 4 + comp.indexOfRegion * 8;
        comp.top = libraryOffset.top + 4 + comp.indexOfRegion * 3;
    });
    // 手札の再配置
    var handOffset = $('.area.hand.background').position();
    components.filter(function (x) { return x.region === 'hand'; }).forEach(function (comp, i) {
        comp.left = handOffset.left + 4 + comp.indexOfRegion * 108;
        comp.top = handOffset.top + 4;
    });
    // 切り札の再配置
    var specialOffset = $('.area.special.background').position();
    components.filter(function (x) { return x.region === 'special'; }).forEach(function (comp, i) {
        comp.left = specialOffset.left + 4 + comp.indexOfRegion * 108;
        comp.top = specialOffset.top + 4;
    });
    // 使用済札の再配置
    var usedOffset = $('.area.used.background').position();
    components.filter(function (x) { return x.region === 'used'; }).forEach(function (comp, i) {
        comp.left = usedOffset.left + 4 + comp.indexOfRegion * 108;
        comp.top = usedOffset.top + 4;
    });
    // 伏せ札の再配置
    var hiddenUsedOffset = $('.area.hidden-used.background').position();
    components.filter(function (x) { return x.region === 'hidden-used'; }).forEach(function (comp, i) {
        comp.left = 20 + hiddenUsedOffset.left + 4 + comp.indexOfRegion * 8;
        comp.top = -20 + hiddenUsedOffset.top + 4 + comp.indexOfRegion * 3;
    });
    // 集中力の再配置
    var vigorOffset = $('.area.vigor').position();
    components.filter(function (x) { return x instanceof VigorComponent; }).forEach(function (comp, i) {
        if (comp.rotated === 0) {
            comp.left = vigorOffset.left;
            comp.top = vigorOffset.top + 40;
        }
        else {
            comp.left = vigorOffset.left;
            comp.top = vigorOffset.top + 20;
        }
    });
    // 桜花結晶の再配置
    var distanceOffset = $('.area.sakura-token-region.distance').position();
    components.filter(function (x) { return x.region === 'distance'; }).forEach(function (comp, i) {
        comp.left = distanceOffset.left + 60 + ((28 + 4) * i);
        comp.top = distanceOffset.top + 2;
    });
    var dustOffset = $('.area.sakura-token-region.dust').position();
    components.filter(function (x) { return x.region === 'dust'; }).forEach(function (comp, i) {
        comp.left = dustOffset.left + 60 + ((28 + 4) * i);
        comp.top = dustOffset.top + 2;
    });
    var auraOffset = $('.area.sakura-token-region.aura').position();
    components.filter(function (x) { return x.region === 'aura'; }).forEach(function (comp, i) {
        comp.left = auraOffset.left + 60 + ((28 + 4) * i);
        comp.top = auraOffset.top + 2;
    });
    var lifeOffset = $('.area.sakura-token-region.life').position();
    components.filter(function (x) { return x.region === 'life'; }).forEach(function (comp, i) {
        comp.left = lifeOffset.left + 60 + ((28 + 4) * i);
        comp.top = lifeOffset.top + 2;
    });
    var flairOffset = $('.area.sakura-token-region.flair').position();
    components.filter(function (x) { return x.region === 'flair'; }).forEach(function (comp, i) {
        comp.left = flairOffset.left + 60 + ((28 + 4) * i);
        comp.top = flairOffset.top + 2;
    });
    components.filter(function (x) { return x.region === 'on-card'; }).forEach(function (comp, i) {
        var offset = $("[data-card-id=" + comp.cardId + "]").position();
        comp.left = offset.left + 2 + comp.indexOfRegion * 20;
        comp.top = offset.top + 140 - 2 - 32;
    });
    // コンポーネントごとに描画/移動処理
    var boardOffset = $('#BOARD').offset();
    components.forEach(function (component, index) {
        var $elem = null;
        if (!component.drawn) {
            $('#BOARD').append(component.toHtml());
            $elem = $("#" + component.htmlElementId);
        }
        if (!component.drawn || component.isLocationChanged()) {
            if ($elem === null) {
                $elem = $("#" + component.htmlElementId);
            }
            // ドラッグ可能の判定
            if (component.draggable) {
                $elem.attr('draggable', '');
            }
            else {
                $elem.removeAttr('draggable');
            }
            // 回転
            $elem.removeClass(['rotated', 'reverse-rotated']);
            if (component.rotated === 1) {
                $elem.addClass('rotated');
            }
            else if (component.rotated === -1) {
                $elem.addClass('reverse-rotated');
            }
            // カード用の処理
            if (component instanceof CardComponent) {
                // 裏表の更新
                $elem.removeClass(['open-normal', 'back-normal', 'open-special', 'back-special']);
                if (component.card.data.baseType === 'normal') {
                    if (component.opened) {
                        $elem.addClass('open-normal');
                    }
                    else {
                        $elem.addClass('back-normal');
                    }
                }
                if (component.card.data.baseType === 'special') {
                    if (component.opened) {
                        $elem.addClass('open-special');
                    }
                    else {
                        $elem.addClass('back-special');
                    }
                }
                // 名称表示の更新
                $elem.text(component.opened ? component.card.data.name : '');
            }
            // 集中力用の処理
            if (component instanceof VigorComponent) {
                if (board.vigor === 0) {
                    $elem.find('.vigor1').addClass('clickable');
                    $elem.find(':not(.vigor1)').removeClass('clickable');
                }
                if (board.vigor === 1) {
                    $elem.find('.vigor0, .vigor2').addClass('clickable');
                    $elem.find('.vigor1').removeClass('clickable');
                }
                if (board.vigor === 2) {
                    $elem.find('.vigor1').addClass('clickable');
                    $elem.find(':not(.vigor1)').removeClass('clickable');
                }
            }
            // 位置を移動 (向きを変えた後に実行する必要がある）
            $elem.css({ left: component.left, top: component.top });
            $elem.css({ zIndex: component.zIndexOffset + component.indexOfRegion });
            // リージョン属性付加
            $elem.attr('data-region', component.region);
            // 古い位置情報を捨てる
            component.updateLocation();
        }
        // 描画済フラグを立てる
        if (!component.drawn) {
            component.drawn = true;
        }
    });
    // ライブラリカウント増減
    $('#LIBRARY-COUNT').text(board.library.length).css({ right: parseInt($('.area.library.background').css('right')) + 8, bottom: parseInt($('.area.library.background').css('bottom')) + 8 });
}
function drawLibrary() {
    board.library.forEach(function (card, i) {
        createCardComponent(card, 'library', i);
    });
}
function drawHands() {
    board.hands.forEach(function (card, i) {
        createCardComponent(card, 'hand', i, true);
    });
}
function drawSpecials() {
    board.specials.forEach(function (card, i) {
        createCardComponent(card, 'special', i);
    });
}
function drawUsed() {
    board.used.forEach(function (card, i) {
        createCardComponent(card, 'used', innerWidth, true);
    });
}
function drawHiddenUsed() {
    board.hiddenUsed.forEach(function (card, i) {
        createCardComponent(card, 'hidden-used', i);
    });
}
function drawVigor() {
    createVigorComponent();
}
function drawSakuraTokens() {
    createSakuraTokenComponent('distance', 10);
    createSakuraTokenComponent('aura', 3);
    createSakuraTokenComponent('life', 10);
}
function appendLog(text) {
    $('#LOG-AREA').append(text).append('<br>');
}
// カードを移動
function moveCard(from, fromIndex, to, addToBottom) {
    if (addToBottom === void 0) { addToBottom = false; }
    console.log('move card (%s[%d] -> %s)', from, fromIndex, to);
    // 移動可能かどうかをチェック
    // 移動
    var card;
    if (from === 'library') {
        card = board.library.splice(fromIndex, 1)[0];
    }
    if (from === 'hand') {
        card = board.hands.splice(fromIndex, 1)[0];
    }
    if (from === 'used') {
        card = board.used.splice(fromIndex, 1)[0];
    }
    if (from === 'hidden-used') {
        card = board.hiddenUsed.splice(fromIndex, 1)[0];
    }
    var toTarget;
    if (to === 'library') {
        toTarget = board.library;
    }
    if (to === 'hand') {
        toTarget = board.hands;
    }
    if (to === 'used') {
        toTarget = board.used;
    }
    if (to === 'hidden-used') {
        toTarget = board.hiddenUsed;
    }
    if (addToBottom) {
        toTarget.unshift(card);
    }
    else {
        toTarget.push(card);
    }
    // ログを追加
    if (from === 'library' && to === 'hand') {
        appendLog("\u30AB\u30FC\u30C9\u30921\u679A\u5F15\u304F \u21D2 " + card.data.name);
    }
    else if (from === 'hand' && to === 'used') {
        appendLog("\u300C" + card.data.name + "\u300D\u3092\u5834\u306B\u51FA\u3059");
    }
    else if (from === 'hand' && to === 'hidden-used') {
        appendLog("\u300C" + card.data.name + "\u300D\u3092\u4F0F\u305B\u672D");
    }
    else {
        var regionCaptions = {
            'library': '山札',
            'hand': '手札',
            'used': '場',
            'hidden-used': '伏せ札',
        };
        appendLog(regionCaptions[from] + "\u306E\u300C" + card.data.name + "\u300D\u3092" + regionCaptions[to] + "\u306B\u79FB\u52D5");
    }
    // コンポーネントのインデックス更新
    refreshCardComponentRegionInfo(from);
    refreshCardComponentRegionInfo(to);
    // 表示更新
    updateComponents();
    // 移動成功
    return true;
}
// コンポーネントの領域情報を更新
function refreshCardComponentRegionInfo(region) {
    var cards;
    if (region === 'library') {
        cards = board.library;
    }
    if (region === 'hand') {
        cards = board.hands;
    }
    if (region === 'used') {
        cards = board.used;
    }
    if (region === 'hidden-used') {
        cards = board.hiddenUsed;
    }
    // カード情報の更新
    cards.forEach(function (card, i) {
        var comp = components.find(function (x) { return x instanceof CardComponent && x.card === card; });
        comp.region = region;
        comp.indexOfRegion = i;
        comp.draggable = (comp.region !== 'library' || comp.indexOfRegion === board.library.length - 1);
        // 領域に依存する情報更新
        if (region === 'hand' || region === 'used') {
            comp.opened = true;
        }
        if (region === 'library' || region === 'hidden-used') {
            comp.opened = false;
        }
        if (region !== 'hidden-used') {
            comp.rotated = 0;
        }
        if (region === 'hidden-used') {
            comp.rotated = 1;
        }
    });
}
// コンポーネントの領域情報を更新
function refreshSakuraTokenComponentInfo() {
    var allSakuraTokens = components.filter(function (x) { return x instanceof SakuraTokenComponent; });
    var tokenIndex = 0;
    // 対象領域にある結晶数に応じて表示更新
    for (var i = 0; i < board.distance; i++) {
        var comp = allSakuraTokens[tokenIndex];
        comp.region = 'distance';
        comp.indexOfRegion = i;
        tokenIndex++;
    }
    for (var i = 0; i < board.dust; i++) {
        var comp = allSakuraTokens[tokenIndex];
        comp.region = 'dust';
        comp.indexOfRegion = i;
        tokenIndex++;
    }
    for (var i = 0; i < board.aura; i++) {
        var comp = allSakuraTokens[tokenIndex];
        comp.region = 'aura';
        comp.indexOfRegion = i;
        tokenIndex++;
    }
    for (var i = 0; i < board.life; i++) {
        var comp = allSakuraTokens[tokenIndex];
        comp.region = 'life';
        comp.indexOfRegion = i;
        tokenIndex++;
    }
    for (var i = 0; i < board.flair; i++) {
        var comp = allSakuraTokens[tokenIndex];
        comp.region = 'flair';
        comp.indexOfRegion = i;
        tokenIndex++;
    }
    for (var cardId in board.tokensOnCard) {
        if (board.tokensOnCard.hasOwnProperty(cardId)) {
            console.log("key:", cardId);
            for (var i = 0; i < board.tokensOnCard[cardId]; i++) {
                var comp = allSakuraTokens[tokenIndex];
                comp.region = 'on-card';
                comp.cardId = cardId;
                comp.indexOfRegion = i;
                tokenIndex++;
            }
        }
    }
}
// 桜花結晶を移動
function moveSakuraToken(from, to, cardId, count) {
    if (count === void 0) { count = 1; }
    console.log('move sakura token (%s -> %s * %d)', from, to, count);
    // 移動可能かどうかをチェック
    if (from === 'distance') {
        if (board.distance < count)
            return false; // 桜花結晶がなければ失敗
    }
    else if (from === 'dust') {
        if (board.dust < count)
            return false; // 桜花結晶がなければ失敗
    }
    else if (from === 'aura') {
        if (board.aura < count)
            return false; // 桜花結晶がなければ失敗
    }
    else if (from === 'life') {
        if (board.life < count)
            return false; // 桜花結晶がなければ失敗
    }
    else if (from === 'flair') {
        if (board.flair < count)
            return false; // 桜花結晶がなければ失敗
    }
    if (to === 'distance') {
        if ((board.distance + count) > 10)
            return false; // 間合い最大値を超える場合は失敗
    }
    else if (to === 'aura') {
        if ((board.aura + count) > 5)
            return false; // オーラ最大値を超える場合は失敗
    }
    // 移動
    if (from === 'distance') {
        board.distance -= count;
    }
    else if (from === 'dust') {
        board.dust -= count;
    }
    else if (from === 'aura') {
        board.aura -= count;
    }
    else if (from === 'life') {
        board.life -= count;
    }
    else if (from === 'flair') {
        board.flair -= count;
    }
    if (to === 'distance') {
        board.distance += count;
    }
    else if (to === 'dust') {
        board.dust += count;
    }
    else if (to === 'aura') {
        board.aura += count;
    }
    else if (to === 'life') {
        board.life += count;
    }
    else if (to === 'flair') {
        board.flair += count;
    }
    else if (to === 'on-card') {
        if (board.tokensOnCard[cardId] === undefined)
            board.tokensOnCard[cardId] = 0;
        board.tokensOnCard[cardId] += count;
    }
    console.log(board);
    // コンポーネントのインデックス更新
    refreshSakuraTokenComponentInfo();
    // 表示更新
    updateComponents();
    // 移動成功
    return true;
}
$(function () {
    // socket.ioに接続
    var socket = io();
    // ボード情報を送信
    socket.emit('send_board_to_server', { boardId: params.boardId, side: params.side, board: board });
    // ボード情報を受信した場合、表示を更新する
    socket.on('send_board_to_client', function (receivingBoard) {
        console.log('receive new board', receivingBoard);
    });
    // 盤を表示
    drawUsed();
    drawHiddenUsed();
    drawLibrary();
    drawHands();
    drawSpecials();
    drawVigor();
    drawSakuraTokens();
    refreshCardComponentRegionInfo('library');
    // コンポーネントの表示を更新
    updateComponents();
    // ポップアップ初期化
    $('[data-html],[data-content]').popup({
        delay: { show: 500, hide: 0 },
        onShow: function () {
            if (draggingFrom !== null)
                return false;
        },
    });
    // ドラッグ開始
    $('#BOARD').on('dragstart', '.fbs-card,.sakura-token', function (e) {
        this.style.opacity = '0.4'; // this / e.target is the source node.
        //(e.originalEvent as DragEvent).dataTransfer.setDragImage($(this.closest('.draw-region'))[0], 0, 0);
        var id = $(this).attr('id');
        var comp = components.find(function (c) { return c.htmlElementId === id; });
        // 現在のエリアに応じて、選択可能なエリアを前面に移動し、選択したカードを記憶
        if (comp.region === 'hand') {
            // 手札
            $('.area.droppable:not(.hand)').css('z-index', 9999);
            draggingFrom = comp;
        }
        if (comp.region === 'library') {
            // 山札
            $('.area.droppable:not(.library)').css('z-index', 9999);
            draggingFrom = comp;
        }
        if (comp.region === 'used') {
            // 使用済札
            $('.area.droppable:not(.used)').css('z-index', 9999);
            draggingFrom = comp;
        }
        if (comp.region === 'hidden-used') {
            // 伏せ札
            $('.area.droppable:not(.hidden-used)').css('z-index', 9999);
            draggingFrom = comp;
        }
        if (comp.region === 'distance') {
            // 間合
            $('.area.sakura-token-region.droppable:not(.distance)').css('z-index', 9999);
            draggingFrom = comp;
        }
        if (comp.region === 'dust') {
            // ダスト
            $('.area.sakura-token-region.droppable:not(.dust)').css('z-index', 9999);
            draggingFrom = comp;
        }
        if (comp.region === 'aura') {
            // オーラ
            $('.area.sakura-token-region.droppable:not(.aura)').css('z-index', 9999);
            draggingFrom = comp;
            // 場に出ている付与札があれば、それも移動対象
            $('[data-region=used]').addClass('droppable');
        }
        if (comp.region === 'life') {
            // ライフ
            $('.area.sakura-token-region.droppable:not(.life)').css('z-index', 9999);
            draggingFrom = comp;
        }
        if (comp.region === 'flair') {
            // フレア
            $('.area.sakura-token-region.droppable:not(.flair)').css('z-index', 9999);
            draggingFrom = comp;
        }
        console.log('draggingFrom: ', draggingFrom);
        $('.fbs-card').popup('hide all');
    });
    function processOnDragEnd() {
        // コンテキストメニューを表示している場合、一部属性の解除を行わない
        if (!contextMenuShowingAfterDrop) {
            $('[draggable]').css('opacity', '1.0');
            $('.area,.fbs-card').removeClass('over');
        }
        $('.area.droppable').css('z-index', -9999);
        draggingFrom = null;
    }
    $('#BOARD').on('dragend', '.fbs-card,.sakura-token', function (e) {
        console.log('dragend', this);
        processOnDragEnd();
    });
    $('#BOARD').on('dragover', '.droppable', function (e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        //e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
        return false;
    });
    // ドラッグで要素に進入した
    $('.area.droppable').on('dragenter', function (e) {
        console.log('dragenter', this);
        $($(this).attr('data-background-selector')).addClass('over');
    });
    $('.area.droppable').on('dragleave', function (e) {
        console.log('dragleave', this);
        $($(this).attr('data-background-selector')).removeClass('over'); // this / e.target is previous target element.
    });
    $('#BOARD').on('dragenter', '.fbs-card.droppable', function (e) {
        $($(this)).addClass('over');
    });
    $('#BOARD').on('dragleave', '.fbs-card.droppable', function (e) {
        $($(this)).removeClass('over'); // this / e.target is previous target element.
    });
    var lastDraggingFrom;
    $('#BOARD').on('drop', '.area,.fbs-card.droppable', function (e) {
        // this / e.target is current target element.
        console.log('drop', this);
        var $this = $(this);
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        // ドロップ領域を特定
        var to;
        if ($this.is('.area.hand'))
            to = 'hand';
        if ($this.is('.area.used'))
            to = 'used';
        if ($this.is('.area.hidden-used'))
            to = 'hidden-used';
        if ($this.is('.area.library'))
            to = 'library';
        if ($this.is('.area.distance'))
            to = 'distance';
        if ($this.is('.area.dust'))
            to = 'dust';
        if ($this.is('.area.aura'))
            to = 'aura';
        if ($this.is('.area.life'))
            to = 'life';
        if ($this.is('.area.flair'))
            to = 'flair';
        if ($this.is('.fbs-card'))
            to = 'on-card';
        if (draggingFrom !== null) {
            // 山札に移動した場合は特殊処理
            if (to === 'library') {
                lastDraggingFrom = draggingFrom;
                contextMenuShowingAfterDrop = true;
                $('#CONTEXT-DRAG-TO-LIBRARY').contextMenu({ x: e.pageX, y: e.pageY });
                return false;
            }
            else {
                // 山札以外への移動の場合
                if (draggingFrom instanceof CardComponent) {
                    moveCard(draggingFrom.region, draggingFrom.indexOfRegion, to);
                    return false;
                }
                if (draggingFrom instanceof SakuraTokenComponent) {
                    var cardId = null;
                    if (to === 'on-card') {
                        cardId = $(this).attr('data-card-id');
                    }
                    moveSakuraToken(draggingFrom.region, to, cardId);
                    return false;
                }
            }
        }
        return false;
    });
    // 集中力のクリック
    function vigorProcess() {
        var vigComp = components.find(function (x) { return x instanceof VigorComponent; });
        vigComp.setVigor(board.vigor);
        updateComponents();
    }
    $('#BOARD').on('click', '.fbs-vigor-card .vigor0.clickable', function (e) {
        e.preventDefault();
        appendLog("\u96C6\u4E2D\u529B\uFF0D1\u3000(\u21920)");
        board.vigor = 0;
        vigorProcess();
        return false;
    });
    $('#BOARD').on('click', '.fbs-vigor-card .vigor1.clickable', function (e) {
        e.preventDefault();
        if (board.vigor === 2) {
            appendLog("\u96C6\u4E2D\u529B\uFF0D1\u3000(\u21921)");
        }
        else {
            appendLog("\u96C6\u4E2D\u529B\uFF0B1\u3000(\u21921)");
        }
        board.vigor = 1;
        vigorProcess();
        return false;
    });
    $('#BOARD').on('click', '.fbs-vigor-card .vigor2.clickable', function (e) {
        e.preventDefault();
        appendLog("\u96C6\u4E2D\u529B\uFF0B1\u3000(\u21922)");
        board.vigor = 2;
        vigorProcess();
        return false;
    });
    // ログ表示
    $('#LOG-DISPLAY-BUTTTON').on('click', function (e) {
        $('#LOG-WINDOW').toggle();
    });
    // ターン終了
    $('#TURN-END-BUTTON').on('click', function () {
        $('.ui.modal').modal('show');
    });
    // 切札のダブルクリック
    $('#BOARD').on('dblclick', '.fbs-card[data-region=special]', function (e) {
        e.preventDefault();
        var cardIndex = $('.fbs-card[data-region=special]').index(this);
        console.log('double click', cardIndex);
        var card = board.specials[cardIndex];
        var comp = components.find(function (x) { return x instanceof CardComponent && x.card === board.specials[cardIndex]; });
        if (card.used) {
            card.used = false;
            comp.opened = false;
        }
        else {
            card.used = true;
            comp.opened = true;
        }
        updateComponents();
        return false;
    });
    // $('#BOARD').on('mouseenter', '.sakura-token', function(e){
    //     let $region = $(this).closest('.draw-region');
    //     // 自分のインデックスを取得
    //     let index = $region.find('.sakura-token').index(this);
    //     // 自分より後の要素を半透明にする
    //     $region.find(`.sakura-token:gt(${index})`).css({opacity: 0.4});
    // });
    // $('#BOARD').on('mouseleave', '.sakura-token', function(e){
    //     let $region = $(this).closest('.draw-region');
    //     $region.find(`.sakura-token`).css({opacity: 1});
    // });
    // 山札ドラッグメニュー
    $('#BOARD').append('<div id="CONTEXT-DRAG-TO-LIBRARY"></div>');
    $.contextMenu({
        trigger: 'hidden',
        selector: '#CONTEXT-DRAG-TO-LIBRARY',
        callback: function (key) {
            if (key === 'top') {
                moveCard('hand', lastDraggingFrom.indexOfRegion, 'library');
            }
            if (key === 'bottom') {
                moveCard('hand', lastDraggingFrom.indexOfRegion, 'library', true);
            }
        },
        events: {
            hide: function (options) {
                contextMenuShowingAfterDrop = false;
                console.log(options);
                processOnDragEnd();
            }
        },
        items: {
            'top': { name: '上に置く' },
            'bottom': { name: '底に置く' },
            'sep': '----',
            'cancel': { name: 'キャンセル' }
        }
    });
    // 山札右クリックメニュー
    $.contextMenu({
        selector: '#BOARD .fbs-card[data-region=library]',
        callback: function (key) {
            if (key === 'draw') {
                moveCard('library', 0, 'hand');
            }
            if (key === 'reshuffle' || key === 'reshuffleWithoutDamage') {
                // 山札、捨て札、伏せ札を全て加えてシャッフル
                board.library = board.library.concat(board.hiddenUsed.splice(0));
                board.used.forEach(function (card, i) {
                    if (card.sakuraToken === undefined || card.sakuraToken === 0) {
                        board.library.push(card);
                        board.used[i] = undefined;
                    }
                });
                board.used = board.used.filter(function (c) { return c !== undefined; });
                board.library = shuffle(board.library);
                refreshCardComponentRegionInfo('library');
                refreshCardComponentRegionInfo('used');
                refreshCardComponentRegionInfo('hidden-used');
                if (key === 'reshuffle')
                    moveSakuraToken('life', 'dust', null);
                updateComponents();
                appendLog("\u518D\u69CB\u6210");
            }
        },
        items: {
            'draw': { name: '1枚引く', disabled: function () { return board.library.length === 0; } },
            'sep1': '---------',
            'reshuffle': { name: '再構成する', disabled: function () { return board.life === 0; } },
            'reshuffleWithoutDamage': { name: '再構成する (ライフ減少なし)' },
        }
    });
    // 集中力右クリックメニュー
    $.contextMenu({
        selector: '#BOARD .fbs-vigor-card',
        callback: function (key) {
        },
        items: {
            'wither': { name: '萎縮させる' },
            'sep1': '---------',
            'cancel': { name: 'キャンセル' },
        }
    });
    // 桜花結晶右クリックメニュー
    $.contextMenu({
        selector: '#BOARD .sakura-token',
        build: function ($elem, event) {
            // 現在のトークン数を取得
            var region = $elem.attr('data-region');
            var tokenCount = 0;
            if (region === 'distance') {
                tokenCount = board.distance;
            }
            if (region === 'dust') {
                tokenCount = board.dust;
            }
            if (region === 'aura') {
                tokenCount = board.aura;
            }
            if (region === 'life') {
                tokenCount = board.life;
            }
            if (region === 'flair') {
                tokenCount = board.flair;
            }
            var items = {};
            var itemBaseData = [
                { key: 'moveToDistance', name: '間合へ移動', region: 'distance' },
                { key: 'moveToDust', name: 'ダストへ移動', region: 'dust' },
                { key: 'moveToAura', name: 'オーラへ移動', region: 'aura' },
                { key: 'moveToLife', name: 'ライフへ移動', region: 'life' },
                { key: 'moveToFlair', name: 'フレアへ移動', region: 'flair' },
            ];
            itemBaseData.forEach(function (data) {
                if (region === data.region)
                    return true;
                items[data.key] = { name: data.name, items: {} };
                for (var i = 1; i <= tokenCount; i++) {
                    items[data.key].items[i.toString()] = { name: i + "\u3064" };
                }
                return true;
            });
            items['sep1'] = '---------';
            items['cancel'] = { name: 'キャンセル' };
            return {
                callback: function (key) {
                },
                items: items,
            };
            // return {
            //     callback: function(key: string) {
            //     },
            //     items: {
            //         'move': {
            //             name: '動かす',
            //             items: {
            //                 'dust': {
            //                     name: 'ダストへ',
            //                     items: {
            //                         '1': {name: '1つ'},
            //                         '2': {name: '2つ'},
            //                         '3': {name: '3つ'},
            //                     }
            //                 }
            //             }
            //         },
            //         'sep1': '---------',
            //         'cancel': {name: 'キャンセル'},
            //     }
            // }
        },
    });
    // context.init({ above: 'auto' });
    // context.attach('.area.library .fbs-card', [
    //     { text: '1枚引く', action: (e) => moveLibraryToHands(0) }
    //     , { divider: true }
    //     , { text: '再構成する' }
    //     , { text: '再構成する (ライフ減少なし)' }
    // ]);
    // context.attach('.area.hand .fbs-card', [
    //     { text: '使用する' }
    //     , { text: '伏せ札にする' }
    //     , { divider: true }
    //     , { text: '自分の山札の一番底に置く ' }
    //     , { text: '相手の山札の一番上に置く (毒カード用)' }
    // ]);
    // context.attach('.area.distance .sakura-token', [
    //     { text: '→ オーラ (前進)', action: (e) => {e.preventDefault(); moveSakuraToken('distance', 'aura'); return true;} }
    //     , { divider: true }
    //     , { text: '→ ダスト' }
    //     , { text: '→ ライフ' }
    //     , { text: '→ フレア' }
    // ]);
    // context.attach('.area.dust .sakura-token', [
    //     { text: '→ オーラ (宿し)', action: (e) => {e.preventDefault(); moveSakuraToken('dust', 'aura'); return true;} }
    //     , { text: '→ 間合 (離脱)', action: (e) => {e.preventDefault(); moveSakuraToken('life', 'aura'); return true;} }
    //     , { divider: true }
    //     , { text: '→ オーラ', action: (e) => {e.preventDefault(); moveSakuraToken('life', 'aura'); return true;} }
    //     , { text: '→ ダスト' }
    //     , { text: '→ 間合' }
    // ]);
    // context.attach('.area.aura .sakura-token', [
    //     { text: '→ ダスト (ダメージ)'}
    //     , { text: '→ フレア (宿し)', action: (e) => {e.preventDefault(); moveSakuraToken('aura', 'flair'); return true;}}
    //     , { divider: true }
    //     , { text: '→ ライフ', action: (e) => {e.preventDefault(); moveSakuraToken('aura', 'life'); return true;} }
    //     , { text: '→ 間合' }
    //     , { divider: true }
    //     , { text: 'オーラの最大値を無限大に変更' }
    // ]);
    // context.attach('.area.life .sakura-token', [
    //     { text: '→ フレア (ダメージ)', action: (e) => {e.preventDefault(); moveSakuraToken('life', 'flair'); return true;} }
    //     , { divider: true }
    //     , { text: '→ オーラ', action: (e) => {e.preventDefault(); moveSakuraToken('life', 'aura'); return true;} }
    //     , { text: '→ ダスト' }
    //     , { text: '→ 間合' }
    // ]);
    // context.attach('.area.flair .sakura-token', [
    //     { text: '→ ダスト (消費)' }
    //     , { divider: true }
    //     , { text: '→ オーラ', action: (e) => {e.preventDefault(); moveSakuraToken('flair', 'aura'); return true;} }
    //     , { text: '→ ライフ', action: (e) => {e.preventDefault(); moveSakuraToken('flair', 'life'); return true;} }
    //     , { text: '→ 間合' }
    // ]);
    ;
});