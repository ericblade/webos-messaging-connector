// TODO: we need to disable/cancel our Activity at onEnable with enabled: false
// TODO: probably also need to setup an activity that's name is based on the account name,
//       so that we have one activity per account, and then it should be cake to
//       know which account it wants us to work on.  Also, someone could have multiple
//       accounts for a service, with only one of them enabled for messaging (if you have more than one capability)
// TODO: I think I'd like to add a seperate file that actually handles the
//       login/authenticate/retrieve messages/send messages stuff, and mostly just
//       leave this file alone.

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

// Here are a list of possible errors that you can return, using throw new Error("code") or future.setException(Error("code")) or some such
// maybe future.setException(Foundations.Err.create(error.code));
// Taken from the webOS 3.0 accounts app:
/*
                "UNKNOWN_ERROR":                                accountsRb.$L("Unknown error"),
                "401_UNAUTHORIZED":                             accountsRb.$L("The account credentials you entered are incorrect. Try again."),
                "408_TIMEOUT":                                  accountsRb.$L("Request timeout"),
                "500_SERVER_ERROR":                             accountsRb.$L("Server error"),
                "503_SERVICE_UNAVAILABLE":              accountsRb.$L("Server unavailable"),
                "412_PRECONDITION_FAILED":              accountsRb.$L("The request is not suitable for the current configuration"),
                "400_BAD_REQUEST":                              accountsRb.$L("Bad request"),
                "HOST_NOT_FOUND":                               accountsRb.$L("Host not found"),
                "CONNECTION_TIMEOUT":                   accountsRb.$L("Connection timeout"),
                "CONNECTION_FAILED":                    accountsRb.$L("Connection failed"),
                "NO_CONNECTIVITY":                              accountsRb.$L("Must be connected to a network to sign in"),
                "ENOTFOUND":                                    accountsRb.$L("Must be connected to a network to sign in"),
                "SSL_CERT_EXPIRED":                             accountsRb.$L("SSL certificate expired"),
                "SSL_CERT_UNTRUSTED":                   accountsRb.$L("SSL certificate untrusted"),
                "SSL_CERT_INVALID":                             accountsRb.$L("SSL certificate invalid"),
                "SSL_CERT_HOSTNAME_MISMATCH":   accountsRb.$L("SSL certificate hostname mismatch"),
                "SINGLE_ACCOUNT_ONLY":                  accountsRb.$L("Only one account of this type can exist"),
                "TIMESTAMP_REFUSED":                    accountsRb.$L("Device date incorrect"),
                "DUPLICATE_ACCOUNT":                    accountsRb.$L("Duplicate account"),
                "UNSUPPORTED_CAPABILITY":               accountsRb.$L("Your account is not configured for this service."),
                "INVALID_EMAIL_ADDRESS":                accountsRb.$L("Please enter a valid email address."),
                "INVALID_USER":                                 accountsRb.$L("Invalid user"),
                "ACCOUNT_RESTRICTED":                   accountsRb.$L("User account restricted"),
                "ACCOUNT_LOCKED":                               accountsRb.$L("Your account is locked.  Please log in using a web browser"),
                "CALENDAR_DISABLED":                    accountsRb.$L("Your account does not have calendar enabled. Please log in to your account and
*/

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
//
// I am not sure at this time what exactly is called when credentials stop working, or how
// it even determines that.  That part will require further research.

var checkCredentials = Class.create({
	run: function(future) {
		var args = this.controller.args;
		console.log("checkCredentials", args.username, args.password);
		future.result = {
			returnValue: true,
			credentials: {
				common: {
					password: args.password,
					username: args.username
				}
			},
			config: {
				password: args.password,
				username: args.username
			}
		}
	}
});

// Called when your account is created from the Accounts settings, use this
// function to create any account specific information.  In this example,
// we're going to create a loginstate object, so the messaging app can see that
// we do, in fact, exist.
// specified in your account-template.json

// In SynerGV, I use this to load an additional database with the user's webOS account _id field,
// and their username, as well as configuration settings that are used on a per-account basis.
// args contains the accountId field, which is the webOS account _id, as well as the objects
// passed down from checkCredentials.

