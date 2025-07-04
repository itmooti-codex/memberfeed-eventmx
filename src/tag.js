let GLOBAL_PAGE_TAG = classTag;

if (typeof window !== "undefined") {
  Object.defineProperty(window, "GLOBAL_PAGE_TAG", {
    get() {
      return GLOBAL_PAGE_TAG;
    },
    set(value) {
      GLOBAL_PAGE_TAG = value;
    },
  });
}

export { GLOBAL_PAGE_TAG };
