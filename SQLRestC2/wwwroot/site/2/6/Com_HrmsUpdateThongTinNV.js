var Com_HrmsUpdateThongTinNV={
	run:function(p){
		this.conf=p.config;
		var id="divCom_HrmsUpdateThongTinNV";
		var fieldnames=["mastt","manhanvien","quanlytructiep","socmt","ngaycapcmt","noicapcmt","masothue","dienthoai","email","hocvan","diadiemlv","sotaikhoan","nganhang","chinhanhnh","tinhtranglv","vitrilv","ngaybatdaulv","ngaynghilv","lydonghilv","ngaybatdautv","ngayketthuctv","ngaykyhd","ngayhethd","ghichu"];
		var header=fieldnames.join('\t')+"\n";
		w2popup.open({
			title:"📥 <i>Cập nhật thông tin nhân viên từ Excel</i>",
			modal:true,
			width: 1000,
			height: 700,
			body: '<textarea cols='+(header.length+8*fieldnames.length)+' id="'+id+'" style="height:100%">'+header+'</textarea>',
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsUpdateThongTinNV.update('+id+'.value)">✔️ Update</button>'
		});
	},
	update:function(csv){
		var lines=csv.split('\n');
		if(lines.length<2){
			NUT.tagMsg("Empty data","yellow");
		}else{
			var domain={},prikey=null,privalue=null;
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
					var value=(values[j]===""?null:values[j]);
					if(key==prikey)privalue=value;
					else json[key]=domain[key]?domain[key][value]:value;
				}
				NUT.ds.update({url:this.conf.urledit,where:[prikey,"=",privalue],data:json},function(res){
					NUT.tagMsg("Record updated.","lime");
				});
			}

		}
	}
}