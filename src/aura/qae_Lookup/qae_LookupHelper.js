({
    search: function(component, helper, searchTerm){
        console.log("--- Begin search ---");
        var searchController = component.get("c.performSearch");
        var objectToSearch = component.get("v.selectedObject");
        var fieldsToGet = component.get("v.primaryField");
        var multiObjects = component.get("v.multiObjects");
        var objectNameWithWhereClause = null;
        var secondaryFields = component.get("v.secondaryFields");
        var whereClause = null;
        if(multiObjects === null){
            if(secondaryFields !== undefined && secondaryFields !== null){
                fieldsToGet += "," + secondaryFields;
            }
            if(objectToSearch === "Lead"){
                whereClause = " IsConverted = false";
            }
        } else if(multiObjects.hasOwnProperty(objectToSearch) && multiObjects[objectToSearch].hasOwnProperty("primaryField")){
            var thisObj = multiObjects[objectToSearch];
            if(secondaryFields !== undefined && secondaryFields !== null && secondaryFields !== ""){
                fieldsToGet += "," + secondaryFields;
            }
            
            if(objectToSearch === "Lead"){
                whereClause = " IsConverted = false";
            }
        } else{
            multiObjects[objectToSearch]["primaryField"] = "Name";
            fieldsToGet = "Name";
            component.set("v.primaryField", "Name");
            console.log(fieldsToGet);
        }
        fieldsToGet += "," + "Id";
        var searchSize = component.get("v.searchSize");
        searchController.setParams({"searchString":searchTerm, "sobjectType" : objectToSearch, "returningFields" : fieldsToGet,  "whereClause" : whereClause, "limitClause" : searchSize});
        var searchPromise = helper.executeAction(component, searchController);
        searchPromise.then(
            $A.getCallback(function(result){
                var searchTerm = component.get("v.searchTerm");
                if(searchTerm.length > 2){
                    var res; 
                    console.log(result);
                    if(result !== undefined){
                        res = JSON.parse(result);
                        if(res[0] !== undefined){
                            console.log(res[0]);
                            var primaryField = component.get("v.primaryField");
                            var secondaryFields = component.get("v.secondaryFields");
                            var secondaryFieldList = [];
                            if(secondaryFields !== undefined && secondaryFields !== null && secondaryFields !== ""){
                            	secondaryFieldList = secondaryFields.replace(" ", "").split(",");  
                            }
                            var finalResultList = [];
                            
                            res.forEach(function(key){
                                var secondaryValueList = [];
                                var finalResult = {};
                                console.log(key);
                                finalResult.id = key.Id;
                                finalResult.primaryField = key[primaryField];                                
                                console.log("Primary field", primaryField, key[primaryField]);
                                console.log("secondaryFieldList", secondaryFieldList);
                                for(var i =0; i < secondaryFieldList.length; i++){
                                    console.log(secondaryFieldList[i], key.hasOwnProperty(secondaryFieldList[i]));
                                    if(secondaryFieldList[i].indexOf(".") > -1){
										var splitList = secondaryFieldList[i].split(".");
                                        console.log(splitList);
                                        var keyVal = key;
                                        splitList.forEach(function(val, index){
                                            console.log("Inside splitList function",val, keyVal.hasOwnProperty(val), index === (splitList.length-1));
                                            if(keyVal !== undefined && keyVal.hasOwnProperty(val)){
                                                keyVal = keyVal[val];
                                            } else{
                                                keyVal = {};
                                            }
                                            if(keyVal !== undefined && index === (splitList.length-1)){
                                                secondaryValueList.push(keyVal);
                                            }
                                        });
                                    } else if(key.hasOwnProperty(secondaryFieldList[i])){
                                        secondaryValueList.push(key[secondaryFieldList[i]]);
                                    }
                                }
                                console.log("secordaryFields and values", secondaryFields, secondaryValueList);
                                if(secondaryValueList.length > 0){
                                    finalResult.secondaryFields = secondaryValueList.join(" • ");
                                }
                                
                                finalResultList.push(finalResult);                         
                                console.log("finalResult", finalResult);
                            });
                            console.log("searchResults", finalResultList);
                            component.set("v.searchResults", finalResultList);
                            if(finalResultList.length === 0){
                                component.set("v.searchNoResults", true); 
                            }
                            component.set("v.isOpen", true);
                        } else{
                            component.set("v.searchNoResults", true);
                            component.set("v.searchResults", []); 
                            component.set("v.isOpen", true);
                        }
                    } else{
                        component.set("v.searchNoResults", true);
                        component.set("v.searchResults", []);
                        component.set("v.isOpen", true);
                    }
                }
            }),
            $A.getCallback(function(error){
                console.log(error);
            })
        )
    },
    setSelectedObject : function(component, selectedObject, helper) {
        var searchLayout = window.DataCache.getData("qae_SearchLayout-" + selectedObject);
        if(!searchLayout){
            var searchLayoutRetrieve = component.get("c.retrieveSearchLayout");
            searchLayoutRetrieve.setParams({"sobjectType" : selectedObject});
            var searchLayoutRetrievePromise = helper.executeAction(component, searchLayoutRetrieve); 
            searchLayoutRetrievePromise.then(
                $A.getCallback(function(result){
                    var res;
                    res = JSON.parse(result);
                    console.log(res);
                    component.set("v.primaryField", res[0].searchColumns[0].name);
                    var secondaryFields = "";
                    if(res[0].searchColumns[1] !== undefined){
                       secondaryFields = res[0].searchColumns[1].name; 
                    }
                    if(res[0].searchColumns[2] !== undefined){
                       secondaryFields += "," + res[0].searchColumns[2].name; 
                    }
                    console.log('secondaryFields', secondaryFields);
                    component.set("v.secondaryFields", secondaryFields);
                    window.DataCache.setData("qae_SearchLayout-" + selectedObject, res);
                }),
                $A.getCallback(function(error){
                    
                })
                
            )
        } else {
            component.set("v.primaryField", searchLayout[0].searchColumns[0].name);
            var secondaryFields = "";
            if(searchLayout[0].searchColumns[1] !== undefined){
                secondaryFields = searchLayout[0].searchColumns[1].name; 
            }
            if(searchLayout[0].searchColumns[2] !== undefined){
                secondaryFields += "," + searchLayout[0].searchColumns[2].name; 
            }
            console.log('secondaryFields', secondaryFields);
            component.set("v.secondaryFields", secondaryFields);
        }
        
        var multiObjects = component.get("v.multiObjects");
        if(multiObjects !== null && multiObjects.hasOwnProperty(selectedObject)){
            component.set("v.selectedIcon", multiObjects[selectedObject]);
        }
        
    },
    handleUpdateRecord :function(component, field, value, id){
        var updateRecord = component.getEvent("updateRecord");
        updateRecord.setParams({"values" : {[field] : value}, "id" : id});
        updateRecord.fire();
    },
})