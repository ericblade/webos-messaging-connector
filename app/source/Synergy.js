enyo.kind({
	name: "Synergy",
	kind: enyo.VFlexBox,

	components: [
		{ name: "credService", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "checkCredentials", onSuccess: "credSuccess", onFailure: "credFailure" },
		{ name: "syncService", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "sync", onSuccess: "syncSuccess", onFailure: "syncFailure" },
		{ name: "createAccount", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "onCreate", onSuccess: "createSuccess", onFailure: "createFailure" },
		{ name: "disenableAccountCap", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "onEnabled", onSuccess: "enabledSuccess", onFailure: "enabledFailure" },
		{ name: "deleteAccount", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "onDelete", onSuccess: "deletedSuccess", onFailure: "deletedFailure" },
		{ name: "startActivity", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "startActivity", onSuccess: "startSuccess", onFailure: "startFailure" },
		{ name: "adoptActivity", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "adoptActivity", onSuccess: "adoptSuccess", onFailure: "adoptFailure" },
		{ name: "completeActivity", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "completeActivity", onSuccess: "completeSuccess", onFailure: "completeFailure" },
		{kind: "PageHeader", components: [
			{content: "Synegy Messaging Connector Test Panel"}
		]},
		{ name: "Results" },
		{flex: 1, kind: "Pane", components: [
			{flex: 1, kind: "Scroller", components: [
				{ kind: "Group", label: "Service Calls", components: [
					{ kind: "Group", label: "Credentials", components: [
						{ content: "Username" },
						{ name: "credUser", kind: "Input" },
						{ content: "Password" },
						{ name: "credPass", kind: "Input" },
						{ kind: "Button", label: "Check Credentials", onclick: "checkCredentials" },
					]}
				]},
				{ kind: "Group", label: "Accounts", components: [
					{ content: "For the time being, create and remove accounts and enable capabilities from the Settings->Accounts app" },
					{ content: "These buttons just test the functions called in the service." },
					{ kind: "Button", label: "onCreate", onclick: "callCreate" },
					{ kind: "Button", label: "onEnabled (enabled)", onclick: "callEnabled" },
					{ kind: "Button", label: "onEnabled (disabled)", onclick: "callDisabled" },
					{ kind: "Button", label: "onDelete", onclick: "callDelete" },
				]},
				{ kind: "Group", label: "Misc", components: [
					{ kind: "Button", label: "Sync", onclick: "sync" },
					{ kind: "Button", label: "startActivity", onclick: "startActivity" },
					{ kind: "Button", label: "adoptActivity", onclick: "adoptActivity" },
					{ kind: "Button", label: "completeActivity", onclick: "completeActivity" },
				]}
			]}
		]},
	],
	// TODO: These should call these test functions with some useful parameters..
	startActivity: function(inSender, inEvent) { this.$.startActivity.call({ }); },
	adoptActivity: function(inSender, inEvent) { this.$.adoptActivity.call({ }); },
	completeActivity: function(inSender, inEvent) { this.$.completeActivity.call({ }); },
	callCreate: function(inSender, inEvent) { this.$.createAccount.call({ }); },
	callEnabled: function(inSender, inEvent) { this.$.disenableAccountCap.call({ enabled: true }); },
	callDisabled: function(inSender, inEvent) { this.$.disenableAccountCap.call({ enabled: false }); },
	callDelete: function(inSender, inEvent) { this.$.deleteAccount.call({ }); },
	startSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
		this.$.Results.setContent(JSON.stringify(inResponse));
	},
	stopFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
		this.$.Results.setContent(JSON.stringify(inError));
	},
	adoptSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
		this.$.Results.setContent(JSON.stringify(inResponse));
	},
	adoptFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
		this.$.Results.setContent(JSON.stringify(inError));
	},	
	completeSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
		this.$.Results.setContent(JSON.stringify(inResponse));
	},
	completeFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
		this.$.Results.setContent(JSON.stringify(inError));
	},	
	credSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
		this.$.Results.setContent(JSON.stringify(inResponse));
	},
	credFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
		this.$.Results.setContent(JSON.stringify(inError));
	},
	enabledSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
		this.$.Results.setContent(JSON.stringify(inResponse));
	},
	enabledFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
		this.$.Results.setContent(JSON.stringify(inError));
	},
	createSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
		this.$.Results.setContent(JSON.stringify(inResponse));
	},
	createFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
		this.$.Results.setContent(JSON.stringify(inError));
	},
	deleteSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
		this.$.Results.setContent(JSON.stringify(inResponse));
	},
	deleteFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
		this.$.Results.setContent(JSON.stringify(inError));
	},
	syncSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
		this.$.Results.setContent(JSON.stringify(inResponse));
	},
	syncFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
		this.$.Results.setContent(JSON.stringify(inError));
	},
	checkCredentials: function(inSender, inEvent) {
		this.log("checking credentials");
		var params = { username: this.$.credUser.getValue(), password: this.$.credPass.getValue() };
		this.$.credService.call(params);
	},
	sync: function(inSender, inEvent) {
		this.$.syncService.call({ });
	}
});
