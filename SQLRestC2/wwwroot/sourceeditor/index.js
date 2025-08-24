import { w2ui, w2layout, w2utils, w2sidebar, w2grid, w2tabs, w2confirm, w2popup, w2prompt } from "../../lib/w2ui.es6.min.js";
import { SqlREST } from "../js/sqlrest.js";
import { FMan } from "../js/fileman.js";

NUT.ds = SqlREST;
NUT.FMan=FMan;
NUT.w2ui = w2ui;
NUT.w2utils = w2utils;
NUT.w2confirm = w2confirm;
NUT.w2popup = w2popup;
NUT.w2prompt = w2prompt;

window.onload = function () {
	var strs=(window.location.search.substring(1)).split("&");
	for(var i=0;i<strs.length;i++){
		var str=strs[i].split("=");
		n$[str[0]]=str[1];
	}
	if (n$.theme && n$.theme != "w2ui.min") cssMain.href = "../lib/" + n$.theme + ".css";
	SqlREST.token = "Bearer " + n$.token;
	w2utils.locale(n$.locale).then(function (evt) {
		n$.lang = n$.locale.substring(0, 2);
		n$.phrases = evt.data.phrases;
		document.body.innerHTML = "<div id='divApp'></div>";
		NUT.appinfo = '<img width="64" height="64" src="favicon.ico"/><br/><h2><b style="color:brown">Source Editor</b></h2><br/><hr/><br/><h3>Source Editor for Designer</h3>';
		(w2ui["layMain"] || new w2layout({
			name: "layMain",
			style: "width:100%;height:100%;top:0;margin:0",
			panels: [
				{ type: 'top', size: 38, html: '<div id="divTop" class="nut-full"><img id="imgLogo " height="24" src="favicon.ico"/><i class="nut-link"> Source Editor 1.0</i></div>' },
				{ type: 'left', size: NUT.isMobile ? "100%" : 300, resizable: true, html: '<div id="divLeft" class="nut-full"></div>' },
				{ type: 'main', html: '<div id="divMain" class="nut-full"><div id="divAttach" class="nut-win-title">'+NUT.appinfo+'</div></div>',
					toolbar: {
						items: [
							{ type: 'button', id: 'SAVE', text: '_Save' },
							{ type: 'button', id: 'VIEW', text: '_Preview' }
						],
						onClick(evt) {
							switch(evt.object.id){
								case "SAVE":
									FMan.saveAttaContent();
									break;
								case "VIEW":
									if(n$.windiv&&n$.windiv.tag)window.open(FMan.root+FMan.base+"/"+n$.windiv.tag.id);
									else NUT.notify("⚠️ No file selected!", "yellow");
									break;
							}
						}
					}
				}
			],
		})).render(divApp);

		FMan.url=NUT.URL_SOURCE;
		FMan.root="/site/";
		NUT.ds.select({ url: NUT.URL + "n_app", order: "orderno", where: ["apptype", "<>", "engine"] }, function (res) {
			if (res.success && res.result.length) {
				var nodes=[];
				for (var i = 0; i < res.result.length; i++) {
					var rec = res.result[i];
					nodes.push({ id: rec.appid, text: rec.appname, icon: "nut-img-app", tag:""});
				}
				(w2ui[FMan.ID] || new w2sidebar({
					name: FMan.ID,
					flatButton: true,
					nodes:nodes,
					topHTML: "<table><tr><td><input placeholder='" + NUT.w2utils.lang("_Search") + "' class='w2ui-input'/></td><td><button disabled id='attaCreateFolder' class='nut-but-helper' title='Create Folder' onclick='NUT.FMan.attaCreateFolder_onClick()'>&nbsp;📁&nbsp;</button></td><td style='background-image:url(\"../img/upload.png\");background-repeat:no-repeat;background-position:center'><input disabled id='attaFile' type='file' style='width:40px;height:40px;opacity:0' onchange='NUT.FMan.attaFile_onChange()' title='Upload File'/></td></tr></table>",
					bottomHTML: "<small style='float:right' id='attaInfo'></small>",
					onClick: function (evt) {
						var tree = this;
						var node = evt.object;
						var node2=evt.object;
						while(!(node2.parent instanceof w2sidebar))node2=node2.parent;
						FMan.base=n$.siteid+"/"+node2.id;
						attaCreateFolder.disabled=false;
						attaFile.disabled=false;
						if (node.icon=="nut-file-folder"||node.icon=="nut-img-app") {
							if (node.nodes && node.nodes.length) attaInfo.innerHTML = node.nodes.length + " file(s)";
							else FMan.loadFolderNodes(node.icon=="nut-img-app"?"":node.id , function (nodes) {
								node.expanded = true;
								tree.add(node, nodes);
								attaInfo.innerHTML = node.nodes.length + " file(s)";
							});
						} else {
							var a = NUT.createWindowTitle(node.id, divAttach);
							if(a){
								FMan.previewFile(a.div,node);
								a.innerHTML=node.id
							}
						}
					},
					onFlat: function (evt) {
						w2ui.layMain.sizeTo("left", this.flat ? 300 : 45);
						divLeft.style.width = (this.flat ? '300px' : '45px');
					}
				})).render(divLeft);

			} else NUT.notify("⚠️ Site has no application", "yellow");
		});
	});
}

