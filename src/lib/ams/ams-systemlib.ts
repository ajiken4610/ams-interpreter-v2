/**
 * Stringのイテレータです。
 *
 * @class StringIterator
 * @implements {Iterator<string>}
 */
class StringIterator implements Iterator<string> {
    /**
     * 現在の位置を記録します。
     *
     * @private
     * @memberof StringIterator
     */
    private index = 0;
    /**
     * ソースとなる文字列を記録します。
     *
     * @private
     * @type {string}
     * @memberof StringIterator
     */
    private src: string;
    /**
     * ソースを指定してイテレータを初期化します。
     * @param {string} src
     * @memberof StringIterator
     */
    public constructor(src: string) {
        this.src = src;
    }
    /**
     * イテレータの次の要素を返します。
     *
     * @return {string}
     * @memberof StringIterator
     */
    public next() {
        return this.hasNext()
            ? {
                  done: false,
                  value: this.src.charAt(this.index++),
              }
            : {
                  done: true,
                  value: "",
              };
    }
    /**
     * イテレータに次の要素があればtrue、そうでなければfalse
     *
     * @return {*}
     * @memberof StringIterator
     */
    public hasNext() {
        return this.src.length > this.index;
    }

    /**
     * イテレータの内容を最後まで読んで返します。
     *
     * @return {*}  {string}
     * @memberof StringIterator
     */
    public readAll(): string {
        let index = this.index;
        this.index = this.src.length;
        return this.src.substring(index, this.src.length);
    }
    /**
     * 指定された文字が来るまで読んで返します。
     *
     * @param {string} detect
     * @return {*}  {{
     *         detected: string;
     *         value: string;
     *     }}
     * @memberof StringIterator
     */
    public readBeforeChar(detect: string): {
        detected: string;
        value: string;
    } {
        let value = "";
        while (this.hasNext()) {
            let current = this.next().value;
            for (var i = 0; i < detect.length; i++)
                if (current === detect.charAt(i)) {
                    return {
                        detected: current,
                        value: value,
                    };
                }
            value += current;
        }
        return { detected: "", value: value };
    }
    /**
     * ネストを考慮して指定された文字が来るまで読んで返します。
     *
     * @param {string} detect
     * @param {string} nest
     * @param {(false | true)} [detectContainNest]
     * @param {(false | true)} [inNest]
     * @return {*}  {{ detected: string; value: string }}
     * @memberof StringIterator
     */
    public readBeforeCharWithNest(
        detect: string,
        nest: string,
        detectContainNest?: false | true,
        inNest?: false | true
    ): { detected: string; value: string } {
        let symboles = detect + nest;
        let nestStart = nest.charAt(0);
        let nestEnd = nest.charAt(1);
        let nestCount = inNest ? 1 : 0;
        let ret = "";

        while (this.hasNext()) {
            if (nestCount > 0) {
                let current = this.readBeforeChar(nest);
                if (current.detected === nestStart) nestCount++;
                if (current.detected === nestEnd) {
                    if (--nestCount === 0 && inNest) {
                        return {
                            detected: current.detected,
                            value: ret + current.value,
                        };
                    }
                }
                ret += current.value + current.detected;
            } else {
                let current = this.readBeforeChar(symboles);
                // console.log(`detected: "${current.detected}"`);
                if (current.detected === nestStart) {
                    if (detectContainNest) {
                        return {
                            detected: nestStart,
                            value: ret + current.value,
                        };
                    } else {
                        nestCount++;
                    }
                } else if (current.detected === nestEnd) {
                    return {
                        detected: nestEnd,
                        value: ret + current.value,
                    };
                } else {
                    return {
                        detected: current.detected,
                        value: ret + current.value,
                    };
                }
                ret += current.value + current.detected;
            }
        }
        return { detected: "", value: ret };

        // while (this.hasNext() && nestCount >= 0) {
        //     let current = this.readBeforeChar(
        //         nestCount === 0 ? symboles : nest
        //     );
        //     ret += current.value;
        //     if (current.detected === nestStart) {
        //         // ネストの始まりなら
        //         ret += nestStart;
        //         nestCount++;
        //     } else if (current.detected === nestEnd) {
        //         // ネストの終わりなら
        //         ret += nestEnd;
        //         nestCount--;
        //     } else if (nestCount === 0) {
        //         // 文の切れ目なら => RETURN
        //         return { detected: current.detected, value: ret };
        //     }
        // }
        // return { detected: "}", value: ret };
    }
    /**
     * このイテレータを返します。thisが返ります。
     *
     * @return {Iterator}
     * @memberof StringIterator
     */
    [Symbol.iterator]() {
        return this;
    }
}

/**
 * インポートされた名前空間を表します。
 *
 * @class ImportedNamespace
 */
