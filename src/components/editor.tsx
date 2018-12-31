import {
    Action as LrcAction,
    ActionType as LrcActionType,
    State as LrcState,
    stringify,
} from "../hooks/useLrc.js";
import { State as PrefState } from "../hooks/usePref.js";

const { useRef, useEffect, useCallback } = React;

const disableCheck = {
    autoCapitalize: "off",
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
};

const useDefaultValue = (defaultValue: string) => {
    const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

    const currentValue = ref.current ? ref.current.value : defaultValue;

    useEffect(
        () => {
            ref.current!.value = defaultValue;
        },
        [defaultValue, currentValue],
    );
    return { ref, defaultValue };
};

export const Eidtor: React.SFC<{
    lrcState: LrcState;
    lrcDispatch: React.Dispatch<LrcAction>;
    prefState: PrefState;
}> = ({ lrcState, lrcDispatch, prefState }) => {
    console.info("Eidtor.render");

    const parse = useCallback((ev: React.FocusEvent<HTMLTextAreaElement>) => {
        lrcDispatch({
            type: LrcActionType.parse,
            payload: ev.target!.value,
        });
    }, []);

    const setInfo = useCallback((ev: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = ev.target!;
        lrcDispatch({
            type: LrcActionType.set_info,
            payload: { name, value },
        });
    }, []);

    const text = stringify(lrcState, prefState);

    const details = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const dc = details.current!;
        const toggle = () => () => {
            sessionStorage.setItem(
                "app-editor-details-open",
                dc.open.toString(),
            );
        };
        dc.addEventListener("toggle", toggle);

        return () => {
            dc.removeEventListener("toggle", toggle);
        };
    }, []);

    const detailsOpened =
        sessionStorage.getItem("app-editor-details-open") !== "false";

    return (
        <div className="app-editor">
            <details ref={details} open={detailsOpened}>
                <summary>info</summary>
                <section className="app-editor-infobox">
                    <label htmlFor="info-ti">[ti:</label>
                    <input
                        id="info-ti"
                        name="ti"
                        placeholder="title"
                        onBlur={setInfo}
                        {...disableCheck}
                        {...useDefaultValue(lrcState.info.get("ti") || "")}
                    />
                    <label htmlFor="info-ti">]</label>
                    <label htmlFor="info-ar">[ar:</label>
                    <input
                        id="info-ar"
                        name="ar"
                        placeholder="artist"
                        onBlur={setInfo}
                        {...disableCheck}
                        {...useDefaultValue(lrcState.info.get("ar") || "")}
                    />
                    <label htmlFor="info-ar">]</label>
                    <label htmlFor="info-al">[al:</label>
                    <input
                        id="info-al"
                        name="al"
                        placeholder="album"
                        onBlur={setInfo}
                        {...disableCheck}
                        {...useDefaultValue(lrcState.info.get("al") || "")}
                    />
                    <label htmlFor="info-al">]</label>
                </section>
            </details>

            <textarea
                className="app-textarea"
                onBlur={parse}
                {...disableCheck}
                {...useDefaultValue(text)}
            />
        </div>
    );
};
