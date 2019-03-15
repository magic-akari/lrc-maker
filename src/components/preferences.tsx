import { themeColor } from "../hooks/usePref.js";
import { convertTimeToTag, formatText } from "../lrc-parser/lrc-parser.js";
import { unregister } from "../utils/sw.unregister.js";
import { appContext, ChangBits } from "./app.context.js";
import { AkariHideWall } from "./svg.img.js";

const { useCallback, useContext, useEffect, useMemo, useRef } = React;

const info: Record<"version" | "hash" | "updateTime", string> & {
    languages: { [name: string]: string };
} = JSON.parse(document.getElementById("app-info")!.textContent!);

interface INumberInput {
    min?: number;
    max?: number;
    defaultValue: number;
    callback: (value: number, ref: React.RefObject<HTMLInputElement>) => void;
}

const useNumberInput = ({ defaultValue, callback }: INumberInput, ref = useRef<HTMLInputElement>(null)) => {
    useEffect(() => {
        ref.current!.value = defaultValue.toString();
    }, [defaultValue]);

    const onChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            if (ev.target.validity.valid) {
                callback(Number.parseInt(ev.target.value, 10), ref);
            }
        },
        [callback],
    );

    const onBlur = useCallback(
        (ev: React.FocusEvent<HTMLInputElement>) => {
            if (!ev.target.validity.valid) {
                ref.current!.value = defaultValue.toString();
            }
        },
        [callback, defaultValue],
    );
    return { type: "number", step: 1, ref, onChange, onBlur };
};

