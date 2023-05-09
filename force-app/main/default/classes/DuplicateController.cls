public with sharing class DuplicateController {
    @AuraEnabled(Cacheable = true)
    public static List<SObject> getInitDuplicateRecordSetList(Id idFromPage) {
        String objName = idFromPage.getSObjectType().getDescribe().getName();
        List<DuplicateRecordSet> duplicateRecordSet = getRecordSetList(idFromPage);

        List<String> recordIds = getIdsDuplicaterecordItemToString(duplicateRecordSet);

        String query = generateQueryForSObject(objName, recordIds);
        List<SObject> records = Database.query(query);
        return records;
    }

    public static List<String> getIdsDuplicaterecordItemToString(List<DuplicateRecordSet> duplicateRecordSet){
        List<DuplicateRecordItem> itemsList = [SELECT recordId FROM DuplicateRecordItem WHERE DuplicateRecordSetId =: duplicateRecordSet];

        List<String> recordIds = new List<String>();
        for(DuplicateRecordItem item : itemsList){
            recordIds.add(item.recordId);
        }
        return recordIds;
    }

    private static String generateQueryForSObject(String objName, List<String> recordIds){
        Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objName);
        Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
    
        List<String> fieldNames = new List<String>();
        for (Schema.SObjectField field : objectDescribe.fields.getMap().values()) {
            fieldNames.add(field.getDescribe().getName());
        }
        return 'SELECT ' + String.join(fieldNames, ',')+' FROM ' + objName + ' WHERE Id = :recordIds';
    }
    
    private static List<DuplicateRecordSet> getRecordSetList(Id recordId){
        List<DuplicateRecordItem> itemsList = [SELECT duplicateRecordSetId FROM DuplicateRecordItem WHERE recordId = :recordId];

        List<Id> duplicateRecordSetIds = new List<Id>();
        for (DuplicateRecordItem item : itemsList) {
            duplicateRecordSetIds.add(item.DuplicateRecordSetId);
        }
        return [SELECT id, name FROM DuplicateRecordSet WHERE id IN :duplicateRecordSetIds];
    }
    
    @AuraEnabled
    public static void mergeObject(String selectedFieldsJSON,List<Id> idsList) {
        String objName = idsList[0].getSObjectType().getDescribe().getName();
        List<ObjectFieldWrapper> objectFields = (List<ObjectFieldWrapper>) JSON.deserialize(selectedFieldsJSON, List<ObjectFieldWrapper>.class);
        insertObject(objectFields, objName);
        deleteObjects(idsList, objName);
    }

    public static void insertObject(List<ObjectFieldWrapper> objectFields, String objName) {
        SObject newObject = (SObject) Type.forName('Schema.' + objName).newInstance();
        for (ObjectFieldWrapper objecty : objectFields) {
            if(String.valueOf(objecty.value) != '' && String.valueOf(objecty.value) != null){
               newObject.put(String.valueOf(objecty.fieldName),  String.valueOf(objecty.value)); 
            }
        }
        Database.insert(newObject, true);
    }
    
    public static void deleteObjects(List<Id> idsList, String objectName) {
        String query = 'SELECT Id FROM ' + objectName + ' WHERE Id IN :idsList';
        List<SObject> recordsToDelete = Database.query(query);
        Database.delete(recordsToDelete);
    }
    
    public class ObjectFieldWrapper {
        @AuraEnabled public String fieldName { get; set; }
        @AuraEnabled public Boolean isSelected { get; set; }
        @AuraEnabled public String value { get; set; }
    }
}