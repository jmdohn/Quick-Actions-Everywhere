/* @author Jeremiah Dohn
 * @description Used for quick actions everywhere.
 * @version 1.0
 * @license BSD 3-Clause License
 *      Copyright (c) 2018, Jeremiah Dohn
 *      All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *
 *    * Redistributions of source code must retain the above copyright notice, this
 *      list of conditions and the following disclaimer.
 *
 *    * Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 *
 *    * Neither the name of the copyright holder nor the names of its
 *      contributors may be used to endorse or promote products derived from
 *      this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
public with sharing class quickActionsEverywhereController {
    
    public static final String OBJECT_QUERY_ERROR = 'You must include an object with your query.';
    public static final String OBJECT_SELECT_ERROR = 'Your select clause must include at least one field.';
    
    private static final string apiVersion = 'v45.0';
    
    // Coded for returning user preferences method due to errors with inserting user preferences in test classes
    private final static List<UserPreference> upref1 = new List<UserPreference>{new UserPreference(Preference = '57',UserId = UserInfo.getUserId(),Value = '15')};
    private final static List<UserPreference> upref2 = new List<UserPreference>{new UserPreference(Preference = '58',UserId = UserInfo.getUserId(),Value = '120')};
    
    /*
     * @description Retrieves the quick action information based on API Name.  
     *              Global actions are formatted as only the API Name, such as "New_Task" and 
     *              object specific actions are formatted as the SobjectType, a period and then the developer name, such as "Contact.Create_Contact"
     */
    @AuraEnabled
    public static string describeAvailableQuickAction(String quickActionApiName){
        List<QuickAction.DescribeQuickActionResult> daqa = QuickAction.describeQuickActions(new List<String>{quickActionApiName});
        return JSON.serialize(daqa);
    }
    
    /*
     * @description Retrieves the task and event preferences for a user.
     *                          Values are outlined here - https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_objects_userpreference.htm?search_text=userpreference
     */
    @AuraEnabled
    public static string retrieveUserTaskPreferences(string preferenceType){
        string obj = 'UserPreference';
        string schemaDescribe = describeSobjects(new List<String>{obj}, true);
        system.debug('schemaDescribe ' + schemaDescribe);
        
        Map<string, objectDescribeResult> odr =  (Map<string, objectDescribeResult>) JSON.deserialize(schemaDescribe, Map<string, objectDescribeResult>.class);
        system.debug(odr);
        Set<String> retrieveSet = new Set<String>{'Id', 'Preference', 'UserId', 'Value'};
        List<String> retrieveList = new List<String>();
        for(string s : retrieveSet){
            if(odr.get(obj).fields.containsKey(s) && odr.get(obj).fields.get(s).accessible){
                retrieveList.add(s);
            }
        }
        string whereClause = 'UserId = \'' + UserInfo.getUserId() + '\'';
        if(preferenceType == 'Task'){
            whereClause += ' AND Preference = \'' + 58 + '\'';
        } else {
            whereClause += ' AND Preference = \'' + 57 + '\'';
        }
        QueryResult qr = queryDatabase(retrieveList, obj, whereClause, null, null, null);
        
        if(Test.isRunningTest()){
            return (preferenceType == 'Task' ? JSON.serialize(upref1) : JSON.serialize(upref2));
        } else{
          return JSON.serialize(qr);  
        }
        
    }
    
    /*
     * @description Sets the labels for initialization of a lookup field
     */
    @AuraEnabled
    public static string retrieveThisRecordValues(string obj, string searchValue, string fieldList){
        string schemaDescribe = describeSobjects(new List<String>{obj}, true);
        system.debug('schemaDescribe ' + schemaDescribe);
        
        Map<string, objectDescribeResult> odr =  (Map<string, objectDescribeResult>) JSON.deserialize(schemaDescribe, Map<string, objectDescribeResult>.class);
        system.debug(odr);
        Set<String> retrieveSet = new Set<string>();
        if(fieldList == null){
            retrieveSet = new Set<String>{'Id', 'Name'};
        } else{
            retrieveSet = new Set<String>(fieldList.split(','));
        }
        
        List<String> retrieveList = new List<String>();
        for(string s : retrieveSet){
            if(odr.get(obj).fields.containsKey(s) && odr.get(obj).fields.get(s).accessible){
                retrieveList.add(s);
            }
        }
        
        // Technically the user isn't inputting the search value so SOQL injection chances are minimal.
        // You can never be too safe!
        string whereClause = 'Id = \'' + string.escapeSingleQuotes(searchValue)+ '\'';
        QueryResult qr = queryDatabase(retrieveList, obj, whereClause, null, null, null);
        
        return JSON.serialize(qr);
    }
    
    /*
     * @description Retrieves related records to parent for update mass actions.
     */
    @AuraEnabled
    public static string retrieveRelatedRecords(string searchValue, string obj, string relatedField, string fieldList){
        string schemaDescribe = describeSobjects(new List<String>{obj}, true);
        system.debug('schemaDescribe ' + schemaDescribe);
        
        Map<string, objectDescribeResult> odr =  (Map<string, objectDescribeResult>) JSON.deserialize(schemaDescribe, Map<string, objectDescribeResult>.class);
        system.debug(odr);
        Set<String> retrieveSet = new Set<string>();
        if(fieldList == null){
            retrieveSet = new Set<String>{'Id', 'Name'};
        } else{
            retrieveSet = new Set<String>(fieldList.split(','));
        }
        
        List<String> retrieveList = new List<String>();
        for(string s : retrieveSet){
            if(odr.get(obj).fields.containsKey(s) && odr.get(obj).fields.get(s).accessible){
                retrieveList.add(s);
            }
        }
        
        string whereClause = string.escapeSingleQuotes(relatedField) +  ' = \'' + string.escapeSingleQuotes(searchValue)+ '\'';
        QueryResult qr = queryDatabase(retrieveList, obj, whereClause, null, null, null);
        
        return JSON.serialize(qr);
    }
    
    /*
     * @description Queries the database for a record and returns a QueryResult.  This includes errors or successes.
     */
    public static queryResult queryDatabase(List<String> selectClause, String obj, string whereClause, string groupBy, string orderBy, integer limitClause){
        queryResult qr = new queryResult();
        if(selectClause != null && selectClause.size() > 0){
            if(obj != null){
               
                string selectClauseClean = string.join(selectClause,',');
                string query = 'SELECT ' + string.escapeSingleQuotes(selectClauseClean) + ' FROM ' + obj;
                if(whereClause != null){
                    query += ' WHERE ' + whereClause;
                }
                if(groupBy != null){
                    query += ' GROUP BY ' +  string.escapeSingleQuotes(groupBy);
                }
                if(orderBy != null){
                    query += ' ORDER BY ' + string.escapeSingleQuotes(orderBy);
                }
                if(limitClause != null){
                    query += ' LIMIT ' + limitClause;
                }
                system.debug('query: ' + query);
                
                try{
                    List<sObject> result = database.query(query);
                    qr.result = result;
                } catch(exception e){
                    qr.error = e.getMessage();
                }

            } else{
                qr.error = OBJECT_QUERY_ERROR;
            }
        } else{
            qr.error = OBJECT_SELECT_ERROR;
        }
        return qr;
    }
    
    /*
     * @description Used for determining if the quick action is available for the user.
     */
    @AuraEnabled
    public static boolean isRecordTypeAvailable(String recordTypeId, string obj){
        Id cleanRecordTypeId = recordTypeId; // Quick Action only uses 15 char instead of 18.  This is to convert to 18.
        system.debug(cleanRecordTypeId);
        SObjectType r = ((SObject)(Type.forName('Schema.'+obj).newInstance())).getSObjectType();
        DescribeSObjectResult d = r.getDescribe();
        Map<Id,Schema.RecordTypeInfo> rtMapById = d.getRecordTypeInfosById();
        if(recordTypeId != null){
            return rtMapById.get(cleanRecordTypeId).isAvailable();  
        } else { // This should never happen - method only called if recordTypeId is specified
            return false;
        }
        
    }
    
    /*
     * @description Retrieves the search layout for the lookup field and caches the result.
     */
    @AuraEnabled
    public static string retrieveSearchLayout(string sobjectType){
        
        Cache.OrgPartition orgPart = Cache.Org.getPartition('local.qaeRestCache');
        system.debug(orgPart);
        if(orgPart.contains('searchLayout' + sobjectType)){
            String cachedSearchLayout = (String) orgPart.get('searchLayout' + sobjectType);
            return cachedSearchLayout;
        } else{
            Http h = new Http();
            HttpRequest req = new HttpRequest();  
            req.setEndpoint('callout:qae_REST_API/' + apiVersion + '/search/layout/?q=' + sobjectType);
            req.setHeader('Content-Type', 'application/json');
            req.setMethod('GET');
            HttpResponse res = h.send(req);
            if(res.getStatus() == 'OK'){
                orgPart.put('searchLayout' + sobjectType, (string)res.getBody());
            }
            return res.getBody();
        }
    }
    
    /*
     * @description Performs a SOSL search.
     */
    @AuraEnabled
    public static string performSearch(string searchString, string sobjectType, string returningFields, string whereClause, integer limitClause){
        if(limitClause == null){
            limitClause = 2000; // default search length
        }
        
        string schemaDescribe = describeSobjects(new List<String>{sobjectType}, true);   
        Map<string, objectDescribeResult> odr =  (Map<string, objectDescribeResult>) JSON.deserialize(schemaDescribe, Map<string, objectDescribeResult>.class);

        List<String> retrieveList = new List<String>();
        system.debug(returningFields);
        for(string s : returningFields.split(',')){
            if(odr.get(sobjectType).fields.containsKey(s) && odr.get(sobjectType).fields.get(s).accessible){
                retrieveList.add(s);
            } else if(s.contains('.') || s.contains('__r')){
                List<string> fields = s.split('\\.');
                string currentField = (fields[0].contains('__r') ? fields[0].replace('__r', '__c') : fields[0] + 'Id');
                fields.remove(0);
                if(odr.get(sobjectType).fields.containsKey(currentField) && odr.get(sobjectType).fields.get(currentField).accessible){
                    system.debug('Going through access');
                    boolean hasAccess = getRecursiveFieldAccess(fields, odr.get(sobjectType).fields.get(currentField).referenceTo);
                    if(hasAccess){
                        retrieveList.add(s);
                    }
                }
                
            }
        }
        system.debug(retrieveList);
        
        List<Sobject> searchList = new List<Sobject>();
        if(whereClause != null){
            searchList = search.query('FIND {' + string.escapeSingleQuotes(searchString) + '} RETURNING ' + sobjectType + ' (' + string.join(retrieveList, ',') + ' WHERE ' + string.escapeSingleQuotes(whereClause) + ') LIMIT ' + limitClause)[0];
        } else{
            searchList = search.query('FIND {' + string.escapeSingleQuotes(searchString) + '} RETURNING ' + sobjectType + ' (' + string.join(retrieveList, ',') + ') LIMIT ' + limitClause)[0];
        }
        system.debug(searchList);
        
        return JSON.serialize(searchList);
    }
    
    // Shout out to SFDCFox - using super fast schema describe
    // https://salesforce.stackexchange.com/questions/218982/why-is-schema-describesobjectstypes-slower-than-schema-getglobaldescribe/219010#219010
    @AuraEnabled
    public static string describeSobjects(List<String> objList, boolean includeFields){
        Map<String, objectDescribeResult> dsr = new Map<String, objectDescribeResult>();
        for (String obj : objList) {
            if(obj != 'Calendar'){ // Assigned To Id on events are related to calendars which is not a valid sobject type
                SObjectType r = ((SObject)(Type.forName('Schema.'+obj).newInstance())).getSObjectType();
                DescribeSObjectResult d = r.getDescribe();
                objectDescribeResult odr = new objectDescribeResult(d, includeFields);
                dsr.put(odr.name, odr);
            }
        }
        return JSON.serialize(dsr);
    }
    
    /*
     * @description Used to get Icon information for the application.
     */
    @AuraEnabled
    public static string describeIcons(){
        Cache.OrgPartition orgPart = Cache.Org.getPartition('local.qaeRestCache');
        String cachedTabs = (String)orgPart.get('tabs');
        if(cachedTabs != null){
            return cachedTabs;
        } else{
            Http h = new Http();
            HttpRequest req = new HttpRequest();  
            req.setEndpoint('callout:qae_REST_API/' + apiVersion + '/theme');
            req.setHeader('Content-Type', 'application/json');
            req.setMethod('GET');
            HttpResponse res = h.send(req);
            if(res.getStatus() == 'OK'){
                orgPart.put('tabs', (string)res.getBody());
            }
            return res.getBody();
        }
    }
    
    /*
     * @description Describe default values for the quick action.  Is called every time there are default values to be set on the action.
     */
    @AuraEnabled
    public static string describeDefaultValues(String obj, string action, boolean isGlobal){
        string calloutUrl = '';
        if(isGlobal){
            calloutUrl = '/quickActions/' + action + '/defaultValues';
        } else{
            calloutUrl = '/sobjects/' + obj  + '/quickActions/' + action + '/defaultValues';
        }
        
        Http h = new Http();
        HttpRequest req = new HttpRequest();  
        req.setEndpoint('callout:qae_REST_API/' + apiVersion + calloutUrl);
        req.setHeader('Content-Type', 'application/json');
        req.setMethod('GET');
        HttpResponse res = h.send(req);

        return res.getBody();
    }
    
    /*
     * @description Sets the labels for initialization of a lookup field
     */
     @RemoteAction 
    public static saveResultList saveThisRecord(string obj, String sobj, string redirectValue, string quickActionType){
        saveResultList sr = new saveResultList();
        if(redirectValue == null || sobj == null){
            sr.errorMsg = 'Values not provided to save.';
            return sr;
        } else {
            string schemaDescribe = describeSobjects(new List<String>{obj}, true);
            system.debug('schemaDescribe ' + schemaDescribe);
            
            Map<string, objectDescribeResult> odr =  (Map<string, objectDescribeResult>) JSON.deserialize(schemaDescribe, Map<string, objectDescribeResult>.class);
            Sobject sobjSerialized =  (Sobject) JSON.deserialize(sobj, Sobject.class);
            Map<String, Object> fieldsToValue = sobjSerialized.getPopulatedFieldsAsMap();
            SObjectType dsr = ((SObject)(Type.forName('Schema.'+obj).newInstance())).getSObjectType();
            sObject sObjToCommit = dsr.newSobject();
            List<Sobject> sobjList = new List<Sobject>();
            for(string s : fieldsToValue.keySet()){
                if(odr.get(obj).fields.containsKey(s) && odr.get(obj).fields.get(s).updateable && quickActionType == 'Update'){
                                        sObjToCommit.put(s, fieldsToValue.get(s));
                } else if(s == 'Id'){
                    sObjToCommit.put('Id', fieldsToValue.get('Id'));
                }
                if(odr.get(obj).fields.containsKey(s) && odr.get(obj).fields.get(s).createable && quickActionType == 'Create'){
                                        sObjToCommit.put(s, fieldsToValue.get(s));
                }
            }
            sObjList.add(sobjToCommit);
            system.debug('Object Describe Result ' + odr);
            system.debug('serializedSobject ' + sobjSerialized);
            if(quickActionType == 'Create'){
                try{
                    Database.SaveResult[] srRes = database.insert(sObjList);
                    sr.saveResult = srRes;
                } catch(exception e){
                    sr.errorMsg = e.getMessage();
                }
                return sr;
            } else {
                try{
                    Database.SaveResult[] srRes = database.update(sObjList);
                    sr.saveResult = srRes;
                } catch(exception e){
                    sr.errorMsg = e.getMessage();
                }
                return sr;
            }
        }
    }
    
    /*
     * @description Recursively gets access for parent fields
     */
    public static boolean getRecursiveFieldAccess(List<string> s, List<String> referenceTo){
        system.debug(s);
        system.debug(referenceTo[0]);
        string field = (s[0].contains('__r') ? s[0].replace('__r', '__c') : s[0]);
        SObjectType r = ((SObject)(Type.forName('Schema.'+ referenceTo[0])).newInstance()).getSObjectType();
        DescribeSObjectResult d = r.getDescribe();
        objectDescribeResult odr = new objectDescribeResult(d, true);
        if(odr.fields.containsKey(field) && odr.fields.get(field).accessible){
            return true;
        } else if(s.size() > 1){
            s.remove(0);
            boolean hasAccess = getRecursiveFieldAccess(s, referenceTo);
            if(hasAccess){
                return true;
            } else{
                return false;
            }
        } else{
            return false;
        }
    }
    
    /*
     * @description Saves record and returns in a JSON friendly format.
     */
    @AuraEnabled
    public static string saveThisRecordLightning(string obj, String sobj, string redirectValue, string quickActionType){
        return JSON.serialize(saveThisRecord(obj, sobj, redirectValue, quickActionType));
    }
    
    /*
     * @description Gets base URL for links
     */
    @AuraEnabled
    public static string getBaseURL(){
        return System.URL.getSalesforceBaseUrl().toExternalForm();
    }
    
    /*
     * @description Redirects to the value provided to the method or the homepage if the record is missing.
     */
    public static PageReference redirect(){
        string value = Apexpages.currentPage().getParameters().get('value');
        system.debug(value);
        if(value != null){
            PageReference pageRef = new PageReference('/' + value);
            pageRef.setRedirect(true);
            return pageRef;
        } else{
            string defaultUrl = (UserInfo.getUiThemeDisplayed() == 'Theme3' ? '/home/home.jsp' : '/lightning/page/home');
            PageReference pageRef = new PageReference(defaultUrl);
            pageRef.setRedirect(true);
            return pageRef;
        }
    }
    
    // Have to make a wrapper for describes or a javalang error will occur:
    // System.JSONException: (was java.lang.NullPointerException) (through reference chain: common.api.soap.wsdl.DescribeSObjectResult["listviewable"])
    public class objectDescribeResult{
        public string name {get;set;}
        public string keyPrefix {get;set;}
        public string label {get;set;}
        public Map<String, field> fields {get;set;}
        
 
        public objectDescribeResult(DescribeSObjectResult d, boolean includeFields) {
            name = d.getName();
            keyPrefix = d.getKeyPrefix();
            label = d.getLabel();
            
            if(includeFields){
                // Describe fields
                fields = new Map<String, field>();
                Map<String, Schema.SobjectField> dfrMap = d.fields.getMap();
                for(String fr : dfrMap.keyset()){
                    field f = new field(dfrMap.get(fr).getDescribe());
                    fields.put(f.name, f);
                }
            }
        }
    }

    public class field{
        public string name {get;set;}
        public string label {get;set;}
        public boolean accessible{get;set;}
        public boolean createable{get;set;}
        public boolean updateable{get;set;}
        public string fieldType{get;set;}
        public List<String> referenceTo{get;set;}

        public field(Schema.DescribeFieldResult field){
            this.name = field.getName();
            this.label = field.getLabel();
            this.fieldType = String.valueOf(field.getType()); 
            this.accessible = field.isAccessible();
            this.createable = field.isCreateable();
            this.updateable = field.isUpdateable();
            this.referenceTo = new List<String>();
            for(Schema.SobjectType s : field.getReferenceTo()){
                referenceTo.add(s.getDescribe().getName());
            }
        }
    } 
    
    public class queryResult{
        public String error {get;set;}
        public List<Sobject> result {get;set;}
    }
                         
    public class searchResult{
        public string errorMsg {get;set;}
        public string label {get;set;}
        public string limitRows {get;set;}
        public string objectType {get;set;}
        public List<searchColumns> searchColumns {get;set;}
   }
                 
   public class saveResultList{
       public string errorMsg {get;set;}
       public List<Database.SaveResult> saveResult {get;set;}
   }
    
   public class searchColumns{
       public string field {get;set;}
       public string format {get;set;}
       public string label {get;set;}
       public string name {get;set;}
    }     
    
}