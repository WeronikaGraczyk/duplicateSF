public with sharing class DuplicateController {
    @AuraEnabled(Cacheable = true)
    public static List<SObject> duplicateObject(SObject someObject){
        List<SObject> results = new List<SObject>(someObject);

        for(Datacloud.FindDuplicatesResult duplicateResults: Datacloud.FindDuplicates.findDuplicates(results)){
            for(Datacloud.DuplicateResult dr: duplicateResults.duplicateresults){
                for(Datacloud.MatchRecord matchRecord: dr.matchResults[0].getMatchRecords()){
                    results.add(matchRecord.getRecord());
                }
            }
        }
        return results;
    }
}