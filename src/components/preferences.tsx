import LINK from "#const/link.json" assert { type: "json" };
import STRINGS from "#const/strings.json" assert { type: "json" };
import { convertTimeToTag, formatText } from "@lrc-maker/lrc-parser";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { themeColor, ThemeMode } from "../hooks/usePref.js";
import { unregister } from "../utils/sw.unregister.js";
import { appContext, ChangBits } from "./app.context.js";
import { AkariHideWall } from "./svg.img.js";

const numberInputProps = { type: "number", step: 1 } as const;

type OnChange<T> = (event: React.ChangeEvent<T>) => void;

type IUseNumberInput<T = HTMLInputElement> = (
    defaultValue: number,
    onChange: OnChange<T>,
) => typeof numberInputProps & {
    ref: React.RefObject<T>;
    onChange: OnChange<T>;
    defaultValue: number;
};

const useNumberInput: IUseNumberInput = (defaultValue: number, onChange) => {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const target = ref.current;
        if (target) {
            const onChange = (): void => {
                target.value = defaultValue.toString();
            };

            target.addEventListener("change", onChange);
            return (): void => target.removeEventListener("change", onChange);
        }
    }, [defaultValue]);

    const $onChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            if (ev.target.validity.valid) {
                onChange(ev);
            }
        },
        [onChange],
    );

    return { ...numberInputProps, ref, onChange: $onChange, defaultValue };
};

const langMap = i18n.langMap;

