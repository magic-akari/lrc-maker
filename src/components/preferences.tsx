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
                    </section>
                </li>
                <li>
                    <section className="list-item">
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
            </ul>
        </div>
    );
};
