export class HttpRequest {
    // api数据上传地址
    public endpoint: string = window.location.origin;
    // 项目Key
    public apiKey: string = 'stbui';
    // 指定数据版本
    public payloadVersion: string = '1.0.0';

    constructor(endpoint: string, apiKey: string, payloadVersion: string) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.payloadVersion = payloadVersion;
    }

    send(data: object, callback) {
        try {
            const req = new XMLHttpRequest();

            req.open('POST', this.endpoint);
            req.setRequestHeader('Content-Type', 'application/json');
            req.setRequestHeader('Apm-Api-Key', this.apiKey);
            req.setRequestHeader('Apm-Payload-Version', this.payloadVersion);
            req.setRequestHeader('Apm-Sent-At', new Date().toISOString());
            req.send(JSON.stringify(data));
        } catch (error) {
            console.warn('该浏览器不支持 XMLHttpRequest');
        }
    }
}
