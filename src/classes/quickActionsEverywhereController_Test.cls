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
@isTest(seeAllData=false)
private class quickActionsEverywhereController_Test {
    
    // Note: While typically bulk data testing should be conducted, since the nature of this application is transactional and is one record save at a time, bulk testing is not conducted.
    //       If and when this application supports mass data inserts / updates, such a test I would so make.
    
    private final static string LOG_A_CALL = 'LogACall';
    private final static string ACC_NAME = 'My Awesome Account';
    private final static string ACC_BILLINGSTREET = '1234 Greenbury Lane';
    private final static string ACC_BILLINGSTATE = 'Nebraska';
    private final static string ACC_BILLINGPOSTALCODE = '68140';
    private final static string ACC_BILLINGCOUNTRY = 'United States';
    private final static string OPP_NAME = 'Arkaham Widgets';
    
    @isTest
    static void describeAvailableQuickAction(){
        
        Test.startTest();
        
        String daqa = quickActionsEverywhereController.describeAvailableQuickAction(LOG_A_CALL);
        system.assertNotEquals(null, daqa);
        List<Object> daqaDeserialized = (List<Object>) json.deserializeUntyped(daqa);
        Map<String,Object> daqaMap = (Map<String,Object>) daqaDeserialized[0];
        system.assertEquals(LOG_A_CALL, daqaMap.get('name'));
        
        Test.stopTest();
    }
    
    @isTest
    static void retrieveUserTaskPreferences(){
        
        // System will not allow insert of user preferences even with system.runAs current testing user. As a result, the variables are coded to return properly in Test Context.
        
        Test.startTest();
        
        String upref1Json = quickActionsEverywhereController.retrieveUserTaskPreferences('Task');
        String upref2Json = quickActionsEverywhereController.retrieveUserTaskPreferences('Event');
        List<UserPreference> upref1List = (List<UserPreference>) json.deserialize(upref1Json, List<UserPreference>.class);
        List<UserPreference> upref2List = (List<UserPreference>) json.deserialize(upref2Json, List<UserPreference>.class);
        system.assertEquals('15', upref1List[0].Value);
        system.assertEquals('120', upref2List[0].Value);
        
        Test.stopTest();
    }
    
    @isTest
    static void retrieveThisRecordValues(){
        //retrieveThisRecordValues(string obj, string searchValue, string fieldList)
        
        Account a = new Account(Name=ACC_NAME, BillingStreet=ACC_BILLINGSTREET,BillingState=ACC_BILLINGSTATE,BillingPostalCode=ACC_BILLINGPOSTALCODE,BillingCountry=ACC_BILLINGCOUNTRY);
        insert a;
        
        Test.startTest();
        String retrieveResult1 = quickActionsEverywhereController.retrieveThisRecordValues('Account', a.Id, 'Name,BillingStreet,BillingState,BillingPostalCode,BillingCountry');
        quickActionsEverywhereController.QueryResult qr1 = (quickActionsEverywhereController.QueryResult) JSON.deserialize(retrieveResult1, quickActionsEverywhereController.QueryResult.class);
        system.assertEquals(null, qr1.error);
        system.assertEquals(1, qr1.result.size());
        system.assertEquals(ACC_NAME, qr1.result[0].get('Name'));
        system.assertEquals(ACC_BILLINGSTREET, qr1.result[0].get('BillingStreet'));
        system.assertEquals(ACC_BILLINGSTATE, qr1.result[0].get('BillingState'));
        system.assertEquals(ACC_BILLINGPOSTALCODE, qr1.result[0].get('BillingPostalCode'));
        system.assertEquals(ACC_BILLINGCOUNTRY, qr1.result[0].get('BillingCountry'));
        
        String retrieveResult2 = quickActionsEverywhereController.retrieveThisRecordValues('Account', a.Id, null);
        quickActionsEverywhereController.QueryResult qr2 = (quickActionsEverywhereController.QueryResult) JSON.deserialize(retrieveResult2, quickActionsEverywhereController.QueryResult.class);
        system.assertEquals(null, qr2.error);
        system.assertEquals(1, qr2.result.size());
        system.assertEquals(ACC_NAME, qr2.result[0].get('Name'));
        system.assertEquals(null, qr2.result[0].get('BillingStreet'));
        system.assertEquals(null, qr2.result[0].get('BillingState'));
        system.assertEquals(null, qr2.result[0].get('BillingPostalCode'));
        system.assertEquals(null, qr2.result[0].get('BillingCountry'));
        
        Test.stopTest();
    }
    
