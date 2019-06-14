({
	setSelectedObject : function(component, selectedObject) {
        var multiObjects = component.get("v.multiObjects");
        var selectedIcon;
        if(multiObjects.hasOwnProperty(selectedObject)){
			selectedIcon = multiObjects[selectedObject];            
        }

        if(selectedIcon !== undefined){
            component.set("v.selectedIcon", selectedIcon);
        }
	},
    setMultiObjectList : function(component){
        var multiObjects = component.get("v.multiObjects");
        var multiObjectsList = [];
        Object.keys(multiObjects).forEach(function(key){
            var thisVal = {};
            thisVal.sobject = key;   
            if(!multiObjects[key].hasOwnProperty("primaryField")){
                multiObjects[key]["primaryField"] = "Name";
            }
            Object.keys(multiObjects[key]).forEach(function(val){
               thisVal[val] =  multiObjects[key][val];
            });
            multiObjectsList.push(thisVal);
        });
        //console.log(multiObjectsList);
        component.set("v.multiObjectsList", multiObjectsList);
    }
})