export const Preferences: React.FC = () => {
    const { prefState, prefDispatch, lang } = useContext(appContext, ChangBits.lang || ChangBits.prefState);

    const onColorPick = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            prefDispatch({
                type: "themeColor",
                payload: ev.target.value,
            });
        },
        [prefDispatch],
    );

    const userColorInputText = useRef<HTMLInputElement>(null);

    const onUserInput = useCallback(
        (input: EventTarget & HTMLInputElement) => {
            let value = input.value;

            if (!input.validity.valid) {
                input.value = input.defaultValue;
                return;
            }

            if (value.length === 3) {
                const [r, g, b] = value;
                value = r + r + g + g + b + b;
            }
            if (value.length < 6) {
                value = value.padEnd(6, "0");
            }

            prefDispatch({
                type: "themeColor",
                payload: "#" + value,
            });
        },
        [prefDispatch],
    );

    const onUserColorInputBlur = useCallback(
        (ev: React.FocusEvent<HTMLInputElement>) => onUserInput(ev.target),
        [onUserInput],
    );

    const onColorSubmit = useCallback(
        (ev: React.FormEvent<HTMLFormElement>) => {
            ev.preventDefault();

            const form = ev.target as HTMLFormElement;

            const input = form.elements.namedItem("user-color-input-text") as HTMLInputElement;

            return onUserInput(input);
        },
        [onUserInput],
    );

    useEffect(() => {
        userColorInputText.current!.value = prefState.themeColor.slice(1);
    }, [prefState.themeColor]);

    const onSpaceChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            prefDispatch({
                type: ev.target.name as "spaceStart" & "spaceEnd",
                payload: ev.target.value,
            });
        },
        [prefDispatch],
    );

    const onCacheClear = useCallback(() => {
        void unregister();
    }, []);

    const updateTime = useMemo(() => {
        const date = new Date(import.meta.env.app.updateTime);
        const options: Intl.DateTimeFormatOptions = {
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

    const onLangChanged = useCallback(
        (ev: React.ChangeEvent<HTMLSelectElement>) => {
            prefDispatch({
                type: "lang",
                payload: ev.target.value,
            });
        },
        [prefDispatch],
    );

    const onBuiltInAudioToggle = useCallback(
        () =>
            prefDispatch({
                type: "builtInAudio",
                payload: (prefState) => !prefState.builtInAudio,
            }),
        [prefDispatch],
    );

    const onScreenButtonToggle = useCallback(
        () =>
            prefDispatch({
                type: "screenButton",
                payload: (prefState) => !prefState.screenButton,
            }),
        [prefDispatch],
    );

    const onThemeModeChange = useCallback(
        (ev: React.ChangeEvent<HTMLSelectElement>) => {
            prefDispatch({
                type: "themeMode",
                payload: Number.parseInt(ev.target.value, 10) as ThemeMode,
            });
        },
        [prefDispatch],
    );

    const onFixedChanged = useCallback(
        (ev: React.ChangeEvent<HTMLSelectElement>) => {
            prefDispatch({
                type: "fixed",
                payload: Number.parseInt(ev.target.value, 10) as Fixed,
            });
        },
        [prefDispatch],
    );

    const LangOptionList = useMemo(() => {
        return langMap.map(([code, display]) => {
            return (
                <option key={code} value={code}>
                    {display}
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
                <label className={classNames.join(STRINGS.space)} key={color} style={{ backgroundColor: color }}>
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
    }, [onColorPick, prefState.themeColor]);

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
                        <span className="select-all">{import.meta.env.app.version}</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.commitHash}</span>
                        <span className="select-all">{import.meta.env.app.hash}</span>
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
                        <a className="link" href={LINK.url} target="_blank" rel="noopener noreferrer">
                            Github
                        </a>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.help}</span>
                        <a className="link" href={LINK.wiki} target="_blank" rel="noopener noreferrer">
                            Github Wiki
                        </a>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>{lang.preferences.language}</span>
                        <div className="option-select">
                            <select
                                value={prefState.lang}
                                onChange={onLangChanged}
                                aria-label={lang.preferences.language}
                            >
                                {LangOptionList}
                            </select>
                        </div>
                    </section>
                </li>
                <li>
                    <label className="list-item">
                        <span>{lang.preferences.builtInAudio}</span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={prefState.builtInAudio}
                                onChange={onBuiltInAudioToggle}
                                aria-label={lang.preferences.builtInAudio}
                            />
                            <span className="toggle-switch-label" />
                        </label>
                    </label>
                </li>
                <li>
                    <label className="list-item">
                        <span>{lang.preferences.spaceButton}</span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={prefState.screenButton}
                                onChange={onScreenButtonToggle}
                                aria-label={lang.preferences.spaceButton}
                            />
                            <span className="toggle-switch-label" />
                        </label>
                    </label>
                </li>

                <li>
                    <section className="list-item">
                        <span>{lang.preferences.themeMode.label}</span>
                        <div className="option-select">
                            <select
                                name="theme-mode"
                                value={prefState.themeMode}
                                onChange={onThemeModeChange}
                                aria-label={lang.preferences.themeMode.label}
                            >
                                <option value={ThemeMode.auto}>{lang.preferences.themeMode.auto}</option>
                                <option value={ThemeMode.light}>{lang.preferences.themeMode.light}</option>
                                <option value={ThemeMode.dark}>{lang.preferences.themeMode.dark}</option>
                            </select>
                        </div>
                    </section>
                </li>

                <li>
                    <section className="list-item">
                        <span>{lang.preferences.themeColor}</span>
                        <details className="dropdown">
                            <summary>
                                <span className="color-picker ripple hash" style={currentThemeColorStyle}>
                                    {"#"}
                                </span>
                                <span className="current-theme-color">{prefState.themeColor.slice(1)}</span>
                            </summary>
                            <form className="dropdown-body color-wall" onSubmit={onColorSubmit}>
                                {ColorPickerWall}
                                <label
                                    className="color-picker ripple user-color-label hash"
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
                            <select
                                name="fixed"
                                value={prefState.fixed}
                                onChange={onFixedChanged}
                                aria-label={lang.preferences.lrcFormat}
                            >
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
                            {...useNumberInput(prefState.spaceStart, onSpaceChange)}
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
                            {...useNumberInput(prefState.spaceEnd, onSpaceChange)}
                        />
                    </label>
                </li>
                <li className="ripple" onTransitionEnd={onCacheClear}>
                    <section className="list-item">{lang.preferences.clearCache}</section>
                </li>
            </ul>
            <AkariHideWall />
        </div>
    );
};
