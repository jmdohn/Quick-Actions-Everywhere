({
	doInit : function(component, event, helper) {
		var selectedObject = component.get("v.selectedObject");
        helper.setSelectedObject(component, selectedObject);
        helper.setMultiObjectList(component);
        
	},
    setSelected : function(component, event, helper){
        console.log('Selected Object => ' + event.currentTarget.id);
        var selectedObject = event.currentTarget.id;
        component.set("v.selectedObject", selectedObject);
        helper.setSelectedObject(component, selectedObject);
        component.set("v.isOpen", !component.get("v.isOpen"));
    },
    toggleDropdown : function(component, event, helper){
        component.set("v.isOpen", !component.get("v.isOpen"));
    }
})