var onCreate = Class.create({
	run: function(future) {
		var args = this.controller.args;
		console.log("onCreate args=", JSON.stringify(args));

		// Setup permissions on the database objects so that our app can read/write them.
		// This is purely optional, and according to the docs here:
		// https://developer.palm.com/content/api/dev-guide/synergy/creating-synergy-contacts-package.html
		
		// You should be able to do this by specifying a file: service/configuration/db/kinds/com.ericblade.synergy.immessage
		// and then placing the contents of this permissions variable as JSON inside that file.
		// I am doing this from code, merely to present it since we can't comment system JSON.

		var permissions = [
			{
				type: "db.kind",
				object: "com.ericblade.synergy.immessage:1",
				caller: "com.ericblade.*",
				operations: {
					read: "allow", 
					create: "allow",
					"delete": "allow",
					update: "allow"
				}
			},
			{
				type: "db.kind",
				object: "com.ericblade.synergy.immessage:1",
				caller: "com.palm.*",
				operations: {
					read: "allow",
					create: "allow",
					"delete": "allow",
					update: "allow",
				}
			}
		];

		PalmCall.call("palm://com.palm.db/", "putPermissions", { permissions: permissions } ).then(function(fut)
		{
			console.log("permissions put result=", JSON.stringify(fut.result));
			future.result = { returnValue: true, permissionsresult:fut.result };
		});
	}
});

// Called when your account is deleted from the Accounts settings, probably used
// to delete your account info and any stored data

var onDelete = Class.create({
	run: function(future) {
		var args = this.controller.args;
		console.log("onDelete", JSON.stringify(args));
		DB.del({ from: "com.ericblade.synergy.loginstate:1" }).then(function(fut) {
			future.result = f.result
		});
	}
});

// This is called when multiple capabilities are turned on or off. I've not yet implemented this,
// as the only connectors I've implemented have had at most two capabilities, one or both of which
// were not able to be disabled.

var onCapabilitiesChanged = Class.create({
	run: function(future) {
		var args = this.controller.args;
		console.log("onCapabilitiesChanged", JSON.stringify(args));
	}
}};

// Called when user has entered new, validated credentials
// Intended so that if you've been not syncing due to a credentials failure, then you'll know
// that it should be good to go again

var onCredentialsChanged = Class.create({
	run: function(future) {
		var args = this.controller.args;
		console.log("onCredentialsChanged", JSON.stringify(args));
	}
});

// Included as part of the template.  You may want to set up a database watch
// on your imstate objects, so you know when someone hits the "Offline" or
// "online" toggle in the Messaging app, so that you can login/logout.

var loginStateChanged = Class.create({
	run: function(future) {
		var args = this.controller.args;
		console.log("loginStateChanged", JSON.stringify(args));
	}
})

// Included as part of the template.  You might want to fill this in with
// your outgoing message code, to make it easy to call when needed.
var sendIM = function(future) {
	run: function(future) {
		var args = this.controller.args;
		console.log("sendIM", JSON.stringify(args));
	}
}

// When the Messaging program is told to Add a buddy, Block someone, or remove a Buddy, it will
// add your custom imcommand kind to the database.  If you need those functions, you should
// setup a watch on that database, and perform steps similar to this:

var sendCommand = function(future) {
	run: function(future) {
		var args = this.controller.args;
		console.log("sendCommand", JSON.stringify(args));
		
		var query = {
			from: "com.ericblade.synergy.imcommand:1",
			where: [
				{ "prop":"status", "op":"=", "val":"pending" }
			]
		};
		future.nest(DB.find(query, false, false).then(function(f) {
			var res = f.result.results;
			var mergeIds = [];
			for(var x = 0; x < res.length; x++) {
				mergeIds.push({ _id: res[x]._id, status: "successful" });
				switch(res[x].command) {
					case "blockBuddy":
						if(res[x].params.block)
						{
							// send block command for res[x].fromUsername on res[x].targetUsername
						} else {
							// send unblock command for res[x].fromUsername on res[x].targetUsername
						}
						break;
					case "sendBuddyInvite":
						// send buddy invite with message res[x].params.message for res[x].fromUsername to res[x].targetUsername
						break;
					case "deleteBuddy":
						// remove buddy from buddy list for res[x].fromUsername to res[x].targetUsername
						break;
				}
			}
			DB.merge(mergeIds);
			f.result = { returnValue: true };
			future.result = { returnValue: true };
		}));
		
		return future;
		
	}
}

//
// Synergy service got 'onEnabled' message. When enabled, a sync should be started and future syncs scheduled.
// Otherwise, syncing should be disabled and associated data deleted.
// Account-wide configuration should remain and only be deleted when onDelete is called.
// onEnabled args should be like { accountId: "++Mhsdkfj", enabled: true }
// 
// TODO: This function is a total mess, and should be re-written for the example.
// In SynerGV, this function is where we turn on and off the various database watches.

// Also, according to the webOS documentation, when disabling a capability (enabled: false), you
// should erase any stored data for that specific capability, but not for the account as a whole,
// as that data should remain in case they re-enable the capability.

