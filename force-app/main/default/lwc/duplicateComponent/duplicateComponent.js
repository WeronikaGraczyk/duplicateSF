import { LightningElement, api, track, wire } from 'lwc';
import getInitDuplicateRecordSetList from '@salesforce/apex/DuplicateController.getInitDuplicateRecordSetList';
import mergeObject from '@salesforce/apex/DuplicateController.mergeObject';

export default class DuplicateComponent extends LightningElement {
  @api 
  recordId;
  error;
  objects;
  objectsForModal=[];
  fields;
  myArray = ['IsDeleted','CreatedDate', 'CreatedById', 'LastModifiedDate', 'LastModifiedById', 'SystemModstamp', 'LastViewedDate', 'LastReferencedDate', 'CleanStatus', 'PhotoUrl', 'OwnerId'];

  @track showModal = false;
  @track selectedObject = null;
  @track selectedFields = null;
  @track idsList = [];

  @wire(getInitDuplicateRecordSetList, { idFromPage: '$recordId' })
  wiredDuplicates({ error, data }) {
  if (data && data.length > 0) {
    this.objects = data.map(obj => ({ ...obj}));
    this.objects = this.objects.map(field => {
      return Object.keys(field)
            .filter(key => !this.myArray.includes(key))
            .reduce((obj, key) => {
              obj[key] = field[key];
              return obj;
      }, {});
    });

    this.fields = Object.keys(data[0]);
    this.fields = this.fields.filter(field => !this.myArray.includes(field));

    this.selectedFields = this.fields.map(field => ({ fieldName: field, isSelected: false, value: "" })); 
        
    this.fields = this.fields.filter(field => field != 'Id');
      
    } else if (error) {
      console.error(error);
    }
  }

  get duplicatesToShow() {
    return this.objects !== undefined && this.objects != null;
  }

  openModal() {
    this.selectedObject = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  handleCheckboxChange(event) {
      
    const fieldFromPage = event.target.dataset.field;
    const objectId = event.target.dataset.objectId;
    const foundObjectValue = this.objectsForModal.find(object => object.Id == objectId);
    const indexToUpdate = this.selectedFields.findIndex(item => item.fieldName == fieldFromPage);

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
    
  handleChooseObjectChange(event){
    const isChecked = event.target.checked;
    const objectId = event.target.dataset.objectId;
    
    if (isChecked) {
    this.idsList.push(objectId);

    } else {
      const index = this.idsList.indexOf(objectId);
      if (index > -1) {
        this.idsList.splice(index, 1);
      }
    }
    this.objectsForModal=[];
    this.objects.forEach((obj) => {
      if (this.idsList.includes(obj.Id)) {
      const copy = Object.assign({}, obj);
      this.objectsForModal.push(copy);
      }
    });
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
