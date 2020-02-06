let seq = Date.now();
export function uniqId(prefix = '') {
    if (prefix.length > 0) {
        return `${prefix}-${(seq++).toString(36)}`;
    } else {
        return '' + seq++;
    }
}
