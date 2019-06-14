({
    executeAction : function(component, action, callback) {
        return new Promise(function(resolve, reject){
            action.setCallback(this, function(response){
                var state = response.getState();
                if(component.isValid() && state === "SUCCESS"){
                    var retVal = response.getReturnValue();
                    resolve(retVal);
                } else if (component.isValid && state === "ERROR"){
                    var errors = response.getError();
                    if(errors){
                        if(errors[0] && errors[0].message){
                            reject(Error("Error:" + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    getCachedData : function(name){
        return window.DataCache[name];	
    },
    setCachedData : function(name, data){
        window.DataCache[name] = data;
    },
    navigateToRecord : function(component, event, helper, id){
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": id
        });
        navEvt.fire();
    }
})