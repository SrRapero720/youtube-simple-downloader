export default class ResponseModel {
    status;
    message;
    content;
    constructor(s, m, c) {
        this.status = s;
        this.message = m;
        this.content = c;
    }
}