export class ImportedNamespace {
    /**
     * インポートされた名前空間を保存します。
     *
     * @type {string[]}
     * @memberof ImportedNamespace
     */
    public importeds: string[];
    /**
     * InporttedNamespaceのインスタンスを取得します。
     * @param {boolean} [hasGrammerImport=true]
     * @memberof ImportedNamespace
     */
    public constructor(parent?: ImportedNamespace, hasGrammerImport = true) {
        this.importeds = parent ? parent.importeds.slice() : [];
        if (hasGrammerImport) this.add("ams.grammer");
    }
    public newScope(): ImportedNamespace {
        return new ImportedNamespace(this, false);
    }
    /**
     * インポートされた名前空間を追加します。
     *
     * @param {string} newNamespace
     * @memberof ImportedNamespace
     */
    public add(newNamespace: string) {
        this.importeds = this.importeds.filter(
            (importeds) => importeds !== newNamespace
        );
        this.importeds.push(newNamespace);
    }
    /**
     * インポートされた名前空間を優先度順に並べたイテレータを返します。
     *
     * @return {*}
     * @memberof ImportedNamespace
     */
    public iterator() {
        return this.importeds.reverse();
    }
}
export class VariableMap<T> {
    /**
     * mapから初期化します。
     *
     * @static
     * @template T
     * @param {{ [key: string]: T }} map
     * @memberof VariableMap
     */
    public static fromMap<T>(map: { [key: string]: T }) {
        let ret = new VariableMap<T>();
        ret.map = map;
        return ret;
    }
    /**
     * 変数のマップを保存します。
     *
     * @private
     * @memberof VariableMap
     */
    private map;
    /**
     * 親のスコープ。
     *
     * @private
     * @type {(VariableMap<T> | null)}
     * @memberof VariableMap
     */
    private parent: VariableMap<T> | null;
    /**
     * VariableMapのインスタンスを作成します。
     * @param {VariableMap<T>} [parent]
     * @memberof VariableMap
     */
    public constructor(parent?: VariableMap<T>) {
        this.map = parent ? Object.create(parent.getMap()) : {};
        this.parent = parent ?? null;
    }
    /**
     * 新しいスコープを切って返します。
     *
     * @return {*}
     * @memberof VariableMap
     */
    public newScope() {
        return new VariableMap<T>(this);
    }
    /**
     * このVariablesが名前に対応する値を持っていたらtrue,それ以外ならfalse
     *
     * @param {string} name
     * @return {*}  {boolean}
     * @memberof VariableMap
     */
    public has(name: string): boolean {
        return name in this.map;
    }
    /**
     * Variablesが持つ変数を返します。
     *
     * @param {string} name
     * @return {*}  {T}
     * @memberof VariableMap
     */
    public get(name: string): T {
        return this.map[name];
    }
    /**
     * Variablesに変数を登録します。
     *
     * @param {string} name
     * @param {T} object
     * @memberof VariableMap
     */
    public set(name: string, object: T): void {
        if (this.parent?.has(name)) {
            this.parent.set(name, object);
        } else {
            this.map[name] = object;
        }
    }
    /**
     * スコープ内の変数を無視して自分自身に変数を紐づけます。
     *
     * @param {string} name
     * @param {T} object
     * @memberof VariableMap
     */
    public setAsOwn(name: string, object: T): void {
        this.map[name] = object;
    }
    /**
     * このインスタンスが保持するマップを返します。
     *
     * @private
     * @return {*}  {{}}
     * @memberof VariableMap
     */
    private getMap(): {} {
        return this.map;
    }
    /**
     * このインスタンスの文字列表現を返します。
     *
     * @return {*}  {string}
     * @memberof VariableMap
     */
    public toString(): string {
        return this.constructor.name + ": " + JSON.stringify(this, null, 2);
    }
}
/**
 * 名前空間付きの変数マップ。
 *
 * @class NamespacedVariable
 * @extends {VariableMap<T>}
 * @template T
 */
export class NamespacedVariable<T> extends VariableMap<T> {
    /**
     * 名前空間がついている変数マップ
     *
     * @protected
     * @type {{ [key: string]: VariableMap<T> }}
     * @memberof NamespacedVariable
     */
    protected namespacedVariableMaps: { [key: string]: VariableMap<T> };
    /**
     * インポートされた名前空間。
     *
     * @protected
     * @type {ImportedNamespace}
     * @memberof NamespacedVariable
     */
    protected imported: ImportedNamespace;
    /**
     * NamespacedVariableのインスタンスを取得します。
     * @param {ImportedNamespace} [nameSpace]
     * @param {VariableMap<T>} [parent]
     * @memberof NamespacedVariable
     */
    public constructor(
        nameSpace?: ImportedNamespace,
        parent?: NamespacedVariable<T>
    ) {
        super(parent);
        this.imported = nameSpace ?? new ImportedNamespace();
        this.namespacedVariableMaps = parent
            ? parent.namespacedVariableMaps
            : {};
    }
    /**
     * 名前空間がついたVariablesを追加します。
     *
     * @param {string} spaceName
     * @param {VariableMap<T>} variables
     * @memberof NamespacedVariable
     */
    public addNamespacedVariableMap(
        spaceName: string,
        variables: VariableMap<T>
    ) {
        this.namespacedVariableMaps[spaceName] = variables;
    }

