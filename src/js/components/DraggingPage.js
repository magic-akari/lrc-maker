/**
 * Created by akari on 20/02/2017.
 */
import React from "react";

const DraggingPage = () => <div className="app-drag-and-drop">
    <div className="app-drag-and-drop-tip">释放鼠标，文件将会投喂给滚动姬</div>
    <div className="app-drag-and-drop-icon">
        <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
    </div>
</div>;

export default DraggingPage;