var onEnabled = Class.create({
	run: function(future) {
		var args = this.controller.args;
	
		console.log("onEnabledAssistant args.enabled=", args.enabled);
		
		if(!args.enabled)
		{
			// cancel our sync activity, and remove the entry from the messaging loginstates,
			// so we no longer show up in the app
			var stopSync = PalmCall.call("palm://com.ericblade.synergy.service/", "cancelActivity", { accountId: args.accountId }).then(function(f) {
				DB.del({ from: "com.ericblade.synergy.loginstate:1" });
			});
		}
		else
		{
			// Create an object to insert into the database, so that the messaging app
			// knows that we exist.
			var loginStateRec = {
				"objects":[
				{
					_kind: "com.ericblade.synergy.loginstate:1",
					// TODO: we should pull this from the account template.. how?
					serviceName: "type_synergy",
					accountId: args.accountId,
					username: "blade.eric", 
					state: "online", // it doesn't -seem- to matter what i put here, there may be another parameter involved
					availability: 1
				}]
			};
	
			// And then start an Activity to organize our syncing		
			
			PalmCall.call("palm://com.palm.db/", "put", loginStateRec).then( function(f) {
				var startSync = PalmCall.call("palm://com.palm.activitymanager/", "create",
				{
					start: true,
					activity: {
						name: "SynergyOutgoingSync:" + args.accountId,
						description: "Synergy Pending Messages Watch",
						type: {
							foreground: true,
							power: true,
							powerDebounce: true,
							explicit: true,
							persist: true
						},
						requirements: {
							internet: true
						},
						trigger: {
							method: "palm://com.palm.db/watch",
							key: "fired",
							params: {
								subscribe: true,
								query: {
									from: "com.ericblade.synergy.immessage:1",
									where: [
										{ prop: "status", op: "=", val: "pending" },
										{ prop: "folder", op: "=", val: "outbox" },
										// TODO: Grab the username from somewhere, and insert it here
										/*{ prop: "serviceName", op: "=", val: "type_synergy" },
										{ prop: "userName", op: "=", val: TODO GET USERNAME FROM SOMEWHERE },*/
									],
									limit: 1
								}
							}
						},
						callback: {
							method: "palm://com.ericblade.synergy.service/sync",
							params: {}
						}
					}
				});
			});
		}
						  
		(args.enabled ? startSync : stopSync).then(function(activityFuture) {
				console.log("activityFuture", (args.enabled ? "start" : "stop"), " result=", JSON.stringify(activityFuture.result));
				future.result = { returnValue: true };
		});
	}
};


// Here's some possibly not well known things about the services that I'm learning while attempting to read the
// service code itself (which is in Javascript, but without knowing it's intentions, it's quite difficult to read
// for my skill level)
//
// The command assistants appear to be instances of Prototype js lib Classes.
// You should be able to do something like
//
// runCommandAssistant = Class.create({ run: ..., complete: ... })
//
// This would make it a lot more enyo-like in structure.
//
// Available functions that the service appears to call inside a class:
//
// setup - called before running a command (we should try to adopt a thing here, perhaps)
// commandTimeout - not a function, but apparently you can set the timeout for individual commands by setting a commandTimeout
//                  variable.  This will override the command's configured timeout or the service as a whole's timeout
// timeoutReceived - called when a command has reached it's timeout
// complete - called when a command run is completed
// cleanup - called after complete
// yield - called when a "yield" Event happens, whatever that means
// cancelSubscription - presumably called when a subscription is cancelled

// The "sync" assistant is normally called from the CONTACTS "Sync Now" button.
// This doesn't seem to be the case when a MESSAGING connector is added, but we're going
// to use this to fire off a database watch.  If you're going to be retrieving data from the
// internet (presumably!) you probably want to add a call to the Alarm function, so that you
// can get a wake up alert here.
// Keep in mind that Synergy can create multiple accounts of one type, so you probably want to dig up
// all possible accountinfos, and sync them all.

// TODO: Add support to the test app to inject accountId here

var startActivity = Class.create({
	run: function(activityFuture)
	{
		var args = this.controller.args;
		PalmCall.call("palm://com.palm.activitymanager/", "create",
		{
		start: true,
		activity: {
			name: "SynergyOutgoingSync:" + args.accountId,
			description: "Synergy Pending Messages Watch",
			type: {
				foreground: true,
				power: true,
				powerDebounce: true,
				explicit: true,
				persist: true
			},
			requirements: {
				internet: true
			},
			trigger: {
				method: "palm://com.palm.db/watch",
				key: "fired",
				params: {
					subscribe: true,
					query: {
						from: "com.ericblade.synergy.immessage:1",
						where: [
							{ prop: "status", op: "=", val: "pending" },
							{ prop: "folder", op: "=", val: "outbox" }
						],
						limit: 1
					}
				}
			},
			callback: {
				method: "palm://com.ericblade.synergy.service/sync",
				params: {}
			}
		}
		}).then(function(f) {
			console.log("startActivity result=", JSON.stringify(f.result));
			activityFuture.result = f.result;
		});
	}
});

var adoptActivity = Class.create({
	run: function(adoptFuture)
	{
		var args = this.controller.args;
		PalmCall.call("palm://com.palm.activitymanager/", "adopt", {
			activityName: "SynergyOutgoingSync:" + args.accountId,
			wait: true,
			subscribe: true
		}).then(function(f) {
			console.log("adoptActivity result", JSON.stringify(f.result));
			adoptFuture.result = f.result;
		});
	}
});

var completeActivity = Class.create({
	run: function(completeFuture)
	{
		var args = this.controller.args;
		PalmCall.call("palm://com.palm.activitymanager/", "complete", {
			activityName: "SynergyOutgoingSync:" + args.accountId,
			restart: true,
			// the docs say you shouldn't need to specify the trigger and callback conditions again, i think..
			// someone else said reset the callback to a different function .. to avoid the "Temporarily Not Available" problem
			// other people say you do. so let's try it.
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
			  },
			}
		}).then(function(f) {
			console.log("completeActivity result", JSON.stringify(f.result));
			completeFuture.result = f.result;
		});
	}
});

