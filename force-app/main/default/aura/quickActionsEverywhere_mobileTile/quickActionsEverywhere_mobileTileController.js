({
	doInit : function(component, event, helper) {
		var columns = component.get("v.columns");
        var record = component.get("v.record");
        var outputBody = '<div class="slds-grid slds-grid_vertical">';
        columns.forEach(function(key){
            outputBody += '<div class="slds-col">';
            if(record.hasOwnProperty(key.fieldName)){
                outputBody += key.label + ': ' + record[key.fieldName];
            } else {
                outputBody += key.label + ': ';
            }
            outputBody += "</div>";
        });
        outputBody += "</div>";
        component.set("v.outputBody", outputBody);
	},
    toggleSelected : function(component, event, helper){
        var selected = component.get("v.selected");
        var record = component.get("v.record");
        var changeSelection = component.getEvent("changeSelection");
        changeSelection.setParams({"selected": !selected, "id" : record.Id, "values" : record});
        changeSelection.fire();
        component.set("v.selected", !selected);
    }
})