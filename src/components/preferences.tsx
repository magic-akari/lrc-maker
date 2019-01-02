import {
    Action as PrefAction,
    ActionType as PrefActionType,
    State as PrefState,
} from "../hooks/usePref.js";

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
                        <a href={Repo.url}>Github</a>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>关于 &amp; 帮助</span>
                        <a href={Repo.wiki}>Github Wiki</a>
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
            </ul>
        </div>
    );
};
