import { LightningElement, wire, api, track } from 'lwc';
import findDuplicates from '@salesforce/apex/DuplicateController.findDuplicates';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DuplicateComponent extends LightningElement {
    @api 
    recordId;
    error;

    objects;
    fields;

    @track showModal = false;

    @wire(findDuplicates, {idFromPage: '$recordId'})
    wiredDuplicates({ error, data }) {
        if (data) {
            this.objects = data;
            this.fields = Object.keys(data[0]);
        } else if (error) {
            console.error(error);
        }
    }

    loadRecord() {
        const toast = new ShowToastEvent({
            title : 'sdsd',
            variant : 'assas'
        })
        this.dispatchEvent(toast);
        this.handleReset(); 
    } 

    get duplicatesToShow() {
        return this.objects !== undefined && this.objects != null;
    }
    openModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }
}