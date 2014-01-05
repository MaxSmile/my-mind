MM.Backend.Firebase = Object.create(MM.Backend, {
	label: {value: "Firebase"},
	id: {value: "firebase"},
	ref: {value:null, writable:true}
});

MM.Backend.Firebase.connect = function(server) {
	var promise = new Promise();
	
	this.ref = new Firebase("https://" + server + ".firebaseio.com/");
	
	this.ref.child(".info/connected").once("value", function(snap) {
		promise.fulfill();
	});
	
	this.ref.child("names").on("value", function(snap) {
		MM.publish("firebase-list", this, snap.val() || {});
	});
	
	return promise;
}

MM.Backend.Firebase.save = function(data, id, name) {
	var promise = new Promise();

	try {
		this.ref.child("names/" + id).set(name);
		this.ref.child("data/" + id).set(data, function(result) {
			if (result) {
				promise.reject(result);
			} else {
				promise.fulfill();
			}
		});
	} catch (e) {
		promise.reject(e);
	}
	return promise;
}

MM.Backend.Firebase.load = function(id) {
	var promise = new Promise();
	
	this.ref.child("data/" + id).once("value", function(snap) {
		var data = snap.val();
		if (data) {
			promise.fulfill(data);
		} else {
			promise.reject(new Error("There is no such saved map"));
		}
	});
	return promise;
}

MM.Backend.Firebase.remove = function(id) {
	var promise = new Promise();

	try {
		this.ref.child("names/" + id).remove();
		this.ref.child("data/" + id).remove(function(result) {
			if (result) {
				promise.reject(result);
			} else {
				promise.fulfill();
			}
		});
	} catch (e) {
		promise.reject(e);
	}

	return promise;
}
