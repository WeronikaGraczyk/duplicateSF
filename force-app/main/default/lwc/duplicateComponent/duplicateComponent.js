import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import findDuplicates from '@salesforce/apex/DuplicateController.findDuplicates';

export default class DuplicateComponent extends LightningElement {
    @api 
    recordId;
    error;
    objects;
    fields;

    @track showModal = true;
    @track selectedObject = null;
    @track selectedFields = null;

    @wire(findDuplicates, { idFromPage: '$recordId' })
    wiredDuplicates({ error, data }) {
        if (data) {
            this.objects = data.map(obj => ({ ...obj}));
            this.fields = Object.keys(data[0]);
             
        } else if (error) {
            console.error(error);
        }
    }

    get duplicatesToShow() {
        return this.objects !== undefined && this.objects != null;
    }

    openModal() {
        this.selectedObject = null;
        this.selectedFields = [];
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    initializeSelectedFieldsList(){
      if(this.selectedFields == null){
        this.selectedFields = this.fields.map(field => ({ fieldName: field, isSelected: false, value: "" }));
      }
    }

    
    handleCheckboxChange(event) {
      this.initializeSelectedFieldsList();
      
      const field = event.target.dataset.field;
      const objectId = event.target.dataset.objectId;
      const foundObjectValue = this.objects.find(object => object.Id == objectId);
      const indexToUpdate = this.selectedFields.findIndex(item => item.fieldName === field);

      if (event.target.checked) {
        if (indexToUpdate !== -1) {
          if(!this.selectedFields[indexToUpdate].isSelected){
            this.selectedFields[indexToUpdate].isSelected = true;
            this.selectedFields[indexToUpdate].value = foundObjectValue;
          }
          else{
            event.target.checked = false;
          }
        }
      } else {
        if (indexToUpdate !== -1) {
          this.selectedFields[indexToUpdate].isSelected = false;
          this.selectedFields[indexToUpdate].value = "";
        }
      }
      console.log(JSON.stringify(this.selectedFields, (key, value) => {
        if (Array.isArray(value)) {
          return [...value];
        } else {
          return value;
        }
      }));
    }
    
    handleMergeClick() {
      //merge to controller
      this.showModal = false;
      this.initializeSelectedFieldsList();
    }
}
