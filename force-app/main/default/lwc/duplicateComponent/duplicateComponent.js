import { LightningElement, wire, api, track } from 'lwc';
import findDuplicates from '@salesforce/apex/DuplicateController.findDuplicates';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DuplicateComponent extends LightningElement {
    @api recordId;
    duplicateObjectsList;
    
    @wire(findDuplicates, {idFromPage: '$recordId'})
    duplicateObjects(results){
        this.duplicateObjectsList = results;
        console.log('asdada'+this.duplicateObjectsList);
    }

    @wire(findDuplicates, { objectName: '$objectName' })
    duplicates;

    get columns() {
        if (this.duplicateObjectsList.data && this.duplicateObjectsList.data.length > 0) {
            // Use the first record in the list to get the field names
            return Object.keys(this.duplicateObjectsList.data[0]).map(field => {
                return {
                    label: field,
                    fieldName: field
                };
            });
        }
        return [];
    }

    get rows() {
        if (this.duplicateObjectsList.data) {
            return this.duplicateObjectsList.data;
        }
        return [];
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
        console.log('aaaaa'+this.duplicateObjectsList.data);
        return this.duplicateObjectsList !== undefined && this.duplicateObjectsList != null;
    }//&& this.duplicateObjectsList.length > 0
}