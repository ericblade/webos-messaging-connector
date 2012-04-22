enyo.kind({
	name: "Synergy",
	kind: enyo.VFlexBox,

	components: [
		{ name: "credService", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "checkCredentials", onSuccess: "credSuccess", onFailure: "credFailure" },
		{ name: "syncService", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "sync", onSuccess: "syncSuccess", onFailure: "syncFailure" },
		{ name: "createAccount", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "onCreate", onSuccess: "createSuccess", onFailure: "createFailure" },
		{ name: "disenableAccountCap", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "onEnabled", onSuccess: "enabledSuccess", onFailure: "enabledFailure" },
		{ name: "deleteAccount", kind: "PalmService", service: "palm://com.ericblade.synergy.service/", method: "onDelete", onSuccess: "deletedSuccess", onFailure: "deletedFailure" },
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
				]}
			]}
		]},
	],
	// TODO: These should call these test functions with some useful parameters..
	callCreate: function(inSender, inEvent) { this.$.createAccount.call({ }); },
	callEnabled: function(inSender, inEvent) { this.$.disenableAccountCap({ enabled: true }); },
	callDisabled: function(inSender, inEvent) { this.$.disenableAccountCap({ enabled: false }); },
	callDelete: function(inSender, inEvent) { this.$.deleteAccount.call({ }); },
	credSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
	},
	credFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
	},
	enabledSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
	},
	enabledFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
	},
	deleteSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
	},
	deleteFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
	},
	syncSuccess: function(inSender, inResponse, inRequest) {
		this.log(inSender, inResponse, inRequest);
	},
	syncFailure: function(inSender, inError, inRequest) {
		this.log(inSender, inError, inRequest);
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