    /**
     * 名前空間がついたVariablesを複数追加します。
     *
     * @param {{
     *         [key: string]: VariableMap<T>;
     *     }} spaces
     * @memberof NamespacedVariable
     */
    public addNamespacedVariableMaps(spaces: {
        [key: string]: VariableMap<T>;
    }) {
        for (let key of Object.keys(spaces)) {
            this.addNamespacedVariableMap(key, spaces[key]);
        }
    }
    /**
     * 値を取得します。ローカルにない場合は、追加されているVariablesから取得します。
     *
     * @param {string} name
     * @return {*}  {T}
     * @memberof NamespacedVariable
     */
    public get(name: string): T {
        return super.get(name) ?? this.getNamespaced(name);
    }
    /**
     * 名前空間付き変数を含めて変数が存在したらtrue、しなければfalse
     *
     * @param {string} name
     * @return {*}  {boolean}
     * @memberof NamespacedVariable
     */
    public has(name: string): boolean {
        return this.get(name) ? true : false;
    }
    public set(name: string, value: T): void {
        if (name === "import") {
            this.addImport(value.toString());
        } else {
            super.set(name, value);
        }
    }
    /**
     * 新しいローカルスコープを返します。
     *
     * @return {*}  {NamespacedVariable<T>}
     * @memberof NamespacedVariable
     */
    public newScope(): NamespacedVariable<T> {
        return new NamespacedVariable<T>(this.imported.newScope(), this);
    }
    /**
     * 名前空間をインポートします。インポートされた名前空間は以後名前空間なしで使うことができるようになります。
     *
     * @param {string} namespace
     * @memberof NamespacedVariable
     */
    public addImport(namespace: string) {
        this.imported.add(namespace);
    }
    /**
     * 名前空間と変数名を分離します。
     * ams.grammer.forなら、ams.grammerとforに分解されます。
     *
     * @param {string} name
     * @return {*}  {({
     *         namespace: string | null;
     *         name: string;
     *     })}
     * @memberof NamespacedVariable
     */
    public separateNamespaced(name: string): {
        namespace: string | null;
        name: string;
    } {
        let splited = name.split(".");
        return {
            namespace: splited.slice(0, splited.length - 1).join("."),
            name: splited[splited.length - 1],
        };
    }
    /**
     * 現在インポートされている名前空間をもとに、変数名から名前空間を推論します。
     *
     * @param {string} name
     * @return {*}  {string}
     * @memberof NamespacedVariable
     */
    public guessNamespace(name: string): string {
        for (let imported of this.imported.iterator()) {
            if (this.namespacedVariableMaps[imported]?.has(name)) {
                return imported;
            }
        }
        return "";
    }
    /**
     * インポートされている名前空間をもとに、名前空間付けされた変数を取得します。
     *
     * @param {string} combined
     * @return {*}  {T}
     * @memberof NamespacedVariable
     */
    public getNamespaced(combined: string): T {
        let { namespace, name } = this.separateNamespaced(combined);
        let guessed;
        if (!namespace && (guessed = this.guessNamespace(name)).length > 0) {
            return this.namespacedVariableMaps[guessed].get(name);
        }
        return this.namespacedVariableMaps[namespace]?.get(name);
    }
}
/**
 * 予約された記号を保持します。
 *
 * @export
 * @class ReservedWord
 */
export class ReservedWord {
    static NEST = "{}";
    static NEST_START = this.NEST.charAt(0);
    static NEST_END = this.NEST.charAt(1);
    static VARIABLE = "\\";
    static INVOKER = ":";
    static SEPARATOR = ";";
}

export interface HtmlObject {
    tagName: string;
    attrs: { [key: string]: string };
    text?: string;
    children: HtmlObject[];
}

/**
 * AMSにおける、文の最小の構造を表します。
 *
 * @export
 * @abstract
 * @class Invokable
 */
export abstract class Invokable {
    /**
     * NULL値として扱います。
     *
     * @static
     * @memberof Invokable
     */
    public static NULL = new (class extends Invokable {
        public invoke(
            argument: Invokable,
            variables: VariableMap<Invokable>
        ): Invokable {
            return this;
        }
        public invokeAsPlainText(variable: VariableMap<Invokable>): string {
            return "[" + this.TAG + "]";
        }
        public invokeAsHtmlObject(
            variable: VariableMap<Invokable>
        ): HtmlObject {
            return { tagName: "span", attrs: {}, children: [], text: "[NULL]" };
        }
        public getStructureString(indentOffset: string = ""): string {
            return "\n" + indentOffset + `==${this.TAG}==`;
        }
        private TAG = "NULL";
    })();
    /**
     * 自分の子供になる要素
     *
     * @private
     * @type {Invokable[]}
     * @memberof Invokable
     */
    private children: Invokable[] = [];
    /**
     * 構造文字列を取得する際に使用します。
     *
     * @protected
     * @memberof Invokable
     */
    protected indenter = "| ";

