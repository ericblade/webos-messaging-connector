enyo.kind({
	name: "Synergy",
	kind: enyo.VFlexBox,
	components: [
		{kind: "Header", components: [
			{content: "Page Header"}
		]},
		{flex: 1, kind: "Pane", components: [
		    { content: "Launch the Settings->Accounts app and add an account there" },
				//Insert your components here
		]},
		{kind: "Toolbar", components: [
		]}
	]
});
