// NOTE: There are a few service calls to the Palm ActivityManager service
// in this source code, that are currently commented out.  I/We need to figure
// out how to properly get the ActivityManager to work to make the most efficient
// use of the database and built-in power saving functions of webOS.
// At the moment, I have wired a simple 5-minute sync timer that should sync
// incoming and outgoing messages at the same time.
// Ideally, we want to have the service as idle as possible, so we want to just
// wake it when a user actually inserts a message into the database.
// Personally, I'm not sure exactly how IM services that need a persistent
// connection are going to handle this, but hopefully we can come up with something
// there.
//
// Also, there is a bug in this that does not show the account type inside the
// messaging app's drop down status list.  I'm not certain, but I think that
// may be due to the example account setup not having a CONTACTS connector.

// Just a log to say we're present.  After installing the app/service, you can
// run "run-js-service -k /media/cryptofs/apps/usr/palm/services/your.service.directory"
// to see the actual output from the service.  That has been instrumental in helping me
// to figure out what's going on in here.  As well as "ls-monitor" to watch the
// service bus.
console.log("Loading serviceEndPoints *****************************************************");

var checkCredentials = function(future) {};

// Called to test your credentials given - this is specified in the account-template.json, under "validator"
// args = { "username": username entered, "password": password entered,
//          "templateId": our template, "config": { ? } }
// return a "credentials" object and a "config" object.  The "config" object will get passed to
// the onCreate function when your account is created.
//
// Use this to go to your online service, and verify that the login information
// given by the user works.  Return any credentials you will need to login to the
// system again (ie username, password, service key, whatever), so that they will
// be passed to onCreate, where you can save them.
// Also called when credentials stop working, such as an expired access code, or
// password change, and the user enters new information.

checkCredentials.prototype.run = function(future) {
    var args = this.controller.args;
    console.log("checkCredentials", args.username, args.password);
    future.result =
	{
		returnValue: true, "credentials":
		{
			"common":
			{
				"password": args.password, "username": args.username
			}
		},
		"config":
		{
			"password": args.password,
			"username": args.username
		}
	};
}

var onCreate = function(future) {};

// Called when your account is created from the Accounts settings, use this
// function to create any account specific information.  In this example,
// we're going to create a loginstate object, so the messaging app can see that
// we do, in fact, exist.
// specified in your account-template.json
onCreate.prototype.run = function(future) {
	var args = this.controller.args;
	console.log("onCreate");
    console.log("onCreate args=", args.config, "cred=", args.credentials);

	// Create an object to insert into the database, so that the messaging app
	// knows that we exist.
	var loginStateRec = {
		"objects":[
		{
			_kind: "com.ericblade.synergy.loginstate:1",
			serviceName: "type_synergy",
			username: "blade.eric", 
			state: "online", // it doesn't -seem- to matter what i put here, there may be another parameter involved
		}]
	};
	
	// Then we're going to setup the permissions
	// on the database objects so that our app can speak to them.  This is purely
	// optional, and according to the docs here:
	// https://developer.palm.com/content/api/dev-guide/synergy/creating-synergy-contacts-package.html
	// you should be able to do this with files. I was unable to get that to work, though.
	
	PalmCall.call("palm://com.palm.db/", "put", loginStateRec).then( function(f) {
        console.log("loginState put result=", f.result)
		var permissions = [
			{
				"type": "db.kind",
				"object": "com.ericblade.synergy.immessage:1",
				"caller": "com.ericblade.*",
				"operations":
				{
					"read": "allow",
					"create": "allow",
					"delete": "allow",
					"update": "allow"
				}
			},
			{
				"type": "db.kind",
				"object": "com.ericblade.synergy.immessage:1",
				"caller": "com.palm.*",
				"operations":
				{
					"read": "allow",
					"create": "allow",
					"delete": "allow",
					"update": "allow",
				}
			}
		];
		PalmCall.call("palm://com.palm.db/", "putPermissions", { "permissions": permissions} ).then(function(fu)
		{
			console.log("permissions put result=");
			console.log(fu.result);
			
			future.result = { returnValue: true };
		});
	});	
}

var onDelete = function(future) {};

// Called when your account is deleted from the Accounts settings, probably used
// to delete your account info and any stored data
// TODO: We need to delete the loginstate for the deleted account, here
onDelete.prototype.run = function(future) {
    console.log("onDelete");
	future.result = { returnValue: true };
}

var onCapabilitiesChanged = function(future) {};

// Called when multiple capabilities are changed, instead of calling onEnabled several times
// Only apparently useful if your service handles multiple Synergy capabilities

onCapabilitiesChanged.prototype.run = function(future) {
    console.log("onCapabilitiesChanged");
}
 
var onCredentialsChanged = function(future) {};

// Called when user has entered new, validated credentials
// Intended so that if you've been not syncing due to a credentials failure, then you'll know
// that it should be good to go again

onCredentialsChanged.prototype.run = function(future) { 
    console.log("onCredentialsChanged"); 
    future.result = { returnValue: true }; 
};

var loginStateChanged = function(future) {};

// Included as part of the template.  You may want to set up a database watch
// on your imstate objects, so you know when someone hits the "Offline" or
// "online" toggle in the Messaging app, so that you can login/logout.
loginStateChanged.prototype.run = function(future) {
	console.log("loginStateChanged");
	future.result = { returnValue: true };
};

