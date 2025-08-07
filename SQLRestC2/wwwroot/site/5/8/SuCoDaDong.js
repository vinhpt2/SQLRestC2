var SuCoDaDong = {
	run: function (p) {
		p.config.whereclause=JSON.stringify(["status",p.checked?"<>":"=","FINISH"]);
		NUT.w2ui["grid_"+p.config.tabid].reload();
	}
}