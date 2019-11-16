export const AkariHideWall: React.FC = () => {
    return (
        <img className="akari-hide-wall" alt="akari-hide-wall" src={MetaData.akariHideWall} crossOrigin="anonymous" />
    );
};

export const AkariNotFound: React.FC = () => {
    return <img className="akari-not-found" alt="not found" src={MetaData.akariNotFound} crossOrigin="anonymous" />;
};

export const AkariOangoLoading: React.FC = () => {
    return (
        <img
            className="akari-odango-loading start-loading"
            alt="loading"
            src={MetaData.akariOdangoLoading}
            crossOrigin="anonymous"
        />
    );
};