    /**
     * このインスタンスのgetAtメソッドで返される値を順番に返します。
     *
     * @return {*}
     * @memberof Invokable
     */
    public iterator() {
        let outerThis = this;
        let children = this.children;
        return new (class implements IterableIterator<Invokable> {
            private index = -1;
            public next(): IteratorResult<Invokable> {
                let current = outerThis.getAt(++this.index);
                if (current) {
                    return { done: false, value: current };
                } else {
                    return { done: true, value: Invokable.NULL };
                }
            }
            [Symbol.iterator](): IterableIterator<Invokable> {
                return this;
            }
        })();
    }
    /**
     * 次の要素を引数として呼び出されます。
     *
     * @abstract
     * @param {Invokable} argument 引数となる次の要素
     * @param {VariableMap<Invokable>} variables 実行時に存在する変数
     * @return {Invokable} 呼び出した結果
     * @memberof Invokable
     */
    public invoke(
        argument: Invokable,
        variables: VariableMap<Invokable>
    ): Invokable {
        return argument;
    }
    /**
     * 次の要素なしで呼び出されます。
     *
     * @param {VariableMap<Invokable>} variables 実行時に存在する変数
     * @return {Invokable} 呼び出した結果
     * @memberof Invokable
     */
    public invokeFinal(variables: VariableMap<Invokable>): Invokable {
        return this;
    }
    /**
     * このインスタンスの子供の要素を取得します。
     *
     * @param {number} index
     * @return {*}  {(Invokable | null)}
     * @memberof Invokable
     */
    public getAt(index: number): Invokable | null {
        return this.children[index];
    }
    /**
     * このインスタンスの子供の要素を置換します。
     *
     * @param {Invokable[]} children
     * @memberof Invokable
     */
    public set(children: Invokable[]): void {
        this.children = children;
    }
    /**
     * このインスタンスの子供の要素の一部を置き換えます。
     *
     * @param {number} index
     * @param {Invokable} child
     * @memberof Invokable
     */
    public setAt(index: number, child: Invokable): void {
        this.children[index] = child;
    }
    /**
     * このインスタンスの子供の要素の最後に追加します。
     *
     * @param {Invokable} child
     * @memberof Invokable
     */
    public append(child: Invokable): void {
        this.children.push(child);
    }
    /**
     * このインスタンスの構造文字列を取得します。
     *
     * @abstract
     * @param {string} [indentOffset]
     * @return {*}  {string}
     * @memberof Invokable
     */
    public abstract getStructureString(indentOffset?: string): string;
    public abstract invokeAsPlainText(
        variables: VariableMap<Invokable>
    ): string;
    public abstract invokeAsHtmlObject(
        variables: VariableMap<Invokable>
    ): HtmlObject;
}

export class StackTrace {
    private position: (string | number)[];
    public constructor(position: (string | number)[]) {
        this.position = position;
    }
    public toString(): string {
        return `\tat (${this.position.join(":")})`;
    }
}

export abstract class StopInvokable extends Invokable {
    protected stackTraces: StackTrace[] = [];
    public addStacktrace(stackTrace: StackTrace) {
        this.stackTraces.push(stackTrace);
    }
    public getTraceString(): string {
        let ret: string[] = [];
        this.stackTraces.forEach((trace) => ret.push(trace.toString()));
        return ret.join("\n");
    }
    public abstract getStopId(): string;
}

/**
 * AMSのParagraphを表します。
 *
 * @class Paragraph
 * @extends {Invokable}
 */
class Paragraph extends Invokable {
    /**
     * まだメモ化されていない文字列が入ります。
     *
     * @private
     * @type {((string | null)[])}
     * @memberof Paragraph
     */
    private notLoaded: (string | null)[];
    /**
     * イテレータをもとに、インスタンスを初期化します。
     * @param {StringIterator} iterator
     * @memberof Paragraph
     */
    public constructor(iterator: StringIterator) {
        super();
        // AA;BB;CCとかがiteratorに流れてくる
        let sentences = [];
        while (iterator.hasNext()) {
            sentences.push(
                iterator.readBeforeCharWithNest(
                    ReservedWord.SEPARATOR,
                    ReservedWord.NEST
                ).value
            );
        }
        this.notLoaded = sentences;
        this.set(Array(sentences.length));
    }

