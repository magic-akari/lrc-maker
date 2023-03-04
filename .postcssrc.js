export default (ctx) => {
    return {
        map: ctx.options?.map,
        plugins: {
            "postcss-import": {},
            "postcss-color-function": {},
            "postcss-custom-properties": {},
            "autoprefixer": {},
            "cssnano": ctx.options?.map ? {} : false,
        },
    };
};
