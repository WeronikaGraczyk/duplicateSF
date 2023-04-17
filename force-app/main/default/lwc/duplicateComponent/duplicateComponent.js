import { LightningElement, wire, api, track } from 'lwc';
import findDuplicates from '@salesforce/apex/DuplicateController.findDuplicates';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DuplicateComponent extends LightningElement {
    @api recordId;
    duplicateObjectsList;
    error;


    objects;
    fields;

    @wire(findDuplicates, {idFromPage: '$recordId'})
    wiredDuplicates({ error, data }) {
        if (data) {
            console.log('sdsdd');
            this.duplicateObjectsList = data;
            this.objects = data;
            this.fields = Object.keys(data[0]);
            console.log(this.duplicateObjectsList);
            console.log(this.objects);
            console.log(this.fields);
        } else if (error) {
            console.error(error);
        }
    }

    // get columns() {
    //     if (this.duplicateObjectsList.data && this.duplicateObjectsList.data.length > 0) {
    //         // Use the first record in the list to get the field names
    //         return Object.keys(this.duplicateObjectsList.data[0]).map(field => {
    //             return {
    //                 label: field,
    //                 fieldName: field
    //             };
    //         });
    //     }
    //     return [];
    // }

    // get rows() {
    //     if (this.duplicateObjectsList.data) {
    //         return this.duplicateObjectsList.data;
    //     }
    //     return [];
    // }

    loadRecord() {
        const toast = new ShowToastEvent({
            title : 'sdsd',
            variant : 'assas'
        })
        this.dispatchEvent(toast);
        this.handleReset(); 
    } 

    get duplicatesToShow() {
        console.log(this.duplicateObjectsList !== undefined && this.duplicateObjectsList != null && this.duplicateObjectsList.data);
    return this.duplicateObjectsList !== undefined && this.duplicateObjectsList != null && this.duplicateObjectsList.data;
    }
}