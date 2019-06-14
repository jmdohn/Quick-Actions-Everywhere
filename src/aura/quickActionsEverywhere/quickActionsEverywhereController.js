({
	doInit : function(component, event, helper) {
        helper.initialize(component, event, helper);        
	},
    handleSave : function(component, event, helper) {
        var hasError = helper.validate(component, event, helper);
        if(!hasError){
            helper.sendToVF(component, event, helper, component.get("v.redirectAction"), "save");
        }
    },
    handleSaveAndNew : function(component, event, helper) {
        var hasError = helper.validate(component, event, helper);
        if(!hasError){
          helper.sendToVF(component, event, helper, null, "saveAndNew");  
        }
    },
    handleCancel : function(component, event, helper) {
        helper.sendToVF(component, event, helper, component.get("v.relatedId"), "cancel");
    },
    handleNext : function(component, event, helper){
        var selectedRecords = component.get("v.selectedRecords");
        if(selectedRecords.length > 0){
            component.set("v.recordId", selectedRecords[0].Id);
            component.set("v.showNext", true);
            console.log(selectedRecords[0].Id);
            helper.initialize(component, event, helper);
        } else {
            var vfOrigin = "https://" + component.get("v.vfHost");
            var vfHost = component.get("v.vfHost");
            if(vfHost !== undefined){
                var message = {"showSelectRecordError" : true};
                window.postMessage(JSON.stringify(message), vfOrigin);
            } else{
              helper.toast(component, event, helper, null, null, 'error', $A.get("$Label.c.qae_selectOneRecord"));  
            }
        }
    },
    updateSelection : function(component, event, helper){
        component.set("v.selectedRecords", event.getParam("selectedRows"));
    },
    flowStatusChange : function(component, event, helper){
        var outputVariables = event.getParam("outputVariables");
        component.set("v.action", "flow");
        console.log(outputVariables);
        var redirectVariable = "";
        for(var i = 0; i < outputVariables.length; i++) {
            if(outputVariables[i].name === "recordId") {
                console.log(outputVariables[i]);
                redirectVariable = outputVariables[i].value;
                break;
            }
        }
        if(event.getParam("status") === "FINISHED"){
            helper.sendToVF(component, event, helper, redirectVariable);
        }
    },
    handleUpdateEvent : function(component, event, helper){
        var id = event.getParam("id");
        var values = event.getParam("values");
        var record = component.get("v.record");
        var quickAction = component.get("v.quickAction");
        
        Object.keys(values).forEach(function(key){
            record[key] = (values[key] === undefined ? null : values[key]);
        });
        
        console.log(JSON.stringify(record));
        component.set("v.record", record);
    },
    changeSelection : function(component, event, helper){
        var id = event.getParam("id");
        var values = event.getParam("values");
        var selectedRecords = component.get("v.selectedRecords");
        var selected = event.getParam("selected");
        console.log(selected);
        if(selected){
            selectedRecords.push(values);
        } else{
            selectedRecords.remove(values);
        }
        console.log(id);
        console.log(JSON.stringify(selectedRecords));
        component.set("v.selectedRecords", selectedRecords);
    }
})