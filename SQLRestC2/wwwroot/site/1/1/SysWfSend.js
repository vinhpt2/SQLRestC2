var SysWfSend={
	run:function(p){
		if (p.records.length) {
			SysWfSend.obj = p.records[0];
			SysWfSend.columnkey=p.config.table.columnkey;
			SysWfSend.objid = SysWfSend.obj[SysWfSend.columnkey];
			
			if (p.config.workflowid) {
				var wf = NUT.workflows[p.config.workflowid];
				var step0 = wf[SysWfSend.obj.stepid];
				var isFinish=(step0.steptype=="bpmn:EndEvent");
				if(isFinish&&SysWfSend.obj.status==step0.reject){
					NUT.notify("⚠️ Data is already Finished!", "yellow");
					return;
				}
				var stepItems = [];
				var userItems = [];

				var nextStep = null;
				for (var i = 0; i < step0.outs.length; i++) {
					var out = step0.outs[i];
					var step = wf[out.id];
					stepItems.push({ id: step.stepid, text: step.stepname });
					if (out.label&&eval("SysWfSend.obj." + out.label)) nextStep = step;
				}
				
				if (!nextStep && step0.outs.length == 1) nextStep = wf[step0.outs[0].id];
				var record={priority:0}
				if (nextStep){
					userItems = NUT.wfusers[wf[nextStep.stepid].roleid];
					record.stepid=nextStep.stepid;
				}
				var id = "frmWfSend";
				NUT.openDialog({
					title: (isFinish?"_Finish":"_Send"),
					width: 360,
					height: 300,
					div: '<div id="' + id + '" class="nut-full"></div>',
					onOpen(evt) {
						evt.onComplete = function () {
							var opt = {
								name: id,
								fields:isFinish?[{ field: "note", type: "textarea", html: { label: "_Note" } }]:[
									{ field: "stepid", type: "select", required: true, hidden:isFinish, html: { label: "_Next" }, options: { items: stepItems } },
									{ field: "userid", type: "select", hidden:isFinish, html: { label: "_User" } },
									{ field: "note", type: "textarea", html: { label: "_Note" } },
									{ field: "priority", type: "select", html: { label: "_Priority" }, options: { items: [{ id:0, text:"Normal"}, { id:1, text:"High"}, { id:2, text:"Urgent"}] } }
								],
								record: record,
								onChange: function (evt) {
									if (evt.target == "stepid") {
										var step = wf[this.record.stepid];
										var userItems = NUT.wfusers[step.roleid];
										this.set("userid", { options: { items: userItems } });
										if (step.userid) {
											this.setValue("userid",step.userid==-1?n$.user.parentid:step.userid)
										}
									}
								},
								actions: {
									"_Close": function () {
										NUT.closeDialog();
									}
								}
							};

							if (step0.ins.length) opt.actions["_Reject"] = function () {
								var record = this.record; 
								NUT.confirm("Reject data to previous step?", function (evt) {
									if (evt == "Yes") {
										var step = wf[step0.ins[0]];
										NUT.ds.select({ url: NUT.URL + "n_wfflow", select: "fromuserid",orderby:"flowid desc", where: [["fromstepid", "=", step.stepid], ["tostepid", "=", step0.stepid], ["recordid", "=", SysWfSend.objid]] }, function (res3) {
											if (res3.success && res3.result.length) {
												var fromuserid = res3.result[0].fromuserid;
												NUT.ds.insert({ url: NUT.URL + "n_wfflow", data: { fromstepid: step0.stepid, fromuserid: n$.user.userid, tostepid: step.stepid, toroleid: step.roleid, touserid: fromuserid, status: (step.reject || step.status), recordid: SysWfSend.objid, tableid: p.config.tableid, windowid: p.config.windowid, note: record.note,priority:2, created: new Date(), siteid: n$.user.siteid } }, function (res2) {
													if (res2.success) {
														var data = {};
														data.roleid = step.roleid;
														data.stepid = step.stepid;
														data.status = (step.reject || step.status);
														data.userid = fromuserid;
														NUT.ds.update({ url: p.config.table.urledit, data: data, where: [SysWfSend.columnkey, "=", SysWfSend.objid] }, function (res) {
															if (res.success) {
																NUT.w2ui["grid_" + p.config.tabid].reload();
																NUT.closeDialog();
																NUT.notify("Data rejected to previous step.", "lime");
															} else NUT.notify("🛑 ERROR: " + res.result, "red");
														});
													}
												});
											}
										});
									}
								});
								
							}
							if(step0.outs.length)opt.actions["_Send"]= function () {
								var record = this.record;
								var step = wf[record.stepid];
								NUT.ds.insert({ url: NUT.URL + "n_wfflow", data: { fromstepid: step0.stepid, fromuserid: n$.user.userid, tostepid: record.stepid, toroleid: step.roleid, touserid: record.userid, status: step.status, recordid: SysWfSend.objid, tableid: p.config.tableid, windowid:step.windowid, note: record.note, priority: record.priority, created: new Date(), siteid: n$.user.siteid } }, function (res2) {
									if (res2.success) {
										var data = {};
										data.roleid = step.roleid;
										data.stepid = step.stepid;
										data.status = step.status;
										data.userid = (record.userid || 0);
										NUT.ds.update({ url: p.config.table.urledit, data: data, where: [SysWfSend.columnkey, "=", SysWfSend.objid] }, function (res) {
											if (res.success) {
												NUT.w2ui["grid_" + p.config.tabid].reload();
												NUT.closeDialog();
												NUT.notify("Data sent to next step.", "lime");
											} else NUT.notify("🛑 ERROR: " + res.result, "red");
										});
									} else NUT.notify("🛑 ERROR: " + res2.result, "red");
								});
							}
							if(isFinish)opt.actions["_Finish"]= function () {
								if(step0.reject) NUT.ds.update({ url: p.config.table.urledit, data: {status:step0.reject}, where: [SysWfSend.columnkey, "=", SysWfSend.objid] }, function (res) {
									if (res.success) {
										NUT.w2ui["grid_" + p.config.tabid].reload();
										NUT.closeDialog();
										NUT.notify("Data is finish.", "lime");
									} else NUT.notify("🛑 ERROR: " + res.result, "red");
								}); else NUT.notify("⚠️ Finish status not defined", "yellow");
							}
							var frm = (NUT.w2ui[id] || new NUT.w2form(opt));
							frm.render(document.getElementById(id));
							if (nextStep && nextStep.userid) frm.setValue("userid", nextStep.userid == -1 ? n$.user.parentid : nextStep.userid);
							frm.set("userid", { options: { items: userItems } });
						}
					}
				});
			} else NUT.notify("No workflow for table " + p.config.table.tablename, "yellow");
		} else NUT.notify("No record selected!", "yellow");
	}
}