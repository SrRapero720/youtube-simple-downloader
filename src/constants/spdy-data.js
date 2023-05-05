export default class SpdyData {
    spdy;
    sessionTimeout;
    constructor() {
        this.sessionTimeout = 500;
        this.spdy = {
            protocols: ["h2", "spdy/3.1"],
            plain: true,
            "x-forwarded-for": true,
            connection: {
                autoSpdy31: true,
                windowSize: 1920*1080,
            }
        }
    }
}