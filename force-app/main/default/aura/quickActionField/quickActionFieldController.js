({
    doInit : function(component, event, helper){
        var quickAction = component.get("v.quickActionField");
        var quickActionObjectType = component.get("v.quickActionObjectType");
        
        if(quickAction.layoutComponents[0].details.type === "boolean"){
            component.set("v.options", [{"label" : "True", "value" : "true"}, {"label" : "False", "value" : "false"}]);
        }
        //console.log(quickAction.layoutComponents[0].details.name);
        if(quickAction.layoutComponents[0].details.name === 'IsReminderSet' && quickActionObjectType === 'Task'){
            helper.setReminderDate(component, helper);
        }
        if(quickAction.layoutComponents[0].details.type === "reference"){
            helper.setIcons(component, helper);
        }
        if(quickAction.layoutComponents[0].details.type === "reference" && 
           quickAction.layoutComponents[0].details.value !== undefined && 
           quickAction.layoutComponents[0].details.value !== null){
            helper.setSearchLabel(component, helper);
        }
        
        if(quickAction.layoutComponents[0].components !== undefined){
            if(quickAction.layoutComponents[0].fieldType === 'address'){
                var countries = {};
                var countriesValueMap = {};
                quickAction.layoutComponents[0].components[4].details.picklistValues.forEach(function(country, index){
                    countries[country.label] = {'label' : country.label, 'value' : country.value, 'dependentValues' : []};
                    countriesValueMap[country.value] = {'label' : country.label, 'value' : country.value, 'dependentValues' : []};
                });
                var countriesList = Object.keys(countries);
                quickAction.layoutComponents[0].components[2].details.picklistValues.forEach(function(stateCode){
                    var validForDec = helper.decode(stateCode.validFor);
                    for (var i = 0; i < countriesList.length; i++) {
                        if(helper.testBit(validForDec, i)){
                            countries[countriesList[i]].dependentValues.push({'label' : stateCode.label, 'value': stateCode.value});
                            countriesValueMap[countries[countriesList[i]].value].dependentValues.push({'label' : stateCode.label, 'value': stateCode.value});
                            break;
                        }
                    }
                });
                //console.log(countries);
                var finalCountries = [];
                var provinceOptions = [];
                countriesList.forEach(function(country, index){
                    if(index=== 1 && countries[country].dependentValues.length > 0){
                        provinceOptions = countries[country].dependentValues;
                    }
                    finalCountries.push({'label': country, 'value' : countries[country].value});
                });
                helper.setCachedData("countriesValueMap", countriesValueMap);
                component.set("v.countryOptions", finalCountries);
                component.set("v.provinceOptions", provinceOptions);
            } else{
                var fieldsToDisplay = [];
                quickAction.layoutComponents[0].components.forEach(function(key){
                    fieldsToDisplay.push(key.value);
                });
                component.set("v.fieldsToDisplay", fieldsToDisplay);
            }
        }
    },
    checkRequired: function(component, event, helper){
        var quickAction = component.get("v.quickActionField");
        helper.checkRichText(component, quickAction);
    },
    setReminderTime : function(component, event, helper){
        var quickAction = component.get("v.quickActionField");
        var time = component.find("ReminderDateTime");      
        //console.log(time.get("v.value"));
        quickAction.layoutComponents[0].details.reminderDateTime = time.get("v.value");
        helper.handleUpdateRecord(component, "ReminderDateTime", time.get("v.value"), null);
        component.set("v.quickActionField", quickAction);
    },
    handleChangedField : function(component, event, helper){
        var quickAction = component.get("v.quickActionField");
        if(quickAction.layoutComponents[0].components !== undefined){
            var values = {}
            quickAction.layoutComponents[0].components.forEach(function(key){
                values[key.details.name] = key.details.value;
            });
            helper.handleUpdateRecord(component, values, null);
        } else{
            var values = {};
            values[quickAction.layoutComponents[0].details.name] = quickAction.layoutComponents[0].details.value;
            helper.handleUpdateRecord(component, values, null);
        }
    },
    updateProvinces: function(component, event, helper) {
        var countriesValueMap= helper.getCachedData("countriesValueMap");
        var quickAction = component.get("v.quickActionField");
        if(countriesValueMap && quickAction.layoutComponents[0].components !== undefined && quickAction.layoutComponents[0].components[4].details.value !== undefined && countriesValueMap[quickAction.layoutComponents[0].components[4].details.value]){
            component.set("v.provinceOptions", countriesValueMap[quickAction.layoutComponents[0].components[4].details.value].dependentValues); 
        } else {
            component.set("v.provinceOptions", []);
        }
    },
    checkValidity : function(component, event, helper){
        var quickAction = component.get("v.quickActionField");
        var field = component.find("field");
        var requiredFields = component.get("v.requiredFields");
        var error = $A.get("$Label.c.qae_hasError");
        if(requiredFields !== undefined && requiredFields.length > 0){
            if(quickAction.layoutComponents[0].details.type !== undefined && quickAction.layoutComponents[0].details.type == 'reference'){
                //console.log('reference');
                if(requiredFields.indexOf(quickAction.layoutComponents[0].details.name) > -1 && (quickAction.layoutComponents[0].details.value === undefined || quickAction.layoutComponents[0].details.value === null)){
                    field.set("v.showError", true);
                } else {
                    field.set("v.showError", false);
                }
            } else if(quickAction.layoutComponents[0].components !== undefined){
                field.checkValidity();
            } else if(quickAction.layoutComponents[0].details.extraTypeInfo === 'richtextarea') {
                //console.log(quickAction.layoutComponents[0].details.extraTypeInfo);
                helper.checkRichText(component, quickAction);
            } else if(quickAction.layoutComponents[0].details.type === 'picklist' || quickAction.layoutComponents[0].details.extraTypeInfo === 'textarea'){
                field.checkValidity();
            } else {
                if(requiredFields.indexOf(quickAction.layoutComponents[0].details.name) > -1 && (quickAction.layoutComponents[0].details.value === undefined || quickAction.layoutComponents[0].details.value === null)){
                    field.setCustomValidity(error);
                } else {
                    field.setCustomValidity("");
                }
                field.reportValidity();
            }
        }
    }
})