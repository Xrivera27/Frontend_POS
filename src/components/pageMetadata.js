const FAVICON_PATH = "/img/perdomo_asociados.ico";

export const setPageTitle = (title) => {
  document.title = title;

  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "icon";
  link.href = FAVICON_PATH;
  document.getElementsByTagName("head")[0].appendChild(link);
};
