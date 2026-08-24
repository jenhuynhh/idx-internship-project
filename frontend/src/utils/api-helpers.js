export function buildQueryString(params) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            cleanParams[key] = params[key];
        }
    });
    return new URLSearchParams(cleanParams).toString();
}