var sendIM = function(future) {};

// Included as part of the template.  You might want to fill this in with
// your outgoing message code, to make it easy to call when needed.
sendIM.prototype.run = function(future) {
	console.log("sendIM");
	future.result = { returnValue: true };
};

var sendCommand = function(future) {};

// Included as part of the template.  You might want to fill this in with
// any outgoing command code, to make it easy to call when needed.
sendCommand.prototype.run = function(future) {
	console.log("sendIM");
	future.result = { returnValue: true };
};

// The "sync" assistant is normally called from the CONTACTS "Sync Now" button.
// This doesn't seem to be the case when a MESSAGING connector is added, but we're going
// to use this to fire off a database watch.  If you're going to be retrieving data from the
// internet (presumably!) you probably want to add a call to the Alarm function, so that you
// can get a wake up alert here.
// Keep in mind that Synergy can create multiple accounts of one type, so you probably want to dig up
// all possible accountinfos, and sync them all.
var sync = function(future) {};

sync.prototype.run = function(future) {
	console.log("sync");
	// Set an alarm to run in 5 minutes to call this function.  When it does,
	// it will recurse.
	PalmCall.call("palm://com.palm.power/timeout/", "set",
				  {
					"key": "com.ericblade.synergy.synctimer",
					"in": "00:05:00",
					"uri": "palm://com.ericblade.synergy.service/sync",
					"params": "{}"
				  });
	// Setup a database query -- messages that are both in "outbox" and in the
	// "pending" status are assumed to be needing to be sent
	var query = {
		from: "com.ericblade.synergy.immessage:1",
		where:
		[
			{ "prop":"folder", "op":"=", "val":"outbox" },
			{ "prop":"status", "op":"=", "val":"pending" }, 
		]
	};
	
	DB.find(query, false, false).then(function(f) {
		var result = f.result;
		console.log("db find successful = ", result.returnValue);
		if(result.results)
		{
			var mergeIDs = [ ];
			// Call our sendIM service function to actually send each message
			// Record each message ID into an array, and then update them in
			// the database as "successful", ie - sent.
			// You may want to not mark them as sent in the database until they
			// are actually sent via your sendIM function, though.
			for(var x = 0; x < result.results.length; x++)
			{
				console.log("Merging status of ", result.results[x]["_id"]);
				PalmCall.call("palm://com.ericblade.synergy.service/", "sendIM",
							  { to: inResponse.results[x].to[0].addr, text: inResponse.results[x].messageText });
				mergeIDs.push( { "_id": result.results[x]["_id"], "status":"successful" } );
			}
			DB.merge(mergeIDs);
		}
		f.result = { returnValue: true };
	})
	/*.then(function(fu) {
		PalmCall.call("palm://com.palm.activitymanager/", "complete",
					  {
						activityName: "synergySyncOutgoing",
						restart: true
					  });
		fu.result = { returnValue: true };
		future.result = { returnValue: true };
	});*/
	future.result = { returnValue: true };
}

//*****************************************************************************
// Capability enabled notification - called when capability enabled or disabled
//*****************************************************************************
var onEnabled = function(future){};

//
// Synergy service got 'onEnabled' message. When enabled, a sync should be started and future syncs scheduled.
// Otherwise, syncing should be disabled and associated data deleted.
// Account-wide configuration should remain and only be deleted when onDelete is called.
// onEnabled args should be like { accountId: "++Mhsdkfj", enabled: true }
// 

onEnabled.prototype.run = function(future) {  
    var args = this.controller.args;

    console.log("onEnabledAssistant args.enabled=", args.enabled);
	
	/*PalmCall.call("palm://com.palm.activitymanager/", "stop", { activityName: "synergySyncOutgoing" }).then(function() {	
		PalmCall.call("palm://com.palm.activitymanager/", "create",
					  {
						  activity: {
							  callback: { method: "palm://com.ericblade.synergy.service/sync" },
							  name: "synergySyncOutgoing",
							  description: "Outgoing Message Sync for SynerGV",
							  type: { foreground: true, persist: true },
							  //requirements: { wan: true },
							  trigger: {
								key: "fired",
								method: "palm://com.palm.db/watch",
								params: {
									query: {
										from: "com.ericblade.synergy.immessage:1",
										where:
										[
											{ "prop":"folder", "op":"=", "val":"outbox" },
											{ "prop":"status", "op":"=", "val":"pending" }, 
										]
									},
									subscribe: true
								}
							  },
							  start: true,
							  replace: true
						  },
						  start: true,
						  subscribe: true,
						  replace: true
					  }
		).then(function(activityFuture) {
			console.log("activityFuture result=", JSON.stringify(activityFuture.result));
			activityFuture.result = { returnValue: true };
		});
	});*/
	// call the sync function to start watches and alarms and stuff
	PalmCall.call("palm://com.ericblade.synergy.service/", "sync", {}).then(function(f) {
		console.log("sync result=", JSON.stringify(f.result));
		f.result = { returnValue: true };
	}).then(function(fu) {
		fu.result = { returnValue: true };
		future.result = { returnValue: true };
	});
};

