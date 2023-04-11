public with sharing class DuplicateController {
    @AuraEnabled(Cacheable = true)
    public static List<SObject> findDuplicates(String idFromPage) {
        Id recordId = Id.valueOf(idFromPage);
        String objName = recordId.getSObjectType().getDescribe().getName();
        List<DuplicateRecordSet> duplicateRecordSet = getRecordSetList(recordId);

        List<DuplicateRecordItem> itemsList = [SELECT recordId FROM DuplicateRecordItem WHERE DuplicateRecordSetId =: duplicateRecordSet];

        List<SObject> records = Database.query(ObjectFieldsListQuery(objName, recordId));

        return records;
    }

    private static String ObjectFieldsListQuery(String objName, Id recordId){
        String query = 'SELECT ';
        Map<String, Schema.SObjectField> fields = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap();
        for(String field : fields.keySet()){
            query += field + ', ';
        }
        query = query.substring(0, query.length() - 2);
        query += ' FROM ' + objName + ' WHERE Id = \'' + recordId + '\'';
        return query;
    }
    
    private static List<DuplicateRecordSet> getRecordSetList(String recordId){
        List<DuplicateRecordItem> itemsList = [SELECT duplicateRecordSetId FROM DuplicateRecordItem WHERE recordId = :recordId];

        List<Id> duplicateRecordSetIds = new List<Id>();
        for (DuplicateRecordItem item : itemsList) {
            duplicateRecordSetIds.add(item.DuplicateRecordSetId);
        }
        return [SELECT id, name FROM DuplicateRecordSet WHERE id IN :duplicateRecordSetIds];
    }
}