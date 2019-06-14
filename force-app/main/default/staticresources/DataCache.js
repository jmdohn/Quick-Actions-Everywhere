window.DataCache = (function() {

    var cache = {};

	return {
        setData: function(name, data) {
    	   cache[name] = data;				
        },
        
        getData: function(name) {
    	   return cache[name];				
        }
	};

}());