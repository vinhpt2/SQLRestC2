var _context=null;
var _report={filter:"",parameter:{Parameter:{_order:[]}}};
var _record=null;
var _func=["()","sum()","NUT.loginUser()","NUT.now()","NUT.nowDate()","NUT.nowMonth()","NUT.nowYear()","NUT.fNum()","NUT.fDate()","NUT.num2text()"];

function body_onLoad(){
	var user=_context.user;
	PgREST.auth=["Bearer "+user.ssign,"Bearer "+user.sign];
	
	$(divRpt_Layout).w2layout({
		name: "layoutMain",
		panels: [
			{ type: 'top', size: '28px', content: '<div id="divRpt_Top"></div>' },
			{ type: 'left', size: '310px', resizable: true, content: '<div id="divRpt_Left" class="nut-full"></div>' },
			{ type: 'main', content: '<div id="divRpt_Tool"></div><div id="divRpt_Html" class="nut-full" contentEditable="true" style="background:white" ondragover="allowDrop()" ondrop="drop()">[Copy Excel/Word & Paste here]</div><textarea id="txtRpt_Code" class="nut-full" style="color:white;background:black;font:10pt Courier;display:none"></textarea>' },
			{ type: 'right', size:'440px', resizable: true, content: '<div id="divRpt_Right" class="nut-full"><div id="divRpt_Tab"></div><div class="nut-full" id="divRpt_tabSource"><div id="capSource">Click Connect to Open</div><table id="tblRpt_Source" border="1"></table></div><div id="divRpt_tabFilter" style="display:none">Where: <textarea id="txtRpt_Filter" style="width:100%"></textarea></div><div id="divRpt_tabPara" style="display:none"></div></div>' }
		]
	});
	
	loadMenu()
	//Parameter
	var id="divRpt_tabPara";
	var div=document.getElementById(id);
	
	if(w2ui[id]){
		w2ui[id].record=_report.parameter;
		w2ui[id].render(div);
	} else $(div).w2form({ 
		name: id,
		fields: [{field:'Parameter',type:'map',html:{key:{attr:'placeholder="Parameter name"',text:' = '},value:{attr:'placeholder="Default value"'}}}],
		record: _report.parameter
	})
	
	$('#divRpt_Tab').w2tabs({
		name: 'divRpt_Tab',
		tabs: [{id:"tabSource",text:"Data source"},{id:"tabFilter",text:"Filter"},{id:"tabPara",text:"Parameter"}],
		active: "tabSource",
		onClick:function(evt){
			var id=evt.tab.id;
			for(var i=0;i<this.tabs.length;i++){
				var tab=this.tabs[i];
				var divTab=document.getElementById("divRpt_"+tab.id);
				divTab.style.display=(tab.id==id)?"":"none";
			}
			if(id=="tabPara")w2ui["divRpt_tabPara"].resize();
		}
	});
	$(divRpt_Top).w2toolbar({
		name: "divRpt_Top",
		items: [{type:'html',id:"LOGO",html:'<i class="nut-link"><img id="imgClientLogo" width="20" height="20" src="favicon.ico"/> Report 1.0 > '+user.username+'</i>'},
			{type:'spacer'},
			{type:'button',id:"CONN",text:'📡 Connect',tooltip:"Connect to Data source"},
			{type:'button',id:"SAVE",text:'💾 Save',tooltip:"Save Report"},
			{type:'button',id:"VIEW",text:'🖨️ Preview',tooltip:"Preview Report"}],
		onClick:tool_onClick
	})
	$(divRpt_Tool).w2toolbar({
		name: "divRpt_Tool",
		items: [{type:'button',id:"bold",text:'<b>B</b>',tooltip:"Bold font [Ctrl+B]"},
			{type:'button',id:"italic",text:'<i><b>I</b></i>',tooltip:"Italic font [Ctrl+I]"},
			{type:'button',id:"underline",text:'<i><b>U</b></i>',tooltip:"Underline font [Ctrl+U]"},
			{type:'button',id:"strikeThrough",text:'<s><b>S</b></s>',tooltip:"Strike font"},
			{type:'button',id:"increaseFontSize",text:'🗚',tooltip:"Increase size (firefox)"},
			{type:'button',id:"decreaseFontSize",text:'🗛',tooltip:"Decrease size (firefox)"},
			{type:'button',id:"justifyLeft",text:'├',tooltip:"Left text"},
			{type:'button',id:"justifyCenter",text:'┼',tooltip:"Center text"},
			{type:'button',id:"justifyRight",text:'┤',tooltip:"Right text"},
			{type:'button',id:"justifyFull",text:'≡',tooltip:"Justify text"},
			{type:'button',id:"indent",text:'»',tooltip:"Indent in"},
			{type:'button',id:"outdent",text:'«',tooltip:"Indent out"},
			{type:'button',id:"undo",text:'⭯',tooltip:"Undo [Ctrl+Z]"},
			{type:'button',id:"redo",text:'⭮',tooltip:"Redo [Ctrl+Y]"},
			{type:'spacer'},
			{type:'button',id:"detail",text:'📑 Detail',tooltip:"Set Table Detail"},
			{type:'button',id:"id",text:'🆔 Set ID',tooltip:"Set Element ID"},
			{type:'break'},
			{type:'check',id:"code",text:'-/-',tooltip:"Show code"}],
		onClick:tool_onClick
	})
}

