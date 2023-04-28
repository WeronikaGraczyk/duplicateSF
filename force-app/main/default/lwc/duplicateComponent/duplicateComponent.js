import { LightningElement, api, track, wire } from 'lwc';
import findDuplicates from '@salesforce/apex/DuplicateController.findDuplicates';
import mergeObject from '@salesforce/apex/DuplicateController.mergeObject';

export default class DuplicateComponent extends LightningElement {
    @api 
    recordId;
    error;
    objects;
    fields;
    

    @track showModal = true;
    @track selectedObject = null;
    @track selectedFields = null;
    @track idsList;

    @wire(findDuplicates, { idFromPage: '$recordId' })
    wiredDuplicates({ error, data }) {
      if (data && data.length > 0) {
        const myArray = ['IsDeleted','CreatedDate', 'CreatedById', 'LastModifiedDate', 'LastModifiedById', 'SystemModstamp', 'LastViewedDate', 'LastReferencedDate', 'CleanStatus', 'PhotoUrl', 'OwnerId'];
        this.objects = data.map(obj => ({ ...obj}));
        this.idsList = this.objects.map(obj => obj.Id);

        this.objects = this.objects.map(field => {
          return Object.keys(field)
             .filter(key => !myArray.includes(key))
             .reduce((obj, key) => {
              obj[key] = field[key];
              return obj;
            }, {});
        });
        this.fields = Object.keys(data[0]);
        this.fields = this.fields.filter(field => !myArray.includes(field));
        this.fields = this.fields.filter(field => field != 'Id');

        this.selectedFields = this.fields.map(field => ({ fieldName: field, isSelected: false, value: "" })); 
      } else if (error) {
        console.error('dfsdfds',error);
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
      
      const fieldFromPage = event.target.dataset.field;
      const objectId = event.target.dataset.objectId;
      const foundObjectValue = this.objects.find(object => object.Id === objectId);
      const indexToUpdate = this.selectedFields.findIndex(item => item.fieldName === fieldFromPage);

      if (event.target.checked) {
        if (indexToUpdate !== -1) {
          if(!this.selectedFields[indexToUpdate].isSelected){
            this.selectedFields[indexToUpdate].isSelected = true;
            this.selectedFields[indexToUpdate].value = foundObjectValue[fieldFromPage];
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
    }
    
  handleMergeClick() {
  this.selectedFields = this.selectedFields.filter(field => field.fieldName !== 'Id');

  const selectedFieldsJSON = JSON.stringify(this.selectedFields);
  mergeObject({selectedFieldsJSON: selectedFieldsJSON, idsList: this.idsList})
    .then(result => {
      console.log(result);
    })
    .catch(error => {
      console.error(error);
    });
    this.showModal = false;
  }
}