    /**
     * メモ化されていなければメモ化し、自分の子要素のindex番目を返します。
     *
     * @param {number} index
     * @return {*}  {(Invokable | null)}
     * @memberof Paragraph
     */
    public getAt(index: number): Invokable | null {
        let toLoad;
        if (
            !super.getAt(index) &&
            typeof (toLoad = this.notLoaded[index]) === "string"
        ) {
            this.setAt(
                index,
                new Invokable$Builder()
                    .setIterator(new StringIterator(toLoad))
                    .setType(Invokable$Type.SENTENCE)
                    .build()
            );
            this.notLoaded[index] = null;
        }
        return super.getAt(index);
    }
    /**
     * 子要素のそれぞれに対して実行されます。
     *
     * @param {Invokable} argument
     * @param {VariableMap<Invokable>} variables
     * @return {*}  {Invokable}
     * @memberof Paragraph
     */
    public invoke(
        argument: Invokable,
        variables: VariableMap<Invokable>
    ): Invokable {
        let scopedVariables = variables.newScope();
        let ret = new Paragraph(new StringIterator(""));
        for (let current of this.iterator()) {
            let currentResult = current.invoke(argument, scopedVariables);
            if (currentResult instanceof StopInvokable) {
                return currentResult;
            }
            ret.append(currentResult);
        }
        return ret;
    }
    /**
     * 子要素のそれぞれに対して実行されます。
     *
     * @param {VariableMap<Invokable>} variables
     * @return {*}
     * @memberof Paragraph
     */
    public invokeFinal(variables: VariableMap<Invokable>) {
        let scopedVariables = variables.newScope();
        let ret = new Paragraph(new StringIterator(""));
        for (let current of this.iterator()) {
            let currentResult = current.invokeFinal(scopedVariables);
            if (currentResult instanceof StopInvokable) {
                return currentResult;
            }
            ret.append(currentResult);
        }
        return ret;
    }
    public append(invokable: Invokable): void {
        super.append(invokable);
        this.notLoaded.push(null);
    }
    public invokeAsPlainText(variable: VariableMap<Invokable>): string {
        let ret = "";
        for (let current of this.invokeFinal(variable).iterator()) {
            ret += current.invokeAsPlainText(variable);
        }
        return ret;
    }
    public invokeAsHtmlObject(variable: VariableMap<Invokable>): HtmlObject {
        let ret: HtmlObject = { tagName: "div", attrs: {}, children: [] };
        for (let current of this.invokeFinal(variable).iterator()) {
            ret.children.push(current.invokeAsHtmlObject(variable));
        }
        return ret;
    }
    /**
     * インスタンスの構造文字列を返します。
     *
     * @param {string} [indentOffset=""]
     * @return {*}  {string}
     * @memberof Paragraph
     */
    public getStructureString(indentOffset: string = ""): string {
        let indenter: string = this.indenter;
        let result = "";
        let repeatedIndenter = indentOffset + indenter;
        for (var i = 0; i < this.notLoaded.length; i++) {
            let currentText = this.notLoaded[i];
            let child;
            if (currentText) {
                result += "\n";
                result += repeatedIndenter;
                result += "[not-meoized]: ";
                result += currentText;
            } else if ((child = this.getAt(i))) {
                result += child.getStructureString(indentOffset + indenter);
            } else {
                result += Invokable.NULL.getStructureString();
            }
        }
        return `
${indentOffset}Paragraph: {${result}
${indentOffset}}`;
    }
}

/**
 * AMSの文におけるSentenceを表します。
 *
 * @class Sentence
 * @extends {Invokable}
 */
class Sentence extends Invokable {
    /**
     * 構造文字列のためのインデント文字です。
     *
     * @protected
     * @memberof Sentence
     */
    protected indenter = "- ";
    /**
     * Sentenceのインスタンスを文字列イテレータをもとに初期化します。
     * @param {StringIterator} iterator
     * @memberof Sentence
     */
    public constructor(iterator: StringIterator) {
        super();
        // AA:BB とか AA{...Arguments...}BBとかがiteratorに流れてくる
        // AA => 文字列
        // /AA => 変数
        // : => 引数なし呼び出し
        // {...} => Argumentsを引数として呼び出し
        let last = "";
        // console.log("=\t=\t=\t=");
        while (iterator.hasNext() || last !== "") {
            let current = iterator.readBeforeCharWithNest(
                "\\:",
                "{}",
                true,
                last === ReservedWord.NEST_START
            );
            // console.log(current);
            if (last === ReservedWord.NEST_END) last = "";
            let value = current.value;
            if (
                last === ReservedWord.VARIABLE ||
                last === ReservedWord.INVOKER ||
                last === ReservedWord.NEST_START ||
                value.length > 0
            ) {
                this.append(
                    new Invokable$Builder()
                        .setIterator(new StringIterator(last + value))
                        .setType(Invokable$Type.WORD)
                        .build()
                );
            }
            last = current.detected;
        }
    }
    /**
     * 子要素をチェーンして呼び出し、チェーン終了後にさらに引数ありでInvokeします。
     *
     * @param {Invokable} argument
     * @param {VariableMap<Invokable>} variables
     * @return {*}
     * @memberof Sentence
     */
    public invoke(argument: Invokable, variables: VariableMap<Invokable>) {
        return this.invokeFinal(variables).invoke(argument, variables);
    }
    /**
     * 子要素のWordに対してチェーンさせて呼び出し、結果にinvokeFinalして返します。
     *
     * @param {VariableMap<Invokable>} variables
     * @return {*}  {Invokable}
     * @memberof Sentence
     */
    public invokeFinal(variables: VariableMap<Invokable>): Invokable {
        let iterator = this.iterator();
        let iterated = iterator.next();
        if (!iterated.done) {
            let last = iterated.value;
            for (let current of iterator) {
                last = last.invoke(current, variables);
            }
            return last.invokeFinal(variables);
        } else {
            // この場合そもそもSentenceオブジェクトが生成されることはない
            return Invokable.NULL;
        }
    }
    public invokeAsPlainText(variable: VariableMap<Invokable>): string {
        return this.invokeFinal(variable).invokeAsPlainText(variable);
    }
    public invokeAsHtmlObject(variable: VariableMap<Invokable>): HtmlObject {
        return this.invokeFinal(variable).invokeAsHtmlObject(variable);
    }
    /**
     * インスタンスの構造文字列を返します。
     *
     * @param {string} [indentOffset=""]
     * @return {*}  {string}
     * @memberof Sentence
     */
    public getStructureString(indentOffset: string = ""): string {
        let indenter: string = this.indenter;
        let result = "\n" + indentOffset + "Sentence:";
        for (let current of this.iterator()) {
            result += current.getStructureString(indentOffset + indenter);
        }
        return result;
    }
}

