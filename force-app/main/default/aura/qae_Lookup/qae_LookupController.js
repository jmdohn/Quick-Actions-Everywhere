({
	doSearch : function(component, event, helper) {
        component.set("v.searchNoResults", false);
		var searchTerm = event.currentTarget.value;
        if(searchTerm !== undefined){
            component.set("v.searchTerm", searchTerm);
            //console.log(searchTerm);
            if(searchTerm.length > 2){
                helper.search(component, helper, searchTerm); 
            } else{
                component.set("v.searchResults", []);
                component.set("v.isOpen", false);
            }
        }
    },
    setSelected : function(component, event, helper){
        var currentTarget = event.currentTarget;
        //console.log(currentTarget.id);
        if(currentTarget.id !== undefined){
            component.set("v.selectedId", currentTarget.id);
            var ele = document.getElementById(currentTarget.id);
            if(ele.getAttribute("data-name") !== undefined){
                component.set("v.selectedName", ele.getAttribute("data-name"));
            }
            helper.handleUpdateRecord(component, component.get("v.field"), currentTarget.id, null);
            component.set("v.showError", false);
        }
        component.set("v.searchResults", []);
        component.set("v.isOpen", false);
        
    },
    multiObjectChange : function(component, event, helper) {
		var selectedObject = component.get("v.selectedObject");
        //console.log(selectedObject);
        if(selectedObject !== undefined && selectedObject !== null){
           helper.setSelectedObject(component, selectedObject, helper);
        }
	},
    multiObjectOpen : function(component, event, helper){
        var multiObjectOpen = component.get("v.multiObjectOpen");
        if(multiObjectOpen === true){
            component.set("v.searchResults", []);
            component.set("v.isOpen", false); 
        }
    },
    removePill : function(component, event, helper){
        component.set("v.selectedId", null);
        component.set("v.selectedName", null);
        component.set("v.searchResults", []);
        component.set("v.isOpen", false);
        helper.handleUpdateRecord(component, component.get("v.field"), null, null);
    },
    checkRequired : function(component, event, helper){
        var required = component.get("v.required");
        var selectedId = component.get("v.selectedId");
        if(required && (selectedId === undefined || selectedId === null)){
            component.set("v.showError", true);
        }
    }
})