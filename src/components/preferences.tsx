import {
    Action as PrefAction,
    ActionType as PrefActionType,
    State as PrefState,
} from "../hooks/usePref.js";

interface IPreferencesProps {
    prefState: PrefState;
    prefDispatch: React.Dispatch<PrefAction>;
}

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
                        <span className="select-all">5.0.0-beta</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>Commit hash</span>
                        <span className="select-all">1a2b3c4</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>最近更新</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>项目地址</span>
                        <a href="">Github</a>
                    </section>
                </li>
                <li>
                    <section className="list-item">
                        <span>关于 &amp; 帮助</span>
                        <a href="">Github Wiki</a>
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
                                        payload: !prefState[
                                            PrefActionType.builtInAudio
                                        ],
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
                                        payload: !prefState[
                                            PrefActionType.screenButton
                                        ],
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
