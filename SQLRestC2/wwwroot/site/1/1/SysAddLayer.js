var SysAddLayer={
	run:function(p){
		if(p.parent){
			this.app=p.parent;
			var self=this;
			NUT.ds.select({url:NUT.URL+"nv_appservice_table",where:[["appid","=",this.app.appid],["tabletype","=","gis"]]},function(tables){
				if(tables.length)
					NUT.ds.select({url:NUT.URL+"syslayer",where:["appid","=",self.app.appid]},function(res){
						var existLayers={};
						for(var i=0;i<res.length;i++) existLayers[res[i].tableid]=res[i];
						self.showDlgAdd(tables, existLayers)
					});
				else NUT.tagMsg("No table in any data service!","yellow");
			});
		}else NUT.tagMsg("No Service selected!","yellow");
	},
	showDlgAdd:function(tables, existLayers){
		var lookup={}, items=[], count=0;
		for(var key in existLayers)if(existLayers.hasOwnProperty(key)){
			lookup[existLayers[key].tableid]=true;
		}
		
		var fields=[];
		var lookupTable={};
		for(var i=0;i<tables.length;i++){
			var table=tables[i];
			lookupTable[table.tableid]=table;
			var fld={field:table.tableid,type:'checkbox',html:{label:table.tablename,group:table.servicename,attr:lookup[table.tableid]?"disabled":"tabindex=0"}};
			fields.push(fld);
		}

		var id="div_SysAddLayer";
		var self=this;
		w2popup.open({
			title: '🗺️ <i>Add layers from tables</i>',
			width: 700,
			height: 500,
			body: '<div id="'+id+'" class="nut-full"></div>',
			onOpen:function(evt){
				evt.onComplete=function(){
					var div=document.getElementById(id);
					w2ui[id]?w2ui[id].render(div):
					$(div).w2form({ 
						name: id,
						fields: fields,
						record:lookup,
						actions: {
							"⛌ Close":function(){
								w2popup.close();
							},
							"✔️ Add layers":function(){
								var change=this.getChanges();
								var layers=[],i=0;
								for(var key in change)if(change.hasOwnProperty(key)){
									if(change[key]){
										var table=lookupTable[key];
										i++;
										layers.push({layername:table.tablename,alias:table.alias,seqno:i,layerindex:i,appid:table.appid,serviceid:table.serviceid,tableid:table.tableid,siteid:_context.user.siteid});
									}
								}
								self.insertLayers(layers);
							}
						}
					});
				}
			}
		});
	},
	insertLayers:function(layers){
		NUT.ds.insert({url:NUT.URL+"syslayer",data:layers},function(res){
			if(res.length)NUT.tagMsg("Records inserted.","lime");
		});
	}
}