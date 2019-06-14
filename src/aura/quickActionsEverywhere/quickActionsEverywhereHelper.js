({
    initialize : function(component, event, helper){
      	var action = component.get("v.action");
        var flowDevName = component.get("v.flowDevName");
        
        // Populate the record Id if used from a record page
		var relatedId = component.get("v.relatedId");
        var recordId = component.get("v.recordId");
        if(relatedId === undefined && recordId !== undefined){
        	component.set("v.relatedId", recordId);
        }        
        console.log("Related Id", component.get("v.relatedId"));
		
        if(flowDevName === ""){
            // Get the quick action
            var quickActions = component.get("c.describeAvailableQuickAction");
            quickActions.setParams({"quickActionApiName" : action});
            var quickActionsPromise = helper.executeAction(component, quickActions);
            
            var quickAction;
            quickActionsPromise.then(
                $A.getCallback(function(result){
                    if(result !== undefined){
                        quickAction = JSON.parse(result)[0];
                        console.log("Result", quickAction);
                        console.log("quickaction type", quickAction.type);
                        
                        if(quickAction.type === "Create" || quickAction.type === "Update"){
                            var record = component.set("v.record", {"attributes" : {"type" : quickAction.targetSobjectType}});
                        } 
                        
                        if(quickAction.type !== "LightningComponent" && quickAction.type !== "VisualforcePage"){
                            // If the object isn't a task or an event, we won't need to get the icons for the objects
                            // nor will we need the object labels
                            var icons = window.DataCache.getData("qae_icons");
                            if(icons){
                                console.log("Icons retrieved from custom cache");
                            } else{
                                helper.getIcons(component, helper);
                                helper.schemaDescribe(component, helper, quickAction);
                            }
                            
                            if(quickAction.targetRecordTypeId !== null){
                                var recordTypeAvailable = component.get("c.isRecordTypeAvailable");
                                recordTypeAvailable.setParams({"recordTypeId" : quickAction.targetRecordTypeId, "obj" : quickAction.targetSobjectType});
                                var recordTypeAvailablePromise = helper.executeAction(component, recordTypeAvailable);
                                recordTypeAvailablePromise.then(
                                    $A.getCallback(function(result){
                                        component.set("v.recordTypeAvailable", result);
                                        console.log("record type available", result);
                                    }),
                                    $A.getCallback(function(error){
                                        console.warn(error);
                                    })
                                )
                                
                            }
                            
                            var objectDescribe = component.get("c.describeSobjects");
                            console.log(quickAction.targetSobjectType);
                            objectDescribe.setParams({"objList" : [quickAction.targetSobjectType], "includeFields" : true});
                            var objectDescribePromise = helper.executeAction(component, objectDescribe);
                            return objectDescribePromise;
                            
                        } else if(quickAction.type === "LightningComponent"){
                            component.set("v.quickAction", quickAction);
                            helper.createComponent(component, helper,  quickAction);
                            component.set("v.loading", false);
                        } else if(quickAction.type === "VisualforcePage"){
                            component.set("v.quickAction", quickAction);
                            component.set("v.loading", false);
                        }                    
                    }
                }),
                $A.getCallback(function(error){
                    console.warn(error);
                })
            ).then(
                $A.getCallback(function(result){
                    var describeResult;
                    var fieldAccess = {};
                    var fields = [];
                    var requiredFields = [];
                    if(result !== undefined){
                        describeResult = JSON.parse(result);
                        console.log('describeResult', describeResult);
                        component.set("v.objectLabel", describeResult[quickAction.targetSobjectType].label);
                        for(var i = 0; i < quickAction.layout.layoutRows.length; i++){
                            var layoutRow = quickAction.layout.layoutRows[i];
                            for(var c = 0; c < layoutRow.layoutItems.length; c++){
                                var layoutItem = layoutRow.layoutItems[c];
                                for(var q = 0; q < layoutItem.layoutComponents.length; q++){
                                    var cmp = layoutItem.layoutComponents[q];
                                    console.log(cmp);

                                    if(cmp.hasOwnProperty("details") && !cmp.hasOwnProperty("components")){
                                        console.log(describeResult[quickAction.targetSobjectType].fields, cmp.details.name, describeResult[quickAction.targetSobjectType].fields[cmp.details.name]);
                                        cmp.details.accessible = describeResult[quickAction.targetSobjectType].fields[cmp.details.name].accessible;
                                        cmp.details.createable = describeResult[quickAction.targetSobjectType].fields[cmp.details.name].createable;
                                        cmp.details.updateable = describeResult[quickAction.targetSobjectType].fields[cmp.details.name].updateable;
                                        if(cmp.details.accessible){
                                            fields.push(cmp.details.name);
                                        }
                                        if(layoutItem.required){
                                            requiredFields.push(cmp.details.name);
                                        }
                                    }
                                    if(cmp.hasOwnProperty("details") && cmp.hasOwnProperty("components")){
                                        // If the user cannot access all fields in the layout component, don't show
                                        var allowedAccess = true;
                                        var createAccess = true;
                                        var updateAccess = true;
                                        var nameRequired = false;
                                        cmp.components.forEach(function(field){
                                            console.log(field);
                                            if(!describeResult[quickAction.targetSobjectType].fields[field.details.name].accessible){
                                                allowedAccess = false;
                                            } 
                                            if(!describeResult[quickAction.targetSobjectType].fields[cmp.details.name].createable){
                                                createAccess = false;
                                            }
                                            if(!describeResult[quickAction.targetSobjectType].fields[cmp.details.name].updateable){
                                                updateAccess = false;
                                            }
                                            if(layoutItem.required){
                                                if(field.details.type === 'address'){
                                                    requiredFields.push(field.details.name);
                                                } else{
                                                    nameRequired = true;
                                                } 
                                            }
                                        });
                                        cmp.details.accessible = allowedAccess;
                                        cmp.details.createable = createAccess;
                                        cmp.details.updateable = updateAccess;
                                        if(cmp.details.accessible){
                                            cmp.components.forEach(function(field){
                                                fields.push(field.details.name);
                                            });
                                        }
                                        if(nameRequired){
                                            requiredFields.push('LastName');
                                        }
                                        console.log("allowedAccess", allowedAccess);
                                    }
                                }
                            }
                        }
                        console.log("fields", fields);
                        console.log("requiredFields", requiredFields);
                        component.set("v.requiredFields", requiredFields);
                        var type = component.get("v.type");
                        var selectedRecords = component.get("v.selectedRecords");
                        if(quickAction.type === "Update" && selectedRecords.length > 0){
                            var searchRecords = component.get("c.retrieveThisRecordValues");
                            searchRecords.setParams({"obj" : quickAction.targetSobjectType, "searchValue" : recordId, "fieldList" : fields.join(',')});
                            var searchRecordsPromise = helper.executeAction(component, searchRecords);
                            searchRecordsPromise.then(
                                $A.getCallback(function(result){
                                    var thisRecord = null;
                                    if(result !== undefined){
                                        console.log(result);
                                        var queryResult = JSON.parse(result);
                                        thisRecord = queryResult.result[0];
                                        helper.parseDefaultValues(component, helper, quickAction, thisRecord);
                                    } else{
                                        if(quickAction.defaultValues.length > 0){
                                            helper.parseDefaultValues(component, helper, quickAction, thisRecord);
                                        } else{
                                            component.set("v.loading", false);
                                            component.set("v.quickAction", quickAction);
                                        }
                                    }
                                }),
                                $A.getCallback(function(error){
                                    console.warn(error);
                                })
                            )
                        } else{
                            if(type !== 'relatedList'){
                                helper.parseDefaultValues(component, helper, quickAction, null);
                            } else if(type === 'relatedList' && selectedRecords.length === 0){
                                helper.queryRelatedRecords(component, event, helper, quickAction, describeResult[quickAction.targetSobjectType]);
                                component.set("v.loading", false);
                                component.set("v.quickAction", quickAction);
                            } else{
                                component.set("v.loading", false);
                                component.set("v.quickAction", quickAction);
                            }
                        }
                    }
                }),
                $A.getCallback(function(error){
                    console.warn(error);
                })
            )
        } else {
            component.set("v.loading", false);
            var flow = component.find("flowData");
            var inputVariables = [];
            inputVariables.push({"name": "recordId", "type": "String", "value" : relatedId});
            flow.startFlow(flowDevName, inputVariables);
        }  
    },
    schemaDescribe : function(component, helper, quickAction){
        console.log('Enter schema describe');
        var referenceTo = {};
        var keyPrefix = {};
        var describeList = [];
        for(var i = 0; i < quickAction.layout.layoutRows.length; i++){
            var layoutRow = quickAction.layout.layoutRows[i];
            for(var c = 0; c < layoutRow.layoutItems.length; c++){
                var layoutItem = layoutRow.layoutItems[c];
                for(var q = 0; q < layoutItem.layoutComponents.length; q++){
                    var cmp = layoutItem.layoutComponents[q];
                    console.log(cmp);
                    
                    if(cmp.hasOwnProperty("details") && cmp.details.referenceTo.length > 0){
                        cmp.details.referenceTo.forEach(function(ref){
                            if(!describeList.includes(ref)){
                                describeList.push(ref);
                            }
                        })
                    }
                }
            }
        }

        // Begin describe
        var objectDescribe = component.get("c.describeSobjects");
        objectDescribe.setParams({"objList" : describeList, "includeFields" : false});
        var objectDescribePromise = helper.executeAction(component, objectDescribe);
        objectDescribePromise.then(
            $A.getCallback(function(result){
                var describeResult;
                if(result !== undefined){
                    describeResult = JSON.parse(result);
                    console.log(describeResult);
                    Object.keys(describeResult).forEach(function(key){
                        if(!referenceTo.hasOwnProperty(key)){
                            referenceTo[key] = {"label" : describeResult[key].label};
                            keyPrefix[describeResult[key].keyPrefix] = {"object" : key};
                        } 
                    });
                    console.log('Object Keys', referenceTo);
                    console.log('Prefixes', keyPrefix);
                    window.DataCache.setData("qae_objectKeys", referenceTo);
                    window.DataCache.setData("qae_Keyprefix", keyPrefix);                                         
                }
            }),
            $A.getCallback(function(result){
            })
        )
        // End describe 
        console.log('Exit schema describe');
    },
    sendToVF : function(component, event, helper, redirectValue, redirectAction){
        /*
        window.postMessage() is a standard web API that is not aware of the Lightning and Locker service namespace isolation level. 
        As a result, there is no way to send a message to a specific namespace or to check which namespace a message is coming from. 
        Therefore, messages sent using postMessage() should be limited to non sensitive data and should not include sensitive data such as user data or cryptographic secrets. 
        For more information see:
        https://developer.salesforce.com/blogs/developer-relations/2017/01/lightning-visualforce-communication.html
        */
        var vfOrigin = "https://" + component.get("v.vfHost");
        var vfHost = component.get("v.vfHost");
        var selectedRecords = component.get("v.selectedRecords");
        if(vfHost !== undefined){
            var message = {"action" : component.get("v.action"), "redirectValue" : redirectValue, "data" : component.get("v.record"), "redirectAction" : redirectAction, "quickActionType" : component.get("v.quickAction").type, "selectedRecordsLength" : selectedRecords.length};
			window.postMessage(JSON.stringify(message), vfOrigin);      
            if(selectedRecords.length > 0){
                var newSelectedRecords = selectedRecords.slice(1);
                if(newSelectedRecords.length > 0){
                    component.set("v.recordId", newSelectedRecords[0].Id);
                } else {
                    component.set("v.showNext", false);
                }
                component.set("v.selectedRecords", newSelectedRecords);
                helper.initialize(component, event, helper);
            }
        } else {
            helper.saveRecord(component, event, helper, redirectAction);
        }
    },
    saveRecord : function(component, event, helper, action){
        var quickAction = component.get("v.quickAction");
        var record = component.get("v.record");
        var recordId = component.get("v.recordId");
        var saveRecordAction = component.get("c.saveThisRecordLightning");
        saveRecordAction.setParams({"obj" : quickAction.targetSobjectType, "sobj" : JSON.stringify(record), "quickActionType" : quickAction.type, "redirectValue" : recordId});
        var saveRecordActionPromise = helper.executeAction(component, saveRecordAction);
        var redirectAction = component.get("v.redirectAction");
        var resultRecord = '';
        var type = '';
        var errorMsg = '';
        var vfHost = component.get("v.vfHost");
        saveRecordActionPromise.then(
            $A.getCallback(function(result){
                console.log('Saved result');
                console.log(result);
                console.log(JSON.parse(result));
                var res = JSON.parse(result);
                if(res.hasOwnProperty("saveResult") && res.saveResult !== null){
                    resultRecord = res.saveResult[0].id;
                    type = 'success';
                    var selectedRecords = component.get("v.selectedRecords");
                    if(selectedRecords.length > 0){
                        var newSelectedRecords = selectedRecords.slice(1);
                        if(newSelectedRecords.length > 0){
                            component.set("v.recordId", newSelectedRecords[0].Id);
                        } else {
                            component.set("v.showNext", false);
                        }
                        component.set("v.selectedRecords", newSelectedRecords);
                        helper.initialize(component, event, helper);
                    } else if(redirectAction === "child" && action === "save"){
                         helper.navigateToRecord(component, event, helper, resultRecord);
                    }
                }
                if(res.hasOwnProperty("errorMsg") && res.errorMsg !== null){
                    type = 'error';
                    errorMsg = res.errorMsg;
                }
                var baseUrlAction = component.get("c.getBaseURL");
                var baseUrlActionPromise = helper.executeAction(component, baseUrlAction);
                return baseUrlActionPromise;
            }),
            $A.getCallback(function(error){
                console.warn(error);
            })
        ).then(
            $A.getCallback(function(result){
                if(vfHost === undefined){
                    helper.toast(component, event, helper, resultRecord, result, type, errorMsg);
                }
            }),
            $A.getCallback(function(error){
                console.warn(error);
            })
        )
    },
    toast : function(component, event, helper, recordId, baseUrl, type, errorMsg){
        var toastEvent = $A.get("e.force:showToast");
        var objectLabel = component.get("v.objectLabel");
        var created = $A.get("$Label.c.qae_RecordCreated");
        if(type === 'success'){
            toastEvent.setParams({
                mode: 'dismissible',
                message: created,
                messageTemplate: created,
                type : type,
                messageTemplateData: [{
                    url: baseUrl + '/' + recordId,
                    label: objectLabel
                }]
            });
        } else {
            toastEvent.setParams({
                mode: 'dismissible',
                message: errorMsg,
                messageTemplate: errorMsg,
                type : type
            });
        }
       
        toastEvent.fire();
        $A.get('e.force:refreshView').fire();
    },
    parseDefaultValues : function(component, helper, quickAction, thisRecord){
        var relatedField = component.get("v.relatedField");
        var relatedId = component.get("v.relatedId");
        
        // Note: The default values URL could be used directly from the quick action but in order to avoid a vulnerability where a callout is made
        // directly from a string that has not been sanitized is not good practice for lightning components.
        var parseDefaultValues = component.get("c.describeDefaultValues");
        parseDefaultValues.setParams({"obj" : quickAction.targetSobjectType, "action" : quickAction.name.replace(quickAction.targetSobjectType + ".", ""), "isGlobal" : (quickAction.name.indexOf(".") > 0 ? false : true)});
        var parseDefaultValuesPromise = helper.executeAction(component, parseDefaultValues);
        var defaultValues;
        if(thisRecord === null){
           thisRecord = component.get("v.record");
        }
        parseDefaultValuesPromise.then(
            $A.getCallback(function(result){
                console.log('Start parse default values');
                defaultValues = JSON.parse(result);
                console.log("defaultValues", defaultValues, "thisRecord", thisRecord);

                for(var i = 0; i < quickAction.layout.layoutRows.length; i++){
                    var layoutRow = quickAction.layout.layoutRows[i];
                    for(var c = 0; c < layoutRow.layoutItems.length; c++){
                        var layoutItem = layoutRow.layoutItems[c];
                        for(var q = 0; q < layoutItem.layoutComponents.length; q++){
                            var cmp = layoutItem.layoutComponents[q];
                            if(defaultValues.hasOwnProperty(cmp.value)){
                                var value = (thisRecord[cmp.details.name] == undefined ? defaultValues[cmp.value] : thisRecord[cmp.details.name]);
                                console.log(value);
                                if(cmp.details.type ==='reference'){
                                    if(cmp.details.name === relatedField){
                                        cmp.details.value = relatedId;
                                        thisRecord[cmp.details.name] = relatedId;
                                    } else{
                                        cmp.details.value = value;
                                        thisRecord[cmp.details.name] = value;
                                    }
                                } else if(cmp.details.type === 'boolean'){
                                    console.log(defaultValues[cmp.value]);
                                    cmp.details.value = value;  
                                    thisRecord[cmp.details.name] = value;
                                } else {
                                    cmp.details.value = value;  
                                    thisRecord[cmp.details.name] = value;
                                }
                            } 
                        }
                    }
                }
                component.set("v.record", thisRecord);
                component.set("v.loading", false);
                component.set("v.quickAction", quickAction);
                console.log('Exit parse default values');
            }),
            $A.getCallback(function(error){
                console.warn(error);
            })
        )
    },
    getIcons : function(component, helper){
        console.log('Enter get icons');
        var iconDescribe = component.get("c.describeIcons");
        var iconDescribePromise = helper.executeAction(component, iconDescribe);
        iconDescribePromise.then(
            $A.getCallback(function(result){
                if(result !== undefined){
                    var iconDescribeResult = JSON.parse(result);
                    console.log("iconResult", iconDescribeResult);
                    var finalResult = {};
                    for(var c = 0; c < iconDescribeResult.themeItems.length; c++){
                        var found = false;
                        // Skip looping if it's a history, feed or share table
                        if(iconDescribeResult.themeItems[c].name.endsWith("History") ||
                           iconDescribeResult.themeItems[c].name.endsWith("Feed") ||
                           iconDescribeResult.themeItems[c].name.endsWith("Share")){
                            continue;
                        }
                        
                        // Get the icon
                        for(var i = 0; i < iconDescribeResult.themeItems[c].icons.length; i ++){
                            if(iconDescribeResult.themeItems[c].icons[i].theme === "theme4" && iconDescribeResult.themeItems[c].icons[i].contentType === "image/svg+xml"){
                                finalResult[iconDescribeResult.themeItems[c].name] = {icon : iconDescribeResult.themeItems[c].icons[i]};
                                found = true;
                                break;
                            }
                        }
                        
                        // Go to the next record.  We don't want to show this if its not a LEX enabled object
                        if(!found){
                            continue;
                        }
                        
                        // Get the color for the icon
                        for(var i = 0; i < iconDescribeResult.themeItems[c].colors.length; i ++){
                            if(iconDescribeResult.themeItems[c].colors[i].theme === "theme4"){
                                finalResult[iconDescribeResult.themeItems[c].name].color = iconDescribeResult.themeItems[c].colors[i];
                                break;
                            }
                        }
                    }
                    console.log("Final parsed icon list", finalResult);
                    window.DataCache.setData("qae_icons", finalResult);
                }
            }),
            $A.getCallback(function(result){
            })
        )
        console.log('Exit get icons');
    },
    createComponent : function(component, helper, quickAction){
        $A.createComponent(
            quickAction.lightningComponentQualifiedName,
            {},
            function(newComponent, status, errorMessage){
                //Add the new button to the body array
                if (status === "SUCCESS") {
                    var lightningComponent = component.get("v.lightningComponent");
                    lightningComponent.push(newComponent);
                    component.set("v.lightningComponent", lightningComponent);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                    // Show offline error
                }
                else if (status === "ERROR") {
                    console.warn("Error: " + errorMessage);
                    // Show error message
                }
            }
       )
    },
    queryRelatedRecords : function(component, event, helper, quickAction, objectDescribe){
		console.log('query related records');        
        var queryRelatedRecordAction = component.get("c.retrieveRelatedRecords");
        queryRelatedRecordAction.setParams({"searchValue" : component.get("v.relatedId"), "obj" : quickAction.targetSobjectType, "relatedField" : component.get("v.relatedField"), "fieldList" : component.get("v.fields")});
        var queryRelatedRecordActionPromise = helper.executeAction(component, queryRelatedRecordAction);
		queryRelatedRecordActionPromise.then(
            $A.getCallback(function(result){
                var res = JSON.parse(result);
                console.log(res);
                var fields = component.get("v.fields").split(",");
                var columns = [];
                fields.forEach(function(key){
                    console.log(key);
                    var thisField = objectDescribe.fields[key];
                    if(thisField !== undefined){
                        var fieldType = '';
                        if(thisField.fieldType === "DATETIME"){
                            fieldType ='datetime';
                        } else if(thisField.fieldType === "DATE"){
                            fieldType = 'date';
                        } else if(thisField.fieldType === "CURRENCY"){
                            fieldType = 'currency';
                        } else if(thisField.fieldType === "INTEGER" || thisField.fieldType === "DECIMAL"){
                            fieldType = 'decimal';
                        } else if(thisField.fieldType === "EMAIL"){
                            fieldType = 'email';
                        } else if(thisField.fieldType === "PHONE"){
                            fieldType = 'phone';
                        } else if(thisField.fieldType === "URL"){
                            fieldType = 'url';
                        } else {
                            fieldType = 'text';
                        }
                        columns.push({"label" : thisField.label, "fieldName" : key, "type" : fieldType});
                    }
                });
                component.set("v.columns", columns);
                component.set("v.records", res.result);
                component.set("v.loading", false);
            }),
            $A.getCallback(function(error){
                console.warn(error);
            })
        )
    },
    validate : function(component, event, helper){
        var record = component.get("v.record");
        var requiredFields = component.get("v.requiredFields");
        console.log("requiredFields", requiredFields);
        var hasError = false;
        Object.keys(record).forEach(function(key){
            if(requiredFields.indexOf(key) !== -1 && record[key] === null){
                hasError = true;
            }
        });
        var items = component.find("item");
        items.forEach(function(item){
           item.checkValidity(); 
        });
        console.log("hasError", hasError);
		component.set("v.hasError", hasError);
        return hasError;
    }
})