var Com_HrmsInQuyetDinhChamDutHD={
	run:function(p){
		var self=this;
		if(p){
			if(p.records.length)this.inHopDong(p.records[0]);
			else NUT.tagMsg("Không có bản ghi nào được chọn!","yellow");
		}else NUT_DS.select({url:_context.service["hrms"].urledit+"hopdonglaodong",order:"ngaykyhd.desc",where:["manhanvien","=",_context.user.username]},function(res){
			self.inHopDong(res[0]);
		});
	},
	inHopDong:function(hd){
		NUT_DS.select({url:_context.service["hrms"].urledit+"nhansu",where:["manhanvien","=",hd.manhanvien]},function(res){
			if(res.length){
				var nv=res[res.length-1];
				var win_hd=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/In_QuyetDinhChamDutHD.html");
				win_hd.onload=function(){
					var ymd=hd.ngaythoiviec?hd.ngaythoiviec.split("-"):["","",""];
					
					//hopdong
					this.hd_sohopdong.innerHTML="Số: "+(nv.sohoso||"........")+"/"+(ymd[0]||"....")+"/QĐNV-"+nv.vitrilv;
					this.hd_ngaythangnam.innerHTML="Hà Nội, ngày "+(ymd[2]||".....")+" tháng "+(ymd[1]||".....")+" năm "+(ymd[0]||"........");
					this.hd_hoten1.innerHTML=this.hd_hoten2.innerHTML=this.hd_hoten3.innerHTML=this.hd_hoten4.innerHTML=this.hd_hoten5.innerHTML=this.hd_hoten6.innerHTML=this.hd_hoten7.innerHTML=(nv.gioitinh=="Nu"?"Bà ":"Ông ")+nv.hoten||"";
					//this.hd_quoctich.innerHTML=_context.domain[22].lookup[nv.quoctich]||"";
					this.hd_ngaysinh.innerHTML=NUT.dmy(nv.ngaysinh)||"";
					//this.hd_gioitinh.innerHTML=_context.domain[20].lookup[nv.gioitinh]||"";
					//this.hd_noio.innerHTML=nv.noio||"";
					this.hd_diachitt.innerHTML=nv.diachitt||"";
					this.hd_socmt.innerHTML=nv.socmt||"";
					//this.hd_ngaycapcmt.innerHTML=NUT.dmy(nv.ngaycapcmt)||"";
					//this.hd_noicapcmt.innerHTML=nv.noicapcmt||"";
					this.hd_dienthoai.innerHTML=nv.dienthoai||"";
					this.hd_ngayqd.innerHTML=this.hd_ngayqd2.innerHTML=NUT.dmy(hd.ngaythoiviec)||"";
					//this.hd_diadiemlv.innerHTML=(nv.diadiemlv||"")+" - "+(_context.domain[9].lookup[nv.makhuvuc]||"");
					this.hd_vitrilv.innerHTML=this.hd_vitrilv2.innerHTML=_context.domain[14].lookup[nv.vitrilv]||"";
					
					this.print();
				}
			} else NUT.tagMsg("Không có dữ liệu hợp đồng!","yellow");
		});
	}
}