var Com_HrmsInDonXinNghiViec={
	run:function(p){
		var self=this;
		if(p){
			if(p.records.length)this.inDon(p.records[0]);
			else NUT.tagMsg("Không có bản ghi nào được chọn!","yellow");
		}else NUT_DS.select({url:_context.service["hrms"].urledit+"hopdonglaodong",order:"ngaykyhd.desc",where:["manhanvien","=",_context.user.username]},function(res){
			self.inDon(res[0]);
		});
	},
	inDon:function(hd){
		NUT_DS.select({url:_context.service["hrms"].urledit+"nhansu",where:["manhanvien","=",hd.manhanvien]},function(res){
			if(res.length){
				var nv=res[res.length-1];
				
				var win_hd=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/In_DonXinNghiViec.html");
				win_hd.onload=function(){

					var ymd=hd.ngaythoiviec?(new Date(new Date(hd.ngaythoiviec).getTime()-10*86400000).toISOString().substring(0,10)).split("-"):["","",""];
					
					//hopdong
					this.ngaythangnam.innerHTML="Hà Nội, ngày "+(ymd[2]||".....")+" tháng "+(ymd[1]||".....")+" năm "+(ymd[0]||"........");
					this.hoten.innerHTML=this.hoten2.innerHTML=nv.hoten||"";
					this.ngaysinh.innerHTML=NUT.dmy(nv.ngaysinh)||"";
					this.socmt.innerHTML=nv.socmt||"";
					this.noilamviec.innerHTML=(nv.diadiemlv||"")+" - "+(_context.domain[9].lookup[nv.makhuvuc]||"");
					this.vitrilv.innerHTML=_context.domain[14].lookup[nv.vitrilv]||"";
					this.ngaythoiviec.innerHTML=NUT.dmy(hd.ngaythoiviec)||"";
					this.lydothoiviec.innerHTML=hd.lydothoiviec||"";
					
					this.print();
				}
			} else NUT.tagMsg("Không có dữ liệu hợp đồng!","yellow");
		});
	}
}