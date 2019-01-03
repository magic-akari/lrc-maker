import { convertTimeToTag, formatText, getFormatter } from "../hooks/useLrc.js";
import {
    Action as PrefAction,
    ActionType as PrefActionType,
    State as PrefState,
    themeColor,
} from "../hooks/usePref.js";

const { useCallback, useRef, useEffect } = React;

interface IPreferencesProps {
    prefState: PrefState;
    prefDispatch: React.Dispatch<PrefAction>;
}

const info: Record<"version" | "hash" | "updateTime", string> = JSON.parse(
    document.getElementById("app-info")!.textContent!,
);

export const Preferences: React.FC<IPreferencesProps> = ({
    prefState,
    prefDispatch,
}) => {
    const onColorPick = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            prefDispatch({
                type: PrefActionType.themeColor,
                payload: ev.target.value,
            });
        },
        [],
    );

    const userColorInput = useRef<HTMLInputElement>(null);

    const handleUserInput = useCallback(
        (input: EventTarget & HTMLInputElement) => {
            let value = input.value;

            if (!input.validity.valid) {
                input.value = input.defaultValue;
                return;
            }

            if (value.length === 3) {
                value = [].map.call(value, (v: string) => v + v).join("");
            }
            if (value.length < 6) {
                value = value.padEnd(6, "0");
            }

            prefDispatch({
                type: PrefActionType.themeColor,
                payload: "#" + value,
            });
        },
        [],
    );

    const onUserColorInputBlur = useCallback(
        (ev: React.FocusEvent<HTMLInputElement>) => handleUserInput(ev.target),
        [],
    );

    const onSubmit = useCallback((ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();

        const form = ev.target as HTMLFormElement;

        const input = form.elements.namedItem(
            "user-color-input",
        )! as HTMLInputElement;

        return handleUserInput(input);
    }, []);

    useEffect(
        () => {
            userColorInput.current!.value = prefState.themeColor.slice(1);
        },
        [prefState.themeColor],
    );

    const onChangeSpace = useCallback(
        (ev: React.FocusEvent<HTMLInputElement>) => {
            const input = ev.target;
            const name = input.name as PrefActionType.spaceStart &
                PrefActionType.spaceEnd;

            prefDispatch({
                type: name,
                payload: Number.parseInt(input.value, 10),
            });
        },
        [],
    );

    const onChangeFixed = useCallback(
        (ev: React.ChangeEvent<HTMLSelectElement>) => {
            prefDispatch({
                type: PrefActionType.fixed,
                payload: Number.parseInt(ev.target.value, 10) as Fixed,
            });
        },
        [],
    );

    return (
        <div className="preferences">
            <ul>
                <li>
                    <section className="list-item">
                        <span>版本</span>
                        <span className="select-all">{info.version}</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>Commit hash</span>
                        <span className="select-all">{info.hash}</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>最近更新</span>
                        <span>{info.updateTime}</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>项目地址</span>
                        <a href={Repo.url} target="_blank">
                            Github
                        </a>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>关于 &amp; 帮助</span>
                        <a href={Repo.wiki} target="_blank">
                            Github Wiki
                        </a>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>语言</span>
                        <select defaultValue={"en-US"}>
                            <option key={"en-US"} value={"en-US"}>
                                English
                            </option>
                        </select>
                    </section>
                </li>
                <li>
                    <label className="list-item">
                        <span>使用浏览器内建播放器</span>
                        <label className="label-switch">
                            <input
                                type="checkbox"
                                checked={prefState.builtInAudio}
                                onChange={() =>
                                    prefDispatch({
                                        type: PrefActionType.builtInAudio,
                                        payload: !prefState.builtInAudio,
                                    })
                                }
                            />
                            <div className="checkbox" />
                        </label>
                    </label>
                </li>
                <li>
                    <label className="list-item">
                        <span>启用虚拟空格键</span>
                        <label className="label-switch">
                            <input
                                type="checkbox"
                                checked={prefState.screenButton}
                                onChange={() => {
                                    prefDispatch({
                                        type: PrefActionType.screenButton,
                                        payload: !prefState.screenButton,
                                    });
                                }}
                            />
                            <div className="checkbox" />
                        </label>
                    </label>
                </li>

                <li>
                    <section className="list-item">
                        <span>主题颜色</span>
                        <form onSubmit={onSubmit}>
                            {Object.values(themeColor).map((color) => {
                                const checked = color === prefState.themeColor;
                                const classNames = ["color-picker", "ripple"];
                                if (checked) {
                                    classNames.push("checked");
                                }
                                return (
                                    <label
                                        className={classNames.join(" ")}
                                        key={color}
                                        style={{ backgroundColor: color }}>
                                        <input
                                            hidden
                                            type="radio"
                                            name="theme-color"
                                            value={color}
                                            checked={checked}
                                            onChange={onColorPick}
                                        />
                                    </label>
                                );
                            })}
                            <label
                                className="color-picker ripple user-color-label"
                                htmlFor="user-color-input"
                                style={{
                                    backgroundColor: prefState.themeColor,
                                }}>
                                #
                            </label>
                            <input
                                ref={userColorInput}
                                id="user-color-input"
                                name="user-color-input"
                                className="user-color-input"
                                type="text"
                                pattern="[\da-f]{3,6}"
                                required
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                defaultValue={prefState.themeColor.slice(1)}
                                onBlur={onUserColorInputBlur}
                            />
                        </form>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>歌词输出格式控制</span>
                        <span>
                            <time className="format-example-time">
                                {convertTimeToTag(
                                    83.456,
                                    getFormatter(prefState.fixed),
                                )}
                            </time>
                            <pre className="format-example-text">
                                {formatText(
                                    "hello 世界～  ",
                                    prefState.spaceStart,
                                    prefState.spaceEnd,
                                )}
                            </pre>
                        </span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>小数点</span>
                        <select
                            name=""
                            id=""
                            value={prefState.fixed}
                            onChange={onChangeFixed}>
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                        </select>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>左侧空格</span>

                        <div className="stepper">
                            <button className="addOnLeft ripple">-</button>
                            <input
                                type="number"
                                min="-1"
                                step="1"
                                name="spaceStart"
                                value={prefState.spaceStart}
                                onChange={onChangeSpace}
                            />
                            <button className="addOnRight ripple">+</button>
                        </div>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>右侧空格</span>

                        <div className="stepper">
                            <button className="addOnLeft ripple">-</button>
                            <input
                                type="number"
                                min="-1"
                                step="1"
                                name="spaceEnd"
                                value={prefState.spaceEnd}
                                onChange={onChangeSpace}
                            />
                            <button className="addOnRight ripple">+</button>
                        </div>
                    </section>
                </li>
            </ul>
        </div>
    );
};
