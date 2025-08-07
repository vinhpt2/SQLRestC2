var Com_HrmsUpdateKetQuaPV={
	run:function(p){
		this.conf=p.config;
		var id="divCom_HrmsUpdateKetQuaPV";
		var fieldnames=["mastt","nguoipv","pvlan1","pvlan2","tinhtranglv","ghichupv","ngaypv","ngaybatdaulv"];
		var header=fieldnames.join('\t')+"\n";
		w2popup.open({
			title:"📥 <i>Import kết quả phỏng vấn từ Excel</i>",
			modal:true,
			width: 1000,
			height: 700,
			body: '<textarea cols='+(header.length+8*fieldnames.length)+' id="'+id+'" style="height:100%">'+header+'</textarea>',
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsUpdateKetQuaPV.update('+id+'.value)">✔️ Update</button>'
		});
	},
	update:function(csv){
		var lines=csv.split('\n');
		if(lines.length<2){
			NUT.tagMsg("Empty data","yellow");
		}else{
			var domain={},prikey=null;
			for(var i=0;i<this.conf.fields.length;i++){
				var fld=this.conf.fields[i];
				if(fld.domainid)domain[fld.fieldname]=_context.domain[fld.domainid].lookdown;
				if(fld.isprikey)prikey=fld.fieldname;
			}

			var header=lines[0].split('\t');
			
			for(var i=1;i<lines.length;i++){
				var values=lines[i].split('\t');
				var json={};
				for(var j=0;j<values.length;j++){
					var key=header[j];
					json[key]=domain[key]?domain[key][values[j]]:values[j];
				}
				NUT_DS.update({url:this.conf.urledit,where:[prikey,"=",json[prikey]],data:json},function(res){
					NUT.tagMsg("Record updated.","lime");
				});
			}

		}
	}
}