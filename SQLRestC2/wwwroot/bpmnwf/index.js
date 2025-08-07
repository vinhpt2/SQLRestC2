import { w2ui, w2layout, w2utils, w2popup,w2prompt, w2sidebar, w2confirm, w2form } from "../../lib/w2ui.es6.min.js";
import { SqlREST } from "../js/sqlrest.js";
NUT.ds = SqlREST;
NUT.w2ui = w2ui;
NUT.w2utils = w2utils;
NUT.w2confirm = w2confirm;
NUT.w2popup = w2popup;
NUT.w2prompt = w2prompt;
var _bpmn = null;
window.onload = function () {
	var strs = (window.location.search.substring(1)).split("&");
	for (var i = 0; i < strs.length; i++) {
		var str = strs[i].split("=");
		n$[str[0]] = str[1];
	}
	if (n$.theme && n$.theme != "w2ui.min") cssMain.href = "../lib/" + n$.theme + ".css";
	SqlREST.token = "Bearer " + n$.token;
	w2utils.locale(n$.locale).then(function (evt) {
		n$.lang = n$.locale.substring(0, 2);
		n$.phrases = evt.data.phrases;
		document.body.innerHTML = "<div id='divApp'></div>";
		NUT.appinfo = '<img width="64" height="64" src="favicon.ico"/><br/><h2><b style="color:brown">Workflow Manager</b></h2><br/><hr/><br/><h3>Workfow Manager for Designer</h3>';

		(w2ui["layMain"] || new w2layout({
			name: "layMain",
			style: "width:100%;height:100%;top:0;margin:0",
			panels: [
				{ type: 'top', size: 38, html: '<i class="nut-link"><img id="imgLogo " width="20" height="20" src="favicon.ico"/> Workflow 1.0</i>' },
				{ type: 'left', size: 300, resizable: true, html: '<div id="divLeft" class="nut-full"></div>' },
				{ type: 'main', html: '<div id="divMain" class="nut-full"><div id="divTitle" style="padding:6px;font-size:12pt">' + NUT.appinfo + '</div></div>' },
				{ type: 'right', size: 200, html: '<div id="divSaveWorkflow" style="display:none"><button id="butSaveWorkflow" class="w2ui-btn" onclick="saveWorkflow()">💾 Save Workflow</button><hr/></div><div id="divRight" class="nut-full"></div>' }
			],
		})).render(divApp);
		NUT.ds.select({ url: NUT.URL + "n_app", order: "orderno", where: ["apptype", "<>", "engine"] },function(res){
			if(res.success&&res.result.length){
				var appItems=[],lookup={},nodes=[];
				for(var i=0;i<res.result.length;i++){
					var item=res.result[i];
					appItems.push({id:item.appid,text:item.appname});
					var node = { id: "app_" + item.appid, text: item.appname + "<span></span><a class='nut-badge' onclick='event.stopPropagation();openWorkflow(" + item.appid + ")' title='New Workflow'>➕</a>", expanded: true, group: true, tag: item.appid, nodes: [] };
					nodes.push(node);
					lookup[item.appid]=node;
				}
				//loadMenu
				
				NUT.ds.select({url:NUT.URL+"n_workflow",select:"workflowid,workflowname,appid",order:"workflowname"},function(res){
					if (res.success) {
						for(var i=0;i<res.result.length;i++){
							var rec=res.result[i];
							var node = { count: "<a onclick='event.stopPropagation();deleteWorkflow(" + rec.workflowid + ")' title='Delete'>➖</a>", id: rec.workflowid, text: rec.workflowname, icon: 'nut-img-workflow' };
							var parent=lookup[rec.appid];
							if(!parent.nodes)parent.nodes=[];
							parent.nodes.push(node);
						};
						(w2ui['mnuMain']||new w2sidebar({
							name: 'mnuMain',
							flatButton: true,
							nodes: nodes,
							topHTML: "<input class='w2ui-input' style='width:100%' placeholder=" + w2utils.lang("_Search") + "/>",
							onClick: function (evt) {
								var node = evt.object;
								NUT.ds.select({ url: NUT.URL + "n_workflow", where: ["workflowid", "=", node.id] }, function (res) {
									if (res.success && res.result.length) {
										openWorkflow(node.parent.tag, res.result[0]);
									}
								});
							},
							onFlat: function (evt) {
								w2ui.layMain.sizeTo("left", this.flat ? 300 : 45);
								divLeft.style.width = (this.flat ? '300px' : '45px');
							}
						})).render(divLeft);
					}else NUT.notify("🛑 ERROR: " + res.result, "red");
				});
				NUT.ds.select({url:NUT.URL+"n_role",order:"rolename"},function(res2){
					var roleItems=[];
					for(var i=0;i<res2.result.length;i++){
						var item=res2.result[i];
						roleItems.push({id:item.roleid,text:item.rolename});
					}
					

					(w2ui['frmStep']||new w2form({
						name:'frmStep',
						header: 'Step',
						fields:[
							{ field: 'stepname', type: "text", disabled: true, html: { label: "Step Name", span: -1 } },
							{ field: 'status', type: "text", html: { label: "Status", span: -1 } },
							{ field: 'reject', type: "text", html: { label: "Reject Status", span: -1 } },
							{ field: 'duration', type: "int", html: { label: "Duration (hour)", span: -1 } },
							{ field: 'roleid', type: "select", required: true, html: { label: "Role", span: -1 }, options: { items: roleItems } },
							{ field: 'userid', type: "select", html: { label: "User", span: -1 } },
							{ field: 'windowid', type: "select", html: { label: "Window", span: -1 } },
						],
						onChange: function (evt) {
							var attrs=this.element.businessObject.$attrs;
							if (evt.target == "duration") attrs.duration=this.record.duration;
							if (evt.target == "status") attrs.status = this.record.status;
							if (evt.target == "reject") attrs.reject = this.record.reject;
							if (evt.target == "roleid") {
								attrs.roleid = this.record.roleid;
								var form = this;
								NUT.ds.select({ url: NUT.URL + "nv_roleuser_user", order: "username",where:["roleid","=",this.record.roleid] }, function (res2) {
									var userItems = [{ id: -1, text: "DIRECT MANAGER" }];
									for (var i = 0; i < res2.result.length; i++) {
										var item = res2.result[i];
										userItems.push({ id: item.userid, text: (item.username || item.fullname) });
									}
									form.set("userid", { options: { items: userItems } });
								});
							}
							if (evt.target == "userid") attrs.userid = this.record.userid;
							if (evt.target == "windowid") attrs.windowid = this.record.windowid;
						}
					})).render(divRight);
					divRight.style.display="none";

				});
			}else NUT.notify("⚠️ Site has no application", "yellow");
		});
	});
}
window.saveWorkflow=function(){
	NUT.openDialog({
		title: "💾 Save Workflow",
		width: 360,
		height: 200,
		div: "<table style='margin:auto'><tr><td align='right'>Name</td><td><input id='txtName' class='w2ui-input' value='"+(_bpmn.workflow?_bpmn.workflow.workflowname:"")+"'/></td></tr><tr><td align='right'>Description</td><td><textarea id='txtDescription' class='w2ui-input'>"+(_bpmn.workflow?_bpmn.workflow.description||"":"")+"</textarea></td></tr></table>",
		actions: {
			"_Close": function () {
				NUT.closeDialog();
			},
			"_Save": function (evt) {
				var elements = _bpmn.get("elementRegistry").getAll();
				var steps = [], lookup = {};
				var noStart =true,noEnd = true;
				for (var i = 0; i < elements.length; i++) {
					var ele = elements[i];
					if (ele.type == "bpmn:StartEvent" || ele.type == "bpmn:EndEvent" || ele.type == "bpmn:Task" || ele.type == "bpmn:ExclusiveGateway") {
						if (ele.type == "bpmn:StartEvent") noStart = false;
						if (ele.type == "bpmn:EndEvent") noEnd = false;
						var ins = [], outs = [];
						for (var j = 0; j < ele.outgoing.length; j++) {
							var o = ele.outgoing[j];
							outs.push({ id: o.target.id, label: o.businessObject.name });
						}
						for (var j = 0; j < ele.incoming.length; j++) {
							var p = ele.incoming[j];
							ins.push(p.source.id);
						}
						var attrs = ele.businessObject.$attrs;
						var step = { elementid: ele.id, steptype: ele.type, stepname: ele.businessObject.name, status: attrs.status, reject: attrs.reject, duration: attrs.duration, roleid: attrs.roleid, userid:attrs.userid, windowid:attrs.windowid, siteid: n$.siteid, ins: JSON.stringify(ins), outs: JSON.stringify(outs) };
						if (step.stepname && step.roleid) {
							steps.push(step);
							lookup[step.elementid] = true;
						} else {
							NUT.notify("Step " + (step.stepname ||ele.type) + " has no name or not assign any role!", "yellow");
							return;
						}
					}
				}
				if (noStart || noEnd) NUT.notify("Start/Stop-step not found!", "yellow");
				else {// save workflow
					_bpmn.saveXML().then(function (evt) {
						if (_bpmn.workflow) {//update
							var workflowid=_bpmn.workflow.workflowid;
							NUT.ds.select({ url: NUT.URL + "n_wfstep", where: ["workflowid", "=", workflowid]}, function (res) {
								if (res.success) {
									var inserts = [], updates = [], deletes = [];
									var lookupStep = {};
									for (var i = 0; i < res.result.length; i++) {
										var wf = res.result[i];
										lookupStep[wf.elementid] = true;
										if (!lookup[wf.elementid]) deletes.push(wf.stepid);
									}
									for (var i = 0; i < steps.length; i++) {
										var step = steps[i];
										if (lookupStep[step.elementid]) updates.push(step);
										else {
											step.workflowid=workflowid;
											inserts.push(step);
										}
									}
									_bpmn.workflow.workflowname=txtName.value;
									_bpmn.workflow.description=txtDescription.value;
									_bpmn.workflow.contentjson=evt.xml;
									NUT.ds.update({ url: NUT.URL + "n_workflow", data: _bpmn.workflow, key: "workflowid" }, function (res) {
										if (res.success) {
											if (deletes.length) NUT.ds.delete({ url: NUT.URL + "n_wfstep", where: ["stepid", "in", deletes] });
											if (updates.length) NUT.ds.update({ url: NUT.URL + "n_wfstep", data: steps, key:"elementid" });
											if (inserts.length) NUT.ds.insert({ url: NUT.URL + "n_wfstep", data: steps });
											NUT.notify("Workflow updated.", "lime");
										} else NUT.notify("🛑 ERROR: " + res.result, "red");
									});
								}else NUT.notify("🛑 ERROR: " + res.result, "red");
							});
						} else {//new
							_bpmn.workflow={
								siteid:n$.siteid,
								appid:_bpmn.appid,
								workflowname:txtName.value,
								description:txtDescription.value,
								contentjson:evt.xml
							}
							NUT.ds.insert({ url: NUT.URL + "n_workflow", data: _bpmn.workflow, returnid: true }, function (res) {
								if (res.success) {
									var newid = res.result[0];
									_bpmn.workflowid=newid;
									for (var j = 0; j < steps.length; j++)steps[j].workflowid = newid;
									NUT.ds.insert({ url: NUT.URL + "n_wfstep", data: steps }, function (res3) {
										if (res3.success) {
											var node = { id: newid, text: _bpmn.workflow.workflowname, icon: "nut-img-workflow", count: "<a onclick='event.stopPropagation();deleteWorkflow(" + newid + ")' title='Delete'>➖</a>" };
											w2ui.mnuMain.add("app_" + _bpmn.appid, node);
											NUT.notify("Workflow inserted.", "lime");
										}else NUT.notify("🛑 ERROR: " + res3.result, "red");
									});
								} else NUT.notify("🛑 ERROR: " + res.result, "red");
							});
						}
					});
				}
			}
		}
	});
}
window.deleteWorkflow=function(id){
	NUT.confirm('Delete selected workflow?', function (evt) {
		if (evt == "yes") NUT.ds.delete({ url: NUT.URL + "n_wfstep", where: ["workflowid", "=", id] }, function (res2) {
			if (res2.success) NUT.ds.delete({ url: NUT.URL + "n_workflow", where: ["workflowid", "=", id] }, function (res) {
				if (res.success) {
					w2ui.mnuMain.remove(id);
					NUT.notify("Workflow deleted.", "lime");
				} else NUT.notify("🛑 ERROR: " + res.result, "red");
			}); else NUT.notify("🛑 ERROR: " + res2.result, "red");
		});
	});
}