/**
 * AMSのワードを表す抽象クラスです。
 *
 * @abstract
 * @class Word
 * @extends {Invokable}
 */
abstract class Word extends Invokable {
    protected indenter = "+ ";
}

/**
 * AMSの変数構文を表します。
 *
 * @class Variable
 * @extends {Word}
 */
class Variable extends Word {
    /**
     * 変数名を表します。
     *
     * @private
     * @memberof Variable
     */
    private name;
    /**
     * Variableのインスタンスを名前を指定して初期化します。
     * @param {string} name
     * @memberof Variable
     */
    constructor(name: string) {
        super();
        this.name = name;
    }
    /**
     * 変数の参照を返します。
     *
     * @param {Invokable} argument
     * @param {VariableMap<Invokable>} variables
     * @return {*}  {Invokable}
     * @memberof Variable
     */
    public invoke(
        argument: Invokable,
        variables: VariableMap<Invokable>
    ): Invokable {
        let current = argument.iterator().next();
        if (current.done) {
            // 引数なし
            return variables.has(this.name)
                ? variables.get(this.name)
                : Invokable.NULL;
        } else {
            // 引数あり
            let invoked = current.value.invokeFinal(variables);
            variables.set(this.name, invoked);
            return invoked;
        }
    }
    public invokeAsPlainText(variable: VariableMap<Invokable>): string {
        return "[ref\\" + this.name + "]";
    }
    public invokeAsHtmlObject(variable: VariableMap<Invokable>): HtmlObject {
        return {
            tagName: "span",
            attrs: {},
            children: [],
            text: "[ref\\" + this.name + "]",
        };
    }
    /**
     * インスタンスの構造文字列を返します。
     *
     * @param {string} [indentOffset=""]
     * @return {*}  {string}
     * @memberof Variable
     */
    public getStructureString(indentOffset: string = ""): string {
        let indenter: string = this.indenter;
        return `
${indentOffset}Variable: 
${indentOffset}${indenter}\\${this.name}`;
    }
}
/**
 * AMSのInvokerを表します。
 *
 * @class Invoker
 * @extends {Word}
 */
class Invoker extends Word {
    public isNull: boolean;
    /**
     * Invokerのインスタンスを内容の文字列をもとに初期化します。
     * @param {string} sentence
     * @memberof Invoker
     */
    constructor(sentence: string) {
        super();
        this.isNull = sentence.length === 0;
        if (!this.isNull) {
            this.setAt(
                0,
                new Invokable$Builder()
                    .setIterator(new StringIterator(sentence))
                    .setType(Invokable$Type.WORD)
                    .build()
            );
        }
    }
    public getAt(index: number): Invokable | null {
        return this.isNull ? null : super.getAt(index);
    }
    /**
     * Invokerが呼び出されたときに呼ばれます。
     *
     * @param {Invokable} argument
     * @param {VariableMap<Invokable>} variables
     * @return {*}
     * @memberof Invoker
     */
    public invoke(argument: Invokable, variables: VariableMap<Invokable>) {
        return this.isNull
            ? argument
            : this.iterator().next().value.invoke(argument, variables);
    }
    /**
     * SentenceにInvokerが1つのみ書かれていた時に呼び出されます。
     *
     * @param {VariableMap<Invokable>} variables
     * @return {*}
     * @memberof Invoker
     */
    public invokeFinal(variables: VariableMap<Invokable>) {
        return this.isNull
            ? Invokable.NULL
            : this.iterator().next().value.invokeFinal(variables);
    }
    public invokeAsPlainText(variable: VariableMap<Invokable>): string {
        let child = this.iterator().next();
        return `[invoker]:${
            this.isNull ? "" : child.value.invokeAsPlainText(variable)
        }`;
    }
    public invokeAsHtmlObject(variable: VariableMap<Invokable>): HtmlObject {
        let child = this.iterator().next();
        return {
            tagName: "span",
            attrs: {},
            children: this.isNull
                ? []
                : [child.value.invokeAsHtmlObject(variable)],
        };
    }
    /**
     * インスタンスの構造文字列を取得します。
     *
     * @param {string} [indentOffset=""]
     * @return {*}  {string}
     * @memberof Invoker
     */
    public getStructureString(indentOffset: string = ""): string {
        let indenter: string = this.indenter;
        let child = this.iterator().next();
        return `
${indentOffset}Invoker::${
            this.isNull
                ? "\n" + indentOffset + indenter + "None"
                : child.value.getStructureString(indentOffset + indenter)
        }`;
    }
}
/**
 * AMSのTextを表します。
 *
 * @class Text
 * @extends {Word}
 */