    @isTest
    static void retrieveRelatedRecords(){
        //retrieveRelatedRecords(string searchValue, string obj, string relatedField, string fieldList)
        
        Account a = new Account(Name=ACC_NAME, BillingStreet=ACC_BILLINGSTREET,BillingState=ACC_BILLINGSTATE,BillingPostalCode=ACC_BILLINGPOSTALCODE,BillingCountry=ACC_BILLINGCOUNTRY);
        insert a;
        
        Opportunity o = new Opportunity(Name=OPP_NAME,AccountId=a.Id, CloseDate=System.today() + 20, StageName='1. Identifying Decisionmaker');
        insert o;
        
        Test.startTest();
        String retrieveResult1 = quickActionsEverywhereController.retrieveRelatedRecords(a.Id,'Opportunity','AccountId', 'Name,BillingStreet,BillingState,BillingPostalCode,BillingCountry');
        quickActionsEverywhereController.QueryResult qr1 = (quickActionsEverywhereController.QueryResult) JSON.deserialize(retrieveResult1, quickActionsEverywhereController.QueryResult.class);
        system.assertEquals(null, qr1.error);
        system.assertEquals(1, qr1.result.size());
        system.assertEquals(OPP_NAME, qr1.result[0].get('Name'));
        
        String retrieveResult2 = quickActionsEverywhereController.retrieveRelatedRecords(a.Id,'Opportunity','AccountId', null);
        quickActionsEverywhereController.QueryResult qr2 = (quickActionsEverywhereController.QueryResult) JSON.deserialize(retrieveResult2, quickActionsEverywhereController.QueryResult.class);
        system.assertEquals(null, qr2.error);
        system.assertEquals(1, qr2.result.size());
        system.assertEquals(OPP_NAME, qr2.result[0].get('Name'));
        
        Test.stopTest();
    }
    
    @isTest
    static void queryDatabase_NoObjectOrSelect(){
        //queryDatabase(List<String> selectClause, String obj, string whereClause, string groupBy, string orderBy, integer limitClause)
        
        Test.startTest();
        
        quickActionsEverywhereController.QueryResult qr1 = quickActionsEverywhereController.queryDatabase(new List<String>{'Id'}, null, null, null, null, null);
        system.assertEquals(quickActionsEverywhereController.OBJECT_QUERY_ERROR, qr1.error);
        system.assertEquals(null, qr1.result);
        
        quickActionsEverywhereController.QueryResult qr2 = quickActionsEverywhereController.queryDatabase(null, 'Account', null, null, null, null);
        system.assertEquals(quickActionsEverywhereController.OBJECT_SELECT_ERROR, qr2.error);
        system.assertEquals(null, qr2.result);
        
        Test.stopTest();
    }
    
    @isTest
    static void queryDatabase_queryAll(){
        //queryDatabase(List<String> selectClause, String obj, string whereClause, string groupBy, string orderBy, integer limitClause)
        
        Account a = new Account(Name=ACC_NAME, BillingStreet=ACC_BILLINGSTREET,BillingState=ACC_BILLINGSTATE,BillingPostalCode=ACC_BILLINGPOSTALCODE,BillingCountry=ACC_BILLINGCOUNTRY);
        insert a;
        
        Test.startTest();
        
        quickActionsEverywhereController.QueryResult qr1 = quickActionsEverywhereController.queryDatabase(new List<String>{'BillingCountry'}, 'Account', 'Name =\'' + ACC_NAME + '\'', 'BillingCountry', 'BillingCountry', 1);
        system.assertEquals(null, qr1.error);
        system.assertEquals(ACC_BILLINGCOUNTRY, qr1.result[0].get('BillingCountry'));
        
        Test.stopTest();
    }
    
    @isTest
    static void isRecordTypeAvailable(){
        //isRecordTypeAvailable(String recordTypeId, string obj)
        
        Test.startTest();
        
        boolean recType = quickActionsEverywhereController.isRecordTypeAvailable(null, 'Account');
        system.assertEquals(false, recType);
        
        SObjectType r = ((SObject)(Type.forName('Schema.Account').newInstance())).getSObjectType();
        DescribeSObjectResult d = r.getDescribe();
        Map<Id,Schema.RecordTypeInfo> rtMapById = d.getRecordTypeInfosById();
        if(rtMapById != null){
            String recordTypeId = (String) new list<Id>(rtMapById.keyset())[0];
            boolean expected = rtMapById.get(recordTypeId).isAvailable();
            boolean recTypeIfAvail = quickActionsEverywhereController.isRecordTypeAvailable(recordTypeId, 'Account');
            system.assertEquals(expected, recTypeIfAvail);
        }
        
        Test.stopTest();
    }
    