export const Preferences: React.FC = () => {
    const { prefState, prefDispatch, lang } = useContext(appContext, ChangBits.lang || ChangBits.prefState);

    const onColorPick = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        prefDispatch({
            type: "themeColor",
            payload: ev.target.value,
        });
    }, []);

    const userColorInputText = useRef<HTMLInputElement>(null);

    const onUserInput = useCallback((input: EventTarget & HTMLInputElement) => {
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
            type: "themeColor",
            payload: "#" + value,
        });
    }, []);

    const onUserColorInputBlur = useCallback((ev: React.FocusEvent<HTMLInputElement>) => onUserInput(ev.target), []);

    const onColorSubmit = useCallback((ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();

        const form = ev.target as HTMLFormElement;

        const input = form.elements.namedItem("user-color-input-text")! as HTMLInputElement;

        return onUserInput(input);
    }, []);

    useEffect(() => {
        userColorInputText.current!.value = prefState.themeColor.slice(1);
    }, [prefState.themeColor]);

    const onSpaceChange = useCallback((value: number, ref: React.RefObject<HTMLInputElement>) => {
        prefDispatch({
            type: ref.current!.name as "spaceStart" & "spaceEnd",
            payload: value,
        });
    }, []);

    const onCacheClear = useCallback(() => {
        unregister();
    }, []);

    const updateTime = useMemo(() => {
        const date = new Date(info.updateTime);
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short",
            hour12: false,
        };
        return new Intl.DateTimeFormat(prefState.lang, options).format(date);
    }, [prefState.lang]);

    const onLangChanged = useCallback((ev: React.ChangeEvent<HTMLSelectElement>) => {
        prefDispatch({
            type: "lang",
            payload: ev.target.value,
        });
    }, []);

    const onBuiltInAudioToggle = useCallback(
        () =>
            prefDispatch({
                type: "builtInAudio",
                payload: !prefState.builtInAudio,
            }),
        [prefState.builtInAudio],
    );

    const onScreenButtonToggle = useCallback(
        () =>
            prefDispatch({
                type: "screenButton",
                payload: !prefState.screenButton,
            }),
        [prefState.screenButton],
    );

    const onFixedChanged = useCallback((ev: React.ChangeEvent<HTMLSelectElement>) => {
        prefDispatch({
            type: "fixed",
            payload: Number.parseInt(ev.target.value, 10) as Fixed,
        });
    }, []);

    const LangOptionList = useMemo(() => {
        return Object.entries(info.languages).map(([langCode, langName]) => {
            return (
                <option key={langCode} value={langCode}>
                    {langName}
                </option>
            );
        });
    }, []);

    const ColorPickerWall = useMemo(() => {
        return Object.values(themeColor).map((color) => {
            const checked = color === prefState.themeColor;
            const classNames = ["color-picker", "ripple"];
            if (checked) {
                classNames.push("checked");
            }
            return (
                <label className={classNames.join(Const.space)} key={color} style={{ backgroundColor: color }}>
                    <input
                        hidden={true}
                        type="radio"
                        name="theme-color"
                        value={color}
                        checked={checked}
                        onChange={onColorPick}
                    />
                </label>
            );
        });
    }, [prefState.themeColor]);

    const currentThemeColorStyle = useMemo(() => {
        return {
            backgroundColor: prefState.themeColor,
        };
    }, [prefState.themeColor]);

    const formatedText = useMemo(() => {
        return formatText("   hello   世界～   ", prefState.spaceStart, prefState.spaceEnd);
    }, [prefState.spaceStart, prefState.spaceEnd]);

    const userColorLabel = useRef<HTMLLabelElement>(null);
    const userColorInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userColorInput.current!.type === "color") {
            userColorLabel.current!.removeAttribute("for");
        }
    }, []);

    return (
        <div className="preferences">
            <ul>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.version}</span>
                        <span className="select-all">{info.version}</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.commitHash}</span>
                        <span className="select-all">{info.hash}</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.updateTime}</span>
                        <span>{updateTime}</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.repo}</span>
                        <a className="link" href={Repo.url} target="_blank" rel="noopener">
                            Github
                        </a>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.help}</span>
                        <a className="link" href={Repo.wiki} target="_blank" rel="noopener">
                            Github Wiki
                        </a>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.language}</span>
                        <div className="option-select">
                            <select value={prefState.lang} onChange={onLangChanged}>
                                {LangOptionList}
                            </select>
                        </div>
                    </section>
                </li>
                <li>
                    <label className="list-item">
                        <span>{lang.preferences.builtInAudio}</span>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={prefState.builtInAudio} onChange={onBuiltInAudioToggle} />
                            <span className="toggle-switch-label" />
                        </label>
                    </label>
                </li>
                <li>
                    <label className="list-item">
                        <span>{lang.preferences.spaceButton}</span>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={prefState.screenButton} onChange={onScreenButtonToggle} />
                            <span className="toggle-switch-label" />
                        </label>
                    </label>
                </li>

                <li>
                    <section className="list-item">
                        <span>{lang.preferences.themeColor}</span>
                        <details className="dropdown">
                            <summary>
                                <span className="color-picker ripple" style={currentThemeColorStyle}>
                                    {"#"}
                                </span>
                                <span className="current-theme-color">{prefState.themeColor.slice(1)}</span>
                            </summary>
                            <form className="dropdown-body color-wall" onSubmit={onColorSubmit}>
                                {ColorPickerWall}
                                <label
                                    className="color-picker ripple user-color-label"
                                    htmlFor="user-color-input-text"
                                    style={currentThemeColorStyle}
                                    ref={userColorLabel}
                                >
                                    {"#"}
                                    <input
                                        type="color"
                                        className="color-picker pseudo-hidden"
                                        value={prefState.themeColor}
                                        onChange={onColorPick}
                                        ref={userColorInput}
                                    />
                                </label>
                                <input
                                    ref={userColorInputText}
                                    id="user-color-input-text"
                                    name="user-color-input-text"
                                    className="user-color-input-text"
                                    type="text"
                                    pattern="[\da-f]{3,6}"
                                    required={true}
                                    autoCapitalize="none"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    defaultValue={prefState.themeColor.slice(1)}
                                    onBlur={onUserColorInputBlur}
                                />
                            </form>
                        </details>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.lrcFormat}</span>
                        <span>
                            <time className="format-example-time">{convertTimeToTag(83.456, prefState.fixed)}</time>
                            <span className="format-example-text">{formatedText}</span>
                        </span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.fixed}</span>
                        <div className="option-select">
                            <select name="fixed" value={prefState.fixed} onChange={onFixedChanged}>
                                <option value={0}>0</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                            </select>
                        </div>
                    </section>
                </li>
                <li>
                    <label className="list-item">
                        <label htmlFor="space-start">{lang.preferences.leftSpace}</label>
                        <input
                            name="spaceStart"
                            id="space-start"
                            required={true}
                            min={-1}
                            {...useNumberInput({
                                defaultValue: prefState.spaceStart,
                                callback: onSpaceChange,
                            })}
                        />
                    </label>
                </li>
                <li>
                    <label className="list-item">
                        <label htmlFor="space-end">{lang.preferences.rightSpace}</label>
                        <input
                            name="spaceEnd"
                            id="space-end"
                            required={true}
                            min={-1}
                            {...useNumberInput({
                                defaultValue: prefState.spaceEnd,
                                callback: onSpaceChange,
                            })}
                        />
                    </label>
                </li>
                <li className="ripple" onClick={onCacheClear}>
                    <section className="list-item">{lang.preferences.clearCache}</section>
                </li>
            </ul>
            <AkariHideWall />
        </div>
    );
};