class Text extends Word {
    /**
     * インスタンスの内容を表します。
     *
     * @private
     * @memberof Text
     */
    private text;
    /**
     * テキストをもとにインスタンスを初期化します。
     * @param {string} text
     * @memberof Text
     */
    public constructor(text: string) {
        super();
        this.text = text;
    }
    public invokeAsPlainText(variable: VariableMap<Invokable>): string {
        return this.text;
    }
    public invokeAsHtmlObject(variable: VariableMap<Invokable>): HtmlObject {
        return { tagName: "span", attrs: {}, children: [], text: this.text };
    }
    /**
     * インスタンスの構造文字列を返します。
     *
     * @param {string} [indentOffset=""]
     * @return {*}  {string}
     * @memberof Text
     */
    public getStructureString(indentOffset: string = ""): string {
        let indenter: string = this.indenter;
        return `
${indentOffset}Text: 
${indentOffset}${indenter}"${this.text}"`;
    }
}
/**
 * AMSの大きく分けて3つの単位を表す定数です。
 *
 * @enum {number}
 */
const enum Invokable$Type {
    /**
     * Paragraphを表します。
     */
    PARAGRAPH,
    /**
     * Sentenceを表します。
     */
    SENTENCE,
    /**
     * Wordを表します。
     */
    WORD,
}
/**
 * Invokableのビルダーです。
 *
 * @class Invokable$Builder
 */
class Invokable$Builder {
    /**
     * 初期化する際のイテレータです。
     *
     * @private
     * @type {(StringIterator | null)}
     * @memberof Invokable$Builder
     */
    private iterator: StringIterator | null = null;
    /**
     * 初期化する際のタイプです。割り当てられなかった場合はParagraphが割り当てられます。
     *
     * @private
     * @type {(Invokable$Type | null)}
     * @memberof Invokable$Builder
     */
    private type: Invokable$Type = Invokable$Type.PARAGRAPH;
    /**
     * インスタンスのイテレータを設定します。
     *
     * @param {StringIterator} iterator
     * @return {*}
     * @memberof Invokable$Builder
     */
    setIterator(iterator: StringIterator) {
        this.iterator = iterator;
        return this;
    }
    /**
     * イテレータの内容を設定します。設定しなかった場合はPargraphが割り当てられます。
     *
     * @param {Invokable$Type} type
     * @return {*}
     * @memberof Invokable$Builder
     */
    setType(type: Invokable$Type) {
        this.type = type;
        return this;
    }
    /**
     * 設定された情報をもとにInvokableインスタンスを初期化します。
     *
     * @return {*}  {Invokable}
     * @memberof Invokable$Builder
     */
    build(): Invokable {
        if (!this.iterator) throw "iterator must be set.";
        if (this.type === Invokable$Type.PARAGRAPH) {
            return new Paragraph(this.iterator);
        } else if (this.type === Invokable$Type.SENTENCE) {
            return new Sentence(this.iterator);
        } else {
            let first = this.iterator.next().value;
            if (first === ReservedWord.VARIABLE) {
                return new Variable(this.iterator.readAll());
            } else if (first === ReservedWord.NEST_START) {
                return new Paragraph(this.iterator);
            } else if (first === ReservedWord.INVOKER) {
                return new Invoker(this.iterator.readAll());
            } else {
                let text = first + this.iterator.readAll();
                if (text.length > 0) {
                    return new Text(text);
                } else {
                    return Invokable.NULL;
                }
            }
        }
    }
}

/**
 * AMSのパーサーです。
 *
 * @export
 * @class Parser
 */