    @isTest
    static void retrieveSearchLayout(){
        //retrieveSearchLayout(string sobjectType)
        
        Test.startTest();
        
        StaticResourceCalloutMock mock = new StaticResourceCalloutMock();
        mock.setStaticResource('qaeMock_accountSearchResult');
        mock.setStatusCode(200);
        mock.setHeader('Content-Type', 'application/json');
        Test.setMock(HttpCalloutMock.class, mock);
        string response = quickActionsEverywhereController.retrieveSearchLayout('Contact');
        List<quickActionsEverywhereController.searchResult> sr = (List<quickActionsEverywhereController.searchResult>) JSON.deserialize(response, List<quickActionsEverywhereController.searchResult>.class);
        system.assertEquals('Contact', sr[0].objectType);
        system.assertEquals(5, sr[0].searchColumns.size());
        system.assertEquals('Contact.Name', sr[0].searchColumns[0].field);
        system.assertEquals(null, sr[0].searchColumns[0].format);
        system.assertEquals('Name', sr[0].searchColumns[0].label);
        system.assertEquals('Name', sr[0].searchColumns[0].Name);
        system.assertEquals('25', sr[0].limitRows);
        system.assertEquals('Search Results', sr[0].label);
        system.assertEquals(null, sr[0].errorMsg);
        
        // Call it again to ensure in cache
        response = quickActionsEverywhereController.retrieveSearchLayout('Contact');
        Cache.OrgPartition orgPart = Cache.Org.getPartition('local.qaeRestCache');
        system.assert(orgPart.contains('searchLayoutContact'));
        
        Test.stopTest();
    }
    
    @isTest
    static void performSearch(){
        //performSearch(string searchString, string sobjectType, string returningFields, string whereClause, integer limitClause)
        Account a = new Account(Name=ACC_NAME, BillingStreet=ACC_BILLINGSTREET,BillingState=ACC_BILLINGSTATE,BillingPostalCode=ACC_BILLINGPOSTALCODE,BillingCountry=ACC_BILLINGCOUNTRY);
        insert a;
        
        Opportunity o = new Opportunity(Name=OPP_NAME,AccountId=a.Id, CloseDate=System.today() + 20, StageName='1. Identifying Decisionmaker');
        insert o;
        Id [] fixedSearchResults= new Id[1];
        fixedSearchResults[0] = o.Id;
        Test.setFixedSearchResults(fixedSearchResults);
        
        Test.startTest();
        
        string result = quickActionsEverywhereController.performSearch(ACC_NAME, 'Opportunity', 'Id,AccountId,Account.Name,Account.Parent.Name,Name', null, null);
        List<Sobject> sobj = (List<Sobject>) json.deserialize(result, List<Sobject>.class);
        system.assertEquals(1, sobj.size());
        system.assertEquals(o.Id, sobj[0].get('Id'));
        system.assertEquals(a.Id, sobj[0].get('AccountId'));

        Test.stopTest();
    }
    
    @isTest
    static void describeIcons(){
        //describeIcons()
        
        Test.startTest();
        
        StaticResourceCalloutMock mock = new StaticResourceCalloutMock();
        mock.setStaticResource('qaeMock_themeResponse');
        mock.setStatusCode(200);
        mock.setHeader('Content-Type', 'application/json');
        Test.setMock(HttpCalloutMock.class, mock);
        
        string result = quickActionsEverywhereController.describeIcons();
        Map<String, Map<String, Map<String, String>>> deserialized = (Map<String, Map<String, Map<String, String>>>) json.deserialize(result, Map<String, Map<String, Map<String, String>>>.class);
        system.assertEquals(105, deserialized.size());
        
        result = quickActionsEverywhereController.describeIcons();
        Cache.OrgPartition orgPart = Cache.Org.getPartition('local.qaeRestCache');
        String cachedTabs = (String)orgPart.get('tabs');
        system.assertNotEquals(null, cachedTabs);
        
        Test.stopTest();
    }
    
    @isTest
    static void describeDefaultValues(){
        //describeDefaultValues(String obj, string action, boolean isGlobal) 
        
        Test.startTest();
        
        string defaultValues = '{"attributes":{"type":"Task"},"Subject":null,"ActivityDate":null,"WhoId":null,"Status":"Not Started","Priority":"Normal","OwnerId":"00511000006TXhSAAW","WhatId":null,"IsReminderSet":false}';
        StaticResourceCalloutMock mock = new StaticResourceCalloutMock();
        mock.setStaticResource('qaeMock_defaultValues');
        mock.setStatusCode(200);
        mock.setHeader('Content-Type', 'application/json');
        Test.setMock(HttpCalloutMock.class, mock);
        
        string result = quickActionsEverywhereController.describeDefaultValues(null, 'LogACall', true);
        Object deserialized = json.deserializeUntyped(result);
        system.assertEquals(defaultValues, deserialized);
        
        result = quickActionsEverywhereController.describeDefaultValues('Account', 'LogACall', false);
        deserialized = json.deserializeUntyped(result);
        system.assertEquals(defaultValues, deserialized);
        
        Test.stopTest();
    }
    