function newReport(){
	w2confirm('Create new report? Current changes will NOT SAVE.').yes(function(){
		_report={filter:"",parameter:{Parameter:{_order:[]}}};
		_record=null;
		divRpt_Html.innerHTML=txtRpt_Code.value="[Copy Excel/Word & Paste here]";
		txtRpt_Filter.value="";
		tblRpt_Source.innerHTML="";
		var form=w2ui["divRpt_tabPara"];
		form.record=_report.parameter;
		form.refresh("Parameter");
	});
}
function loadMenu(){
	NUT_DS.select({srl:"syswindow",order:"windowname",where:[["siteid","=",_context.user.siteid],["windowtype","=","report"]]},function(res){
		var nodes=[], lookup={};			
		for(var i=0;i<res.length;i++){
			var rec=res[i];
			var node={count:'<span onclick="delete_onClick('+rec.windowid+')" title="Delete">❌</span>', id:rec.windowid, text: rec.windowname, img: 'icon-page', tag:rec};
			if(lookup[rec.applicationid]){//has parent
				lookup[rec.applicationid].nodes.push(node)
			}else{
				var parent={type:'menu', id:"app_"+rec.applicationid, text: _context.apps[rec.applicationid].name, group:true, expanded:true, nodes:[node]};
				lookup[rec.applicationid]=parent;
				nodes.push(parent);
			}
		};
		var id='menuleft';
		if(w2ui[id]){
			w2ui[id].nodes=nodes;
			w2ui[id].render(divRpt_Left);
		}else $(divRpt_Left).w2sidebar({name:id,topHTML:"<button style='margin:3px;padding:5px' onclick='newReport()'>📝 New Report</button><button style='float:right;margin:3px;padding:5px' onclick='loadMenu()' title='Refresh'> ⭯ </button>",nodes: nodes,onClick:menu_onClick});
	});
}
function menu_onClick(evt){
	var tag=evt.item?((!evt.item.group)?evt.item.tag:(evt.subItem&&!evt.subItem.group?evt.subItem.tag:null)):evt.node.tag;
	if(tag){
		_record=tag;
		NUT_DS.select({srl:"syscache",where:["windowid","=",tag.windowid]},function(res){
			if(res.length){
				_report=zipson.parse(res[0].config);
				_report.name=_record.windowname;
				divRpt_Html.innerHTML=_report.html;
				txtRpt_Code.value=_report.html;
				txtRpt_Filter.value=_report.filter;
				var form=w2ui["divRpt_tabPara"];
				form.record=_report.parameter;
				form.refresh("Parameter");
				loadDataSource();
			}
		});
	}
}
function delete_onClick(reportid){
	this.event.stopPropagation();
	w2confirm('<span style="color:red">Delete selected Report?</span>').yes(function(){
		var where=["windowid","=",reportid];
		NUT_DS.delete({srl:"syscache",where:where},function(){
			NUT_DS.delete({srl:"syswindow",where:where},function(){
				NUT.tagMsg("Report deleted.","lime");
			})
		})
	 });
}
function tool_onClick(evt){
	var item=evt.subItem?evt.subItem:evt.item;
	switch(item.id){
		case "id":
			var node=window.getSelection().baseNode;
			while(node){
				if(node.tagName=="SPAN")break;
				node=node.parentNode;
			}
			if(node){
				w2prompt({label:"{"+node.innerHTML+"} ID",title:"Set element ID",value:node.id}).ok(function(value){
					if(value&&value!=node.id){
						var ele=document.getElementById(value);
						if(ele){
							ele.id="";
							ele.title="";
						}
						node.id=value;
						node.title=value;
					}
				});
			}else NUT.tagMsg("Click a element to set as ID","yellow");
			break;
		case "detail":
			var node=window.getSelection().baseNode;
			while(node){
				if(node.tagName=="TR")break;
				node=node.parentNode;
			}
			if(node){
				var ele=document.getElementById("rowDetail");
				if(ele)ele.id="";
				node.id="rowDetail";
			}else NUT.tagMsg("Click a row to set as Detail","yellow");
			break;
		case "CONN":
			NUT_DS.select({srl:"sysservice",order:"servicename",where:["siteid","=",_context.user.siteid]},function(services){
				var cbo=document.createElement("select");
				cbo.id="cboRpt_Service";
				for(var i=0;i<services.length;i++){
					var service=services[i];
					var opt=document.createElement("option");
					opt.value=service.serviceid;
					opt.innerHTML=service.servicename;
					cbo.add(opt);
				}
				cbo.setAttribute("onchange","cboRpt_Service_onChange(this.value)");
				w2popup.open({
					title: '📡 <i>Connect to Service</i>',
					modal:true,
					width: 320,
					height: 150,
					body: "<table style='margin:auto'><tr><td>Service*</td><td>"+cbo.outerHTML+"</td></tr><tr><td>Table*</td><td><select id='cboRpt_Table' style='width:100%'></select></td></tr></table>",
					buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="_report.tableid=cboRpt_Table.value;_report.tableurl=cboRpt_Table.options[cboRpt_Table.selectedIndex].tag;loadDataSource();w2popup.close()">✔️ Connect</button>'
				});
				cboRpt_Service_onChange(cbo.value);
			});
			break;
		case "SAVE":
			var items=[];
			for(var key in _context.apps)if(_context.apps.hasOwnProperty(key)){
				var app=_context.apps[key];
				if(app.type=="app"&&app.applicationid)items.push({id:app.applicationid,text:app.name});
			}
			var id="dlgReport_Save";
			w2popup.open({
				title:"💾 Report save",
				modal:true,
				width: 500,
				body: '<div id="'+id+'" class="nut-full"></div>',
				onOpen:function(evt){
					evt.onComplete=function(){
						var div=document.getElementById(id);
						_report.parameter
						if(w2ui[id]){
							w2ui[id].record=_record;
							w2ui[id].render(div);
						}else $(div).w2form({ 
							name: id,
							fields: [{field:'windowid',disabled:true,type:'text',html:{label:"Report ID"}},
								{field:'applicationid',type:'select',required:true,options:{items:items},html:{label:"Application"}},
								{field:'windowname',required:true,type:'text',html:{label:"Report name"}},
								{field:'description',type:'textarea',html:{label:"Description"}}],
							record:_record,
							actions: {
								"⛌ Close": function () {
									w2popup.close();
								},
								"✔️ Ok": function (evt) {
									_report.parameter=w2ui["divRpt_tabPara"].record;
									_report.html=divRpt_Html.innerHTML;
									_report.filter=txtRpt_Filter.value;
									this.record.siteid=_context.user.siteid;
									this.record.windowtype="report";
										
									if(_record){//update report
										_record=this.record;
										var where=["windowid","=",_record.windowid];
										NUT_DS.update({srl:"syswindow",data:_record,where:where},function(res){
											NUT_DS.update({srl:"syscache",data:{config:zipson.stringify(_report)},where:where},function(res){
												NUT.tagMsg("Report's updated.","lime");
											});
										});
									}else{
										NUT_DS.insert({srl:"syswindow",data:this.record},function(res){
											if(res.length){
												_record=res[0];
												NUT_DS.insert({srl:"syscache",data:{siteid:_record.siteid,applicationid:_record.applicationid,windowid:_record.windowid,config:zipson.stringify(_report)}},function(res){
													NUT.tagMsg("Report's inserted.","lime");
												});
											} else NUT.tagMsg("Insert syswindow error!","red");
										});
									}
									
									w2popup.close();
								}
							}
						})
					}
				}
			});
			break;
		case "VIEW":
			_report.parameter=w2ui["divRpt_tabPara"].record;
			_report.html=divRpt_Html.innerHTML;
			_report.filter=txtRpt_Filter.value;
			NUT.runReport(_report);
			break;
		case "CLOSE":
			w2popup.close();
			break;
		case "code":
			if(item.checked)divRpt_Html.innerHTML=txtRpt_Code.value;
			else txtRpt_Code.value=divRpt_Html.innerHTML;
			divRpt_Html.style.display=(item.checked?"":"none");
			txtRpt_Code.style.display=(item.checked?"none":"");
			break;
		default:
			document.execCommand(item.id);
			break;
	}
}