var cancelActivity = Class.create({
	run: function(cancelFuture)
	{
		var args = this.controller.args;
		PalmCall.call("palm://com.palm.activitymanager/", "cancel", {
			activityName: "SynergyOutgoingSync:" + args.accountId
		}).then(function(f) {
			cancelFuture.result = f.result;
		});
	}
})

var sync = Class.create({
	setup: function() {
		var args = this.controller.args;
		var future;
		console.log("sync setup start");
		/*var activity = args.$activity;
		if(activity) {
		    var activityId = activity.activityId;		
			var future = PalmCall.call("palm://com.palm.activitymanager/", "adopt", {
				activityName: "SynergyOutgoingSync",
				wait: true
			}).then(function(f) {
				console.log("sync setup complete", JSON.stringify(f.result));
				future.result = { returnValue: true };
				f.result = { returnValue: true };
			});
		} */
		return future;
	},
	run: function(syncFuture) {
		var args = this.controller.args;
		console.log("sync run start");
		var f = new Future();
		var query = {
					  from: "com.ericblade.synergy.immessage:1",
					  where:
					  [
						  { "prop":"folder", "op":"=", "val":"outbox" },
						  { "prop":"status", "op":"=", "val":"pending" },
						  // TODO: add serviceName and userName to this query
					  ]
				  };

		f.now(function(future) {
			console.log("setting alarm");
			f.nest(PalmCall.call("palm://com.palm.power/timeout/", "set", {
				key: "com.ericblade.synergy.synctimer",
				"in": "00:05:00",
				uri: "palm://com.ericblade.synergy.service/sync",
				params: "{}"
			}).then(function(postAlarmFuture) {
				console.log("alarm set result", JSON.stringify(postAlarmFuture.result));			
			}));
			future.nest(DB.find(query, false, false).then(function(dbFuture) {
				console.log("dbFuture result=", JSON.stringify(dbFuture.result));
				var dbResult = dbFuture.result;
				if(dbResult.results)
				{
					var mergeIDs = [ ];
					// Call our sendIM service function to actually send each message
					// Record each message ID into an array, and then update them in
					// the database as "successful", ie - sent.
					// You may want to not mark them as sent in the database until they
					// are actually sent via your sendIM function, though.
					for(var x = 0; x < dbResult.results.length; x++)
					{
						console.log("Merging status of ", dbResult.results[x]["_id"]);
						PalmCall.call("palm://com.ericblade.synergy.service/", "sendIM", {
							to: dbResult.results[x].to[0].addr,
							text: dbResult.results[x].messageText
						});
						mergeIDs.push( { "_id": dbResult.results[x]["_id"], "status": "successful" });
					}
					DB.merge(mergeIDs);
				}
				syncFuture.result = { returnValue: true };
			}));
		});
	},
	complete: function() {
		var args = this.controller.args;
		var activity = args.$activity;
		console.log("sync complete starting");
		return activity && PalmCall.call("palm://com.palm.activitymanager/", "complete", {
			//activityName: "SynergyOutgoingSync",
			activityId: activity.activityId,
			restart: true,
			// the docs say you shouldn't need to specify the trigger and callback conditions again, i think..
			// someone else said reset the callback to a different function .. to avoid the "Temporarily Not Available" problem
			// other people say you do. so let's try it.
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
						  // TODO: add serviceName and userName here
					  ],
					  limit: 1
				  },
				  subscribe: true
			  },
			}
		}).then(function(f) {
			console.log("sync complete completed", JSON.stringify(f.result));
			f.result = { returnValue: true };
		})
	}	
})
