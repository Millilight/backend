export function getParameterFromUrl(parameter: string, url: string): string {
    var reg = new RegExp( '[?&]' + parameter + '=([^&#]*)', 'i' );
    var string = reg.exec(url);
    return string ? string[1] : undefined;
};