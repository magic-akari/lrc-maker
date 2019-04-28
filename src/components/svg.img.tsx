export const AkariHideWall: React.FC = () => {
    return (
        <img className="akari-hide-wall" alt="akari-hide-wall" src={Version.akariHideWall} crossOrigin="anonymous" />
    );
};

export const AkariNotFound: React.FC = () => {
    return <img className="akari-not-found" alt="not found" src={Version.akariNotFound} crossOrigin="anonymous" />;
};

export const AkariOangoLoading: React.FC = () => {
    return (
        <img
            className="akari-odango-loading start-loading"
            alt="loading"
            src={Version.akariOdangoLoading}
            crossOrigin="anonymous"
        />
    );
};
