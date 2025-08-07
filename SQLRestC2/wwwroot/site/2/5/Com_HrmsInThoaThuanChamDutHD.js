var Com_HrmsInThoaThuanChamDutHD={
	run:function(p){
		var self=this;
		if(p){
			if(p.records.length)this.inThoaThuan(p.records[0]);
			else NUT.tagMsg("Không có bản ghi nào được chọn!","yellow");
		}else NUT_DS.select({url:_context.service["hrms"].urledit+"hopdonglaodong",order:"ngaykyhd.desc",where:["manhanvien","=",_context.user.username]},function(res){
			self.inThoaThuan(res[0]);
		});
	},
	inThoaThuan:function(hd){
		NUT_DS.select({url:_context.service["hrms"].urledit+"nhansu",where:["manhanvien","=",hd.manhanvien]},function(res){
			if(res.length){
				var nv=res[res.length-1];
				
				var win_hd=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/In_ThoaThuanChamDutHD.html");
				win_hd.onload=function(){
					var ymd=hd.ngaythoiviec?hd.ngaythoiviec.split("-"):["","",""];
					
					//hopdong
					this.sohopdong.innerHTML=(nv.sohoso||"..........")+"/"+(ymd[0]||"....")+"/HĐLĐ-"+nv.vitrilv;
					this.ngaythangnam.innerHTML=(ymd[2]||".....")+" tháng "+(ymd[1]||".....")+" năm "+(ymd[0]||"........");
					this.hoten.innerHTML=this.hoten2.innerHTML=nv.hoten||"";
					this.quoctich.innerHTML=_context.domain[22].lookup[nv.quoctich]||"";
					this.ngaysinh.innerHTML=NUT.dmy(nv.ngaysinh)||"";
					this.gioitinh.innerHTML=_context.domain[20].lookup[nv.gioitinh]||"";
					this.noio.innerHTML=nv.noio||"";
					this.hokhau.innerHTML=nv.diachitt||"";
					this.socmt.innerHTML=nv.socmt||"";
					this.ngaycap.innerHTML=NUT.dmy(nv.ngaycapcmt)||"";
					this.noicap.innerHTML=nv.noicapcmt||"";

					this.ngaykyhd.innerHTML=NUT.dmy(hd.ngaykyhd)||"";
					this.ngaythoiviec.innerHTML=this.ngaythoiviec2.innerHTML=NUT.dmy(hd.ngaythoiviec)||"";

					this.print();
				}
			} else NUT.tagMsg("Không có dữ liệu hợp đồng!","yellow");
		});
	}
}