window.openWorkflow = function (appid,wf) {
	// modeler instance
	divMain.innerHTML = "";
	divSaveWorkflow.style.display = "";
	_bpmn = new BpmnJS({ container: divMain });

	if (wf) {
		_bpmn.importXML(wf.contentjson);
		_bpmn.workflow=wf;
	} else _bpmn.createDiagram();
	_bpmn.appid=appid;
	
	_bpmn.on('element.click', function (evt) {
		var ele = evt.element;
		var form = w2ui["frmStep"];
		var isStep = ele.type == "bpmn:StartEvent" || ele.type == "bpmn:EndEvent" || ele.type == "bpmn:Task" || ele.type == "bpmn:ExclusiveGateway";
		if (isStep) {
			var attrs = ele.businessObject.$attrs;
			form.record = {
				stepname: ele.businessObject.name,
				status: attrs.status,
				reject: attrs.reject,
				duration: attrs.duration,
				roleid: attrs.roleid,
				userid: attrs.userid,
				windowid: attrs.windowid
			}
			
			NUT.ds.select({ url: NUT.URL + "nv_roleuser_user",select:"userid,username,fullname", order: "username", where: ["roleid", "=", form.record.roleid] }, function (res) {
				if (res.success) {
					var userItems = [{ id: "", text: "" }, { id: -1, text: "DIRECT MANAGER" }];
					for (var i = 0; i < res.result.length; i++) {
						var item = res.result[i];
						userItems.push({ id: item.userid, text: (item.username || item.fullname) });
					}
					form.set("userid", { options: { items: userItems } });
				} else NUT.notify("🛑 ERROR: " + res.result, "red");
			});
			NUT.ds.select({ url: NUT.URL + "n_window", order: "windowname", where: [["windowtype", "=", "window"],["appid", "=", appid]] }, function (res2) {
				if (res2.success) {
					var winItems = [{ id: "", text: "" }];
					for (var i = 0; i < res2.result.length; i++) {
						var item = res2.result[i];
						winItems.push({ id: item.windowid, text: item.windowname });
					}
					form.set("windowid", { options: { items: winItems } });
				} else NUT.notify("🛑 ERROR: " + res2.result, "red");
			});
			form.refresh();
			
		}

		form.element = ele;
		divRight.style.display = isStep?"":"none";
	});
}