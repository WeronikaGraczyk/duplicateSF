public with sharing class DuplicateController {
    @AuraEnabled(Cacheable = true)
    public static List<SObject> findDuplicates(String idFromPage) {
        Id recordId = Id.valueOf(idFromPage);
        String objName = recordId.getSObjectType().getDescribe().getName();
        List<DuplicateRecordSet> duplicateRecordSet = getRecordSetList(recordId);

        List<DuplicateRecordItem> itemsList = [SELECT recordId FROM DuplicateRecordItem WHERE DuplicateRecordSetId =: duplicateRecordSet];

        List<String> recordIds = new List<String>();
        for(DuplicateRecordItem item : itemsList){
            recordIds.add(item.recordId);
        }
        String query = ObjectFieldsListQuery(objName);
        // String g=query.substring(500);
        // System.debug(g);
        List<SObject> records = Database.query(query);
        return records;
    }

    private static String ObjectFieldsListQuery(String objName){
        Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objName);
        Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
    
        List<String> fieldNames = new List<String>();
        for (Schema.SObjectField field : objectDescribe.fields.getMap().values()) {
            fieldNames.add(field.getDescribe().getName());
        }
        
        return 'SELECT ' + String.join(fieldNames, ',')+' FROM ' + objName + ' WHERE Id = :recordIds';
    }
    
    private static List<DuplicateRecordSet> getRecordSetList(String recordId){
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
        List<ObjectField> objectFields = (List<ObjectField>) JSON.deserialize(selectedFieldsJSON, List<ObjectField>.class);
        System.debug(objectFields);
        insertObject(objectFields, objName);
        deleteObjects(idsList, objName);
    }

    public static void insertObject(List<ObjectField> objectFields, String objName) {
        SObject newObject = (SObject) Type.forName('Schema.' + objName).newInstance();
        for (ObjectField objecty : objectFields) {
            newObject.put(String.valueOf(objecty.fieldName),  String.valueOf(objecty.value));
            System.debug(newObject);
        }
        Database.insert(newObject, true);
    }
    
    public static void deleteObjects(List<Id> idsList, String objectName) {
        String query = 'SELECT Id FROM ' + objectName + ' WHERE Id IN :idsList';
        List<SObject> recordsToDelete = Database.query(query);
        Database.delete(recordsToDelete);
    }
    
    public class ObjectField {
        @AuraEnabled public String fieldName { get; set; }
        @AuraEnabled public Boolean isSelected { get; set; }
        @AuraEnabled public String value { get; set; }
    }
}