    @isTest
    static void getRecursiveFieldAccess(){
        //getRecursiveFieldAccess(List<string> s, List<String> referenceTo)
        
        Test.startTest();
        
        boolean hasAccess = quickActionsEverywhereController.getRecursiveFieldAccess(new List<String>{'ParentId'}, new List<String>{'Account'});
        system.assertEquals(true, hasAccess);
        
        boolean hasAccess2 = quickActionsEverywhereController.getRecursiveFieldAccess(new List<String>{'Case', 'ParentId'}, new List<String>{'Case'});
        system.assertEquals(true, hasAccess2);
        
        Test.stopTest();
    }
    
    @isTest
    static void saveThisRecordLightning(){
        //saveThisRecordLightning(string obj, String sobj, string redirectValue, string quickActionType)
        Test.startTest();
        string sr1String = quickActionsEverywhereController.saveThisRecordLightning('Account', JSON.serialize(new Account(Name=ACC_NAME)), 'parent', 'Create');
        quickActionsEverywhereController.saveResultList sr1 = (quickActionsEverywhereController.saveResultList) JSON.deserialize(sr1String, quickActionsEverywhereController.saveResultList.class);
        system.assertEquals(null, sr1.errorMsg);
        
        Account acc = [SELECT Id, Name FROM Account][0];
        system.assertEquals(acc.Name, ACC_NAME);
        acc.Name = 'My new acc name';
        
        string sr2String = quickActionsEverywhereController.saveThisRecordLightning('Account', JSON.serialize(acc), 'parent', 'Update');
        quickActionsEverywhereController.saveResultList sr2 = (quickActionsEverywhereController.saveResultList) JSON.deserialize(sr2String, quickActionsEverywhereController.saveResultList.class);
        system.assertEquals(null, sr2.errorMsg);
        
        acc = [SELECT Id, Name FROM Account][0];
        system.assertEquals('My new acc name', acc.Name);
        
        Test.stopTest();
    }
    
    @isTest
    static void saveThisRecordLightning_NullVals(){
        Test.startTest();
        
        string sr1String = quickActionsEverywhereController.saveThisRecordLightning('Task', null, 'parent', 'Create');
        quickActionsEverywhereController.saveResultList sr1 = (quickActionsEverywhereController.saveResultList) JSON.deserialize(sr1String, quickActionsEverywhereController.saveResultList.class);
        system.assertEquals('Values not provided to save.', sr1.errorMsg);
        
        string sr2String = quickActionsEverywhereController.saveThisRecordLightning('Task', JSON.serialize(new Account(Name=ACC_NAME)), null, 'Create');
        quickActionsEverywhereController.saveResultList sr2 = (quickActionsEverywhereController.saveResultList) JSON.deserialize(sr2String, quickActionsEverywhereController.saveResultList.class);
        system.assertEquals('Values not provided to save.', sr2.errorMsg);
        
        Test.stopTest();
    }
    
    @isTest
    static void getBaseURL(){
        //getBaseURL()
        system.assertEquals(System.URL.getSalesforceBaseUrl().toExternalForm(), quickActionsEverywhereController.getBaseURL());
    }
    
    @isTest
    static void redirect(){
        //redirect() 
        Account a = new Account(Name=ACC_NAME, BillingStreet=ACC_BILLINGSTREET,BillingState=ACC_BILLINGSTATE,BillingPostalCode=ACC_BILLINGPOSTALCODE,BillingCountry=ACC_BILLINGCOUNTRY);
        insert a;
        
        Test.startTest();
        
        PageReference pageRef = Page.quickActionsEverywhere;
        Test.setCurrentPage(pageRef);
        ApexPages.currentPage().getParameters().put('value',a.id);
        PageReference redirect = quickActionsEverywhereController.redirect();
        system.assertNotEquals(redirect, pageRef);
        
        string defaultUrl = (UserInfo.getUiThemeDisplayed() == 'Theme3' ? '/home/home.jsp' : '/lightning/page/home');
        Test.setCurrentPage(pageRef);
        ApexPages.currentPage().getParameters().put('value',null);
        redirect =  quickActionsEverywhereController.redirect();
        system.assert(redirect.getUrl().contains(defaultUrl));
        
        Test.stopTest();
    }
    
}