var SysCacheDomain={
	run:function(p){
		if(p.records.length){
			this.service=p.records[0];
			var self=this;
			NUT.ds.select({url:NUT.URL+"systable",where:[["serviceid","=",this.service.serviceid],["iscache","=",true]]},function(res){
				if(res.length){
					lookup={};
					for(var i=0;i<res.length;i++)lookup[res[i].tablename]=res[i];
					self.showDlgCache(lookup);
				} else w2alert("There is no cache domain table in service","Inform");
			});
		}else NUT.tagMsg("No Data Service selected!","yellow");
	},
	
	showDlgCache:function(lookup){
		var fields=[],i=0;
		for(var key in lookup)if(lookup.hasOwnProperty(key))
			fields.push({field:key,type:'checkbox',html:{column:i++%2}});
		var self=this;
		var id="divCom_SysCacheDomain";
		w2popup.open({
			title: '📥 <i>Cache domains</i>',
			modal:true,
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
							"✔️ Cache":function(){
								for(key in this.record)if(this.record.hasOwnProperty(key)){
									if(this.record[key])self.cacheDomain(lookup[key]);
								}
							}
						}
					});
				}
			}
		});
	},
	cacheDomain:function(table){
		NUT.ds.select({url:table.urledit,select:[table.columnkey,table.columndisplay]},function(res){
			var domains=[];
			for(var i=0;i<res.length;i++)domains.push([res[i][table.columnkey],res[i][table.columndisplay]]);
			var data={
				siteid:_context.user.siteid,
				//appid:_context.curApp.appid,
				domainname:table.tablename,
				domain:JSON.stringify(domains)
			};
			NUT.ds.update({url:NUT.URL+"sysdomain",where:["tableid","=",table.tableid],data:data},function(res){
				NUT.tagMsg("Domain cache updated.","lime");
			});
		});
	}
}