function cboRpt_Service_onChange(value){
	NUT_DS.select({srl:"systable",order:"tablename",where:["serviceid","=",value]},function(tables){
		cboRpt_Table.innerHTML="";
		for(var i=0;i<tables.length;i++){
			var table=tables[i];
			var opt=document.createElement("option");
			opt.value=table.tableid;
			opt.innerHTML=table.tablename;
			opt.tag=table.urledit;
			cboRpt_Table.add(opt);
		}
	});
}
function loadDataSource(){
	if(_report.tableid)NUT_DS.select({srl:"syscolumn",order:"columnname",where:["tableid","=",_report.tableid]},function(columns){
		tblRpt_Source.innerHTML="<th>Field</th><th>Function</th><th>Parameter</th>";
		capSource.innerHTML=_report.tableurl;
		var paras=_report.parameter.Parameter._order;
		columns.unshift({columnname:"@stt"});
		for(var i=0;i<columns.length;i++){
			var column=columns[i];
			var row=tblRpt_Source.insertRow();
			row.innerHTML="<td><span class='"+RPT_VAR_CLASS+"' draggable='true' ondragstart='drag()'>"+(i?"r."+column.columnname:column.columnname)+"</span></td>"+(i<_func.length?"<td><span class='"+(i>=2?RPT_FUNC_CLASS:RPT_SUM_CLASS)+"' draggable='true' ondragstart='drag()'>"+_func[i]+"</span></td>":"<td></td>")+(i<paras.length?"<td><span class='"+RPT_PARA_CLASS+"' draggable='true' ondragstart='drag()'>p['"+paras[i]+"']</span></td>":"<td></td>");
		}
	});
}
function drag(){
	this.event.dataTransfer.setData("html", this.event.target.outerHTML);
}
function allowDrop() {
	this.event.preventDefault();
}
function drop() {
	var evt=this.event;
	evt.preventDefault();
	
	var range=document.caretRangeFromPoint(evt.clientX, evt.clientY);
	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
	divRpt_Html.focus();
	document.execCommand('insertHTML',false, "&nbsp;"+evt.dataTransfer.getData("html")+"&nbsp;");
}