export class Parser {
    /**
     * 予約文字を表します。
     *
     * @private
     * @static
     * @memberof Parser
     */
    private static symbols = "{};:\\";
    /**
     * パースする際に無視する文字列を設定します。
     *
     * @private
     * @static
     * @memberof Parser
     */
    private static ignores = " \n";
    /**
     * 指定された文字が予約文字ならtrue,そうでないならfalse
     *
     * @private
     * @static
     * @param {string} char
     * @return {*}  {boolean}
     * @memberof Parser
     */
    private static isSymbol(char: string): boolean {
        for (var i = 0; i < this.symbols.length; i++) {
            if (char === this.symbols[i]) {
                return true;
            }
        }
        return false;
    }
    /**
     * 指定された文字が無視する文字ならtrue,そうでないならfalse
     *
     * @private
     * @static
     * @param {string} char
     * @return {*}  {boolean}
     * @memberof Parser
     */
    private static isIgnore(char: string): boolean {
        for (var i = 0; i < this.ignores.length; i++) {
            if (char === this.ignores[i]) {
                return true;
            }
        }
        return false;
    }
    /**
     * AMSをパースして返します。
     *
     * @static
     * @param {string} ams
     * @return {*}  {Invokable}
     * @memberof Parser
     */
    public static parse(ams: string): Invokable {
        let iterator = new StringIterator(ams);
        let last = "{";
        let ignored = false;
        let formatted = "";
        while (iterator.hasNext()) {
            let current = iterator.next().value;

            if (Parser.isIgnore(current)) {
                // 無視する文字
                ignored = true;
            } else {
                // 普通の文字
                if (ignored) {
                    // 無視している途中なら
                    ignored = false;
                    if (!Parser.isSymbol(current) && !Parser.isSymbol(last)) {
                        // どちらもシンボルではない　＝＞　空白1つ
                        formatted += " ";
                    }
                }
                formatted += current;
                last = current;
            }
        }
        return new Invokable$Builder()
            .setIterator(new StringIterator(formatted))
            .build();
    }
}
/**
 * 実行が終了した際に呼ばれます。
 *
 * @export
 * @interface OnExecutionFinishListener
 * @template T
 */
export interface OnExecutionFinishListener<T> {
    onFinish(result: ExecutionResult<T>): void;
}

/**
 * 実行結果を表します。
 *
 * @export
 * @abstract
 * @class ExecutionResult
 * @template T
 */
export abstract class ExecutionResult<T> {
    private result: T | null = null;
    /**
     * 実行結果を返します。実行が終了していない場合はnullを返します。
     *
     * @abstract
     * @return {*}  {T}
     * @memberof ExecutionResult
     */
    public getResult(): T | null {
        return this.result;
    }
    private _isFinished = false;
    public isFinished(): boolean {
        return this._isFinished;
    }
    /**
     * 処理が完了したときに呼びます。
     *
     * @protected
     * @memberof ExecutionResult
     */
    public finish(result: T): void {
        this.result = result;
        this._isFinished = true;
        this.onExecutionFinishedListeners.forEach((listener) => {
            try {
                listener.onFinish(this);
            } catch (e) {
                console.error(e);
            }
        });
    }
    /**
     * 実行が終了した際に呼ばれるリスナーを設定します。
     *
     * @private
     * @type {OnExecutionFinishListener<T>[]}
     * @memberof ExecutionResult
     */
    private onExecutionFinishedListeners: OnExecutionFinishListener<T>[] = [];
    // ExecutionResultクラスにfinish()を定義して、それが呼ばれたときに呼ばれるように実装
    /**
     * 実行終了時のリスナーを追加します。
     *
     * @param {OnExecutionFinishListener<T>} listener
     * @memberof ExecutionResult
     */
    public addOnExecutionFinishListener(
        listener: OnExecutionFinishListener<T>
    ): void {
        this.onExecutionFinishedListeners.push(listener);
    }
}

/**
 * AMSを実行する抽象クラスです。
 *
 * @export
 * @abstract
 * @class Executor
 * @template T
 */
export abstract class Executor<T> {
    private namespaces: NamespacedVariable<Invokable> =
        new NamespacedVariable<Invokable>();
    public addNamespace(namespace: {
        [key: string]: { [key: string]: Invokable };
    }): void {
        for (const key of Object.keys(namespace)) {
            this.namespaces.addNamespacedVariableMap(
                key,
                VariableMap.fromMap<Invokable>(namespace[key])
            );
        }
    }
    public getNamespaces(): NamespacedVariable<Invokable> {
        return this.namespaces.newScope();
    }
    abstract execute(
        invokable: Invokable,
        runOnCurrentThread?: boolean
    ): ExecutionResult<T>;
}

export class PlainTextExecutionResult extends ExecutionResult<string> {}

export class PlainTextExecutor extends Executor<string> {
    public execute(invokable: Invokable): PlainTextExecutionResult {
        let ret = new PlainTextExecutionResult();
        let result = invokable.invokeAsPlainText(this.getNamespaces());
        ret.finish(result);
        return ret;
    }
}

export class HtmlObjectExecutionResult extends ExecutionResult<HtmlObject> {}

export class HtmlObjectExecutor extends Executor<HtmlObject> {
    execute(invokable: Invokable): HtmlObjectExecutionResult {
        let ret = new HtmlObjectExecutionResult();
        let result = invokable.invokeAsHtmlObject(this.getNamespaces());
        ret.finish(result);
        return ret;
    }
}
