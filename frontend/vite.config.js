/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    {
      name: "injectConfig",
      transformIndexHtml() {
        return [
          {
            tag: "script",
            attrs: {
              src: "/env.js",
            },
            injectTo: "head-prepend",
          },
        ];
      },
    },
  ],
};
