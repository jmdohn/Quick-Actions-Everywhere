({
    setReminderDate : function(component, helper){
        var quickActionObjectType = component.get("v.quickActionObjectType");
        var quickAction = component.get("v.quickActionField");
        var userPreferences = component.get("c.retrieveUserTaskPreferences");
        userPreferences.setParams({"preferenceType" : quickActionObjectType});
        console.log("preferenceType" )
        var userPreferencesPromise = helper.executeAction(component, userPreferences);
        userPreferencesPromise.then(
            $A.getCallback(function(result){
                if(result != undefined){
                    var userPreferenceResult = JSON.parse(result);
                    console.log('userPreferenceResult ', userPreferenceResult);
                    if(userPreferenceResult.result !== undefined && userPreferenceResult.result[0] !== undefined){
                        var today = new Date();
                        if(quickActionObjectType === "Task"){
                            var time = userPreferenceResult.result[0].Value / 60;
                            // clean the date
                            var cleanDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), Math.floor(time), (time % 1)*60, 0, 0);
                            console.log("before change", cleanDate);
                            // Check if it's less than today
                            if(cleanDate < today){
                                cleanDate.setDate(today.getDate() + 1);
                            }
                            quickAction.layoutComponents[0].details.reminderDateTime = cleanDate.toISOString();
                            console.log("after change", cleanDate.toISOString());
                            component.set("v.quickActionField", quickAction);
                        } 
                    }  
                }
            }),
            $A.getCallback(function(error){
                console.warn(error);
            })
        )
    },
    setSearchLabel : function(component, helper){
        var quickAction = component.get("v.quickActionField");
        var quickActionObjectType = component.get("v.quickActionObjectType");
        console.log("Begin search for field label", quickAction.layoutComponents[0].details.name, quickAction.layoutComponents[0].details.value);
        if(!quickAction.layoutComponents[0].details.hasOwnProperty("searchReferenceTo")){
            if(quickAction.layoutComponents[0].details.name === "OwnerId" &&  quickActionObjectType === "Event"){  // If this isn't set to user, then an error will occur, since calendars are not searchable
               quickAction.layoutComponents[0].details.searchReferenceTo = "User";
            } else{
               quickAction.layoutComponents[0].details.searchReferenceTo = quickAction.layoutComponents[0].details.referenceTo[0]; 
            }
        }
        
        var searchRecords = component.get("c.retrieveThisRecordValues");
        searchRecords.setParams({"obj" : quickAction.layoutComponents[0].details.searchReferenceTo, "searchValue" : quickAction.layoutComponents[0].details.value});
        var searchRecordsPromise = helper.executeAction(component, searchRecords);
        searchRecordsPromise.then(
            $A.getCallback(function(result){
                if(result != undefined){
                    var searchResult = JSON.parse(result);
                    if(searchResult.result !== undefined && searchResult.result[0] !== undefined){
                        quickAction.layoutComponents[0].details.searchLabel = searchResult.result[0].Name;
                    }
                    component.set("v.quickActionField", quickAction);
                }
            }),
            $A.getCallback(function(error){
                console.warn(error);
            })
        )
    },
    setIcons : function(component, helper){
        var quickAction = component.get("v.quickActionField");
        var icons = window.DataCache.getData("qae_icons");
        var objectKeys = window.DataCache.getData("qae_objectKeys");
        var keyPrefix = window.DataCache.getData("qae_Keyprefix");
        var multiObjects = {};
        if(quickAction.layoutComponents[0].details.hasOwnProperty("referenceTo")){
            var iconFound = false;
            quickAction.layoutComponents[0].details.referenceTo.forEach(function(key){
                console.log('SearchReferenceTo', key); 
                if(icons.hasOwnProperty(key)){
                    console.log(icons[key]);
                    var currIcon = icons[key];
                    if(quickAction.layoutComponents[0].details.hasOwnProperty("value") && quickAction.layoutComponents[0].details.value !== null){
                        var objPrefix = quickAction.layoutComponents[0].details.value.substring(0, 3);
                        if(keyPrefix.hasOwnProperty(objPrefix) && keyPrefix[objPrefix].object === key){
                            var icon = {'iconcolor' : currIcon.color.color, 'iconurl' : currIcon.icon.url};
                            component.set("v.selectedIcon", icon);
                            component.set("v.selectedObject", keyPrefix[objPrefix].object);
                            component.set("v.selectedObjectLabel", objectKeys[key].label);
                            iconFound = true;
                        }
                    }
                    multiObjects[key] = {'iconcolor' : currIcon.color.color, 'iconurl' : currIcon.icon.url, 'label' : objectKeys[key].label};
                }
            });
            if(!iconFound){
                var firstObject = Object.keys(multiObjects)[0];
                component.set("v.selectedIcon", multiObjects[firstObject]);
                component.set("v.selectedObject", firstObject);
                component.set("v.selectedObjectLabel", multiObjects[firstObject].label);
            }
            if(Object.keys(multiObjects).length>1){
                console.log("multiObjects", multiObjects);
                component.set("v.multiObjects", multiObjects); 
            }
        }
    },
    handleUpdateRecord :function(component, values, id){
        var updateRecord = component.getEvent("updateRecord");
       	updateRecord.setParams({"values" : values, "id" : id});
        updateRecord.fire();
    },
    testBit : function(validFor, pos) {
		var byteToCheck = Math.floor(pos/8);
		var bit = 7 - (pos % 8);
		return ((Math.pow(2, bit) & validFor.charCodeAt(byteToCheck)) >> bit) == 1;
	},
    decode : function (input) {
		var base64Str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = [];
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;
        do {
            enc1 = base64Str.indexOf(input.charAt(i++));
            enc2 = base64Str.indexOf(input.charAt(i++));
            enc3 = base64Str.indexOf(input.charAt(i++));
            enc4 = base64Str.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output.push(String.fromCharCode(chr1));
            if (enc3 != 64) {
                output.push(String.fromCharCode(chr2));
            }
            if (enc4 != 64) {
                output.push(String.fromCharCode(chr3));
            }
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);
        return output.join("");
	},
    checkRichText : function(component, quickAction){
        var value = quickAction.layoutComponents[0].details.value;
        console.log(quickAction.layoutComponents[0].details.value);
        if(quickAction.required && (value  === undefined || value  === null || value  === "" )){
            component.set("v.valid", false);
        } else{
            component.set("v.valid", true);
        }
    }
})