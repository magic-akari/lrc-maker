type CrossOrigin = "anonymous" | undefined;

export const AkariHideWall = React.memo(() => {
    const { href, crossOrigin } = document.querySelector(".prefetch-akari-hide-wall") as HTMLLinkElement;

    return (
        <img className="akari-hide-wall" alt="akari-hide-wall" src={href} crossOrigin={crossOrigin as CrossOrigin} />
    );
});

export const AkariNotFound = React.memo(() => {
    const { href, crossOrigin } = document.querySelector(".prefetch-akari-not-found") as HTMLLinkElement;

    return <img className="akari-not-found" alt="not found" src={href} crossOrigin={crossOrigin as CrossOrigin} />;
});

export const AkariOangoLoading = React.memo(() => {
    const { href, crossOrigin } = document.querySelector(".preload-akari-odango-loading") as HTMLLinkElement;

    return (
        <img
            className="akari-odango-loading start-loading"
            alt="loading"
            src={href}
            crossOrigin={crossOrigin as CrossOrigin}
        />
    );
});
