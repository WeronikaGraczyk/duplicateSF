import { LightningElement, api, track, wire } from 'lwc';
import findDuplicates from '@salesforce/apex/DuplicateController.findDuplicates';

export default class DuplicateComponent extends LightningElement {
    @api 
    recordId;
    error;
    objects;
    fields;

    @track showModal = false;
    @track selectedObject = null;
    @track selectedFields = [];
    @track selectedObjects = [];

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

    
    handleCheckboxChange(event) {
      console.log('asdasd');
      const field = event.target.dataset.field;
      const objectId = event.target.dataset.objectId;
      console.log(field);
      console.log(objectId);
      const foundObject = this.objects.find(object => object.Id == objectId);
      console.log(foundObject);
      console.log(foundObject[field]);
//const foundObject = this.objects.find(object => object.name === name && object.id === objectId);
      if (event.target.checked) {
        this.selectedObjects.push(this.objects.find(obj => obj.Id === objectId));
        console.log(this.selectedObjects);
      } else {
        this.selectedObjects = this.selectedObjects.filter(obj => obj.Id !== objectId);
        console.log(this.selectedObjects);
      }
    }
    
    handleMergeClick() {
      if (this.selectedObjects.length > 0) {
        const mergedObject = this.selectedObjects.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        // Do something with mergedObject
      }
      this.showModal = false;
      this.selectedObjects = [];
    }
}
