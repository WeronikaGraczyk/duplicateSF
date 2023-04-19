import { api, LightningElement } from 'lwc';

export default class ObjectTd extends LightningElement {
    @api
    object;
    @api
    field;
    value;
    connectedCallback() {
        this.value = `<td>${this.object[this.field]}</td>`;
    }
}