export const isTouchDevice = (() => {
    const prefixes = ' -webkit- -moz- -o- -ms-'.split(' ');
    const DocTouch = (window as any).DocumentTouch;
    if ('ontouchstart' in window || navigator.maxTouchPoints || (DocTouch && document instanceof DocTouch)) {
        return true;
    }
    const queryStr = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return matchMediaQuery(queryStr);
    function matchMediaQuery(query: string): boolean {
        return !!window.matchMedia && window.matchMedia(query).matches